// Server-only utility to execute processor scripts in a child process.
// Uses child_process.exec to avoid Turbopack's static analysis issues.

import path from "path";
import fs from "fs/promises";
import os from "os";

const PROCESSORS_DIR = path.join(process.cwd(), "processors");

/**
 * Run a JS processor in a child Node.js process.
 * Input and output are exchanged via temp files to avoid memory limits.
 */
export async function runJsProcessor(
  processorFile: string,
  functionName: string,
  inputBuffer: Buffer,
  options: Record<string, unknown> = {}
): Promise<{ buffer: Buffer; metadata: Record<string, unknown> }> {
  const tmpDir = os.tmpdir();
  const id = `ms-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const inputPath = path.join(tmpDir, `${id}-input`);
  const outputPath = path.join(tmpDir, `${id}-output`);
  const metaPath = path.join(tmpDir, `${id}-meta.json`);

  try {
    // Write input buffer to temp file
    await fs.writeFile(inputPath, inputBuffer);

    // Create wrapper script
    const wrapperScript = `
      const fs = require('fs');
      const path = require('path');
      const processorPath = path.join(${JSON.stringify(path.join(PROCESSORS_DIR, "js"))}, ${JSON.stringify(processorFile)});
      const mod = require(processorPath);
      const inputBuffer = fs.readFileSync(${JSON.stringify(inputPath)});
      const options = ${JSON.stringify(options)};

      async function run() {
        const result = await mod.${functionName}(inputBuffer, options);
        if (Buffer.isBuffer(result)) {
          fs.writeFileSync(${JSON.stringify(outputPath)}, result);
          fs.writeFileSync(${JSON.stringify(metaPath)}, JSON.stringify({}));
        } else if (result && result.buffer) {
          fs.writeFileSync(${JSON.stringify(outputPath)}, result.buffer);
          fs.writeFileSync(${JSON.stringify(metaPath)}, JSON.stringify(result.metadata || {}));
        } else {
          // JSON result (e.g., color picker)
          fs.writeFileSync(${JSON.stringify(metaPath)}, JSON.stringify(result || {}));
        }
      }
      run().catch(e => { console.error(e.message); process.exit(1); });
    `;

    const wrapperPath = path.join(tmpDir, `${id}-wrapper.js`);
    await fs.writeFile(wrapperPath, wrapperScript);

    // Execute using exec to avoid Turbopack analyzing the binary path
    const { exec } = await import("child_process");
    await new Promise<void>((resolve, reject) => {
      exec(`node "${wrapperPath}"`, {
        maxBuffer: 100 * 1024 * 1024,
        timeout: 120000,
      }, (error, _stdout, stderr) => {
        if (error) {
          reject(new Error(stderr || error.message));
        } else {
          resolve();
        }
      });
    });

    // Read results
    let buffer = Buffer.alloc(0);
    try {
      buffer = await fs.readFile(outputPath);
    } catch {
      // No output file means JSON-only result
    }

    let metadata: Record<string, unknown> = {};
    try {
      const metaContent = await fs.readFile(metaPath, "utf-8");
      metadata = JSON.parse(metaContent);
    } catch {
      // No metadata
    }

    return { buffer, metadata };
  } finally {
    // Cleanup temp files
    await Promise.allSettled([
      fs.unlink(inputPath),
      fs.unlink(outputPath),
      fs.unlink(metaPath),
      fs.unlink(path.join(tmpDir, `${id}-wrapper.js`)),
    ]);
  }
}

/**
 * Run a Python processor script with arguments
 */
export async function runPythonProcessor(
  script: string,
  args: string[]
): Promise<{ stdout: string; stderr: string; code: number }> {
  const { exec } = await import("child_process");
  const scriptPath = path.join(PROCESSORS_DIR, "python", script);
  const escapedArgs = args.map(a => `"${a.replace(/"/g, '\\"')}"`).join(" ");

  return new Promise((resolve, reject) => {
    exec(`python3 "${scriptPath}" ${escapedArgs}`, {
      maxBuffer: 100 * 1024 * 1024,
      timeout: 300000,
    }, (error, stdout, stderr) => {
      if (error && error.message.includes("ENOENT")) {
        reject(new Error("Python3 not found. Please install Python 3."));
        return;
      }
      resolve({
        stdout: stdout || "",
        stderr: stderr || "",
        code: error ? 1 : 0,
      });
    });
  });
}
