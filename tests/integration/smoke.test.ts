import { test } from 'vitest';

// Quick smoke test for npm package installability and importability
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const isDebug = typeof process !== 'undefined' && process.env && process.env.DEBUG === '1';
const isCI = typeof process !== 'undefined' && process.env && process.env.CI === '1';

function run(cmd, opts = {}) {
  return execSync(cmd, { stdio: 'inherit', ...opts });
}

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ts-retry-backoff-smoke-'));
const origCwd = process.cwd();

const shouldRunSmoke = process.env.SMOKE === '1';

test.skipIf(!shouldRunSmoke)('npm package can be installed and imported (smoke test)', async () => {
  try {
    // Pack the current package
    run('npm pack');
    const pkg = fs.readdirSync(origCwd).find(f => f.endsWith('.tgz'));
    if (!pkg) throw new Error('No package tarball found');

    // Init a new project in the temp dir
    process.chdir(tmpDir);
    run('npm init -y');
    run(`npm install ${path.join(origCwd, pkg)}`);

    // Try to import the package
    const pkgJson = require(path.join(origCwd, 'package.json'));
    const entry = pkgJson.main || 'index.js';
    const entryPath = path.join(tmpDir, 'node_modules', pkgJson.name, entry);
    const imported = await import(entryPath);
    // Test the retryBackoff function from the installed package
    if (typeof imported.retryBackoff !== 'function') {
      throw new Error('retryBackoff is not exported as a function from the installed package');
    }
    // Run a basic retryBackoff usage
    let called = 0;
    const result = await imported.retryBackoff(() => {
      called++;
      if (called < 2) return Promise.reject(new Error('fail'));
      return Promise.resolve('ok');
    }, { maxRetries: 2 });
    if (result !== 'ok') throw new Error('retryBackoff did not return expected result');
    if (isDebug || isCI) {
      // eslint-disable-next-line no-console
      console.log('Smoke test passed: package can be installed, imported, and used.');
    }
  } catch (e) {
    if (isDebug || isCI) {
      // eslint-disable-next-line no-console
      console.error('Smoke test failed:', e);
    }
    throw e;
  } finally {
    process.chdir(origCwd);
    // Clean up tarball
    const tarballs = fs.readdirSync(origCwd).filter(f => f.endsWith('.tgz'));
    for (const t of tarballs) fs.unlinkSync(path.join(origCwd, t));
  }
}, 180000);
