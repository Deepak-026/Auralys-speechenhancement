const { spawn } = require('child_process');
const { PYTHON_PATH, ENGINE_PATH, PYTHON_TIMEOUT_MS } = require('../config/env.config');

/**
 * Spawn the Python engine and return the parsed JSON result.
 * All Python stdout is collected and parsed as JSON.
 * Python stderr is streamed to Node.js console for logging.
 */
async function runPythonEngine(args) {
  return new Promise((resolve, reject) => {
    const pythonArgs = [ENGINE_PATH, ...args];

    console.log(`[PythonRunner] Spawning: ${PYTHON_PATH} ${pythonArgs.join(' ')}`);

    const proc = spawn(PYTHON_PATH, pythonArgs, {
      env: { ...process.env },
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';
    let timedOut = false;

    const timer = setTimeout(() => {
      timedOut = true;
      proc.kill('SIGTERM');
      reject(new Error(`Python engine timed out after ${PYTHON_TIMEOUT_MS / 1000}s`));
    }, PYTHON_TIMEOUT_MS);

    proc.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });

    proc.stderr.on('data', (chunk) => {
      const line = chunk.toString();
      stderr += line;
      // Stream Python logs to Node console (prefixed)
      process.stdout.write(`[Python] ${line}`);
    });

    proc.on('error', (err) => {
      clearTimeout(timer);
      reject(new Error(`Failed to start Python process: ${err.message}. Is Python installed and in PATH?`));
    });

    proc.on('close', (code) => {
      clearTimeout(timer);
      if (timedOut) return;

      // Parse the last JSON line from stdout (Python may emit log lines before the final JSON)
      const lines = stdout.trim().split('\n');
      let parsed = null;
      for (let i = lines.length - 1; i >= 0; i--) {
        const line = lines[i].trim();
        if (line.startsWith('{')) {
          try {
            parsed = JSON.parse(line);
            break;
          } catch (_) {}
        }
      }

      if (!parsed) {
        console.error('[PythonRunner] Could not parse JSON from stdout:', stdout.slice(-500));
        return reject(
          new Error(
            `Python engine did not return valid JSON. Exit code: ${code}. stderr: ${stderr.slice(-300)}`
          )
        );
      }

      if (!parsed.success) {
        const err = new Error(parsed.error || 'Python engine reported failure');
        err.errorType = parsed.error_type || 'PythonError';
        err.pythonResult = parsed;
        return reject(err);
      }

      resolve(parsed);
    });
  });
}

module.exports = { runPythonEngine };
