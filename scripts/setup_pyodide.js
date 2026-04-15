#!/usr/bin/env node
/**
 * setup_pyodide.js
 * ================
 * Downloads the Pyodide runtime and the numpy package to static/pyodide/.
 *
 * Run once before `npm run dev` or `npm run build`:
 *   npm run pyodide:setup
 *
 * File names vary across Pyodide versions, so this script probes the CDN
 * with HEAD requests to find the correct names before downloading.
 */

import { createWriteStream, mkdirSync, existsSync } from 'fs';
import { readFile, rename, stat } from 'fs/promises';
import { pipeline } from 'stream/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR   = path.resolve(__dirname, '..', 'static', 'pyodide');
const VERSION   = '0.27.5';
const CDN       = `https://cdn.jsdelivr.net/pyodide/v${VERSION}/full`;

// ── Utilities ────────────────────────────────────────────────────────────────

/** HEAD-request a file; return true if it exists on the CDN. */
async function exists(filename) {
  const res = await fetch(`${CDN}/${filename}`, { method: 'HEAD' });
  return res.ok;
}

/** From a list of candidate filenames, return the first one present on CDN. */
async function findFirst(candidates) {
  for (const name of candidates) {
    if (await exists(name)) return name;
  }
  return null;
}

async function download(url, destPath) {
  if (existsSync(destPath)) {
    console.log(`  skip  ${path.basename(destPath)}  (already present)`);
    return;
  }

  process.stdout.write(`  fetch ${path.basename(destPath)} … `);

  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);

  const tmp = destPath + '.tmp';
  await pipeline(res.body, createWriteStream(tmp));
  await rename(tmp, destPath);

  const bytes = (await stat(destPath)).size;
  const size  = bytes >= 1_000_000
    ? `${(bytes / 1_000_000).toFixed(1)} MB`
    : `${(bytes / 1_000).toFixed(0)} KB`;
  console.log(`done  (${size})`);
}

// ── Main ─────────────────────────────────────────────────────────────────────

console.log(`\nSetting up Pyodide v${VERSION} → ${path.relative(process.cwd(), OUT_DIR)}/\n`);
mkdirSync(OUT_DIR, { recursive: true });

// 1. Always-present core files
await download(`${CDN}/pyodide.js`,       path.join(OUT_DIR, 'pyodide.js'));
await download(`${CDN}/pyodide.asm.wasm`, path.join(OUT_DIR, 'pyodide.asm.wasm'));

// Emscripten JS glue — separate file in some Pyodide versions
if (await exists('pyodide.asm.js')) {
  await download(`${CDN}/pyodide.asm.js`, path.join(OUT_DIR, 'pyodide.asm.js'));
}

// Source map for pyodide.js (silences DevTools 404 warning — optional)
if (await exists('pyodide.js.map')) {
  await download(`${CDN}/pyodide.js.map`, path.join(OUT_DIR, 'pyodide.js.map'));
}

// 2. Python stdlib — filename changed between Pyodide versions
//    v0.26+  → python_stdlib.zip
//    v0.25-  → pyodide_py.tar
const stdlibFile = await findFirst(['python_stdlib.zip', 'pyodide_py.tar']);
if (stdlibFile) {
  await download(`${CDN}/${stdlibFile}`, path.join(OUT_DIR, stdlibFile));
} else {
  console.warn('  WARNING: could not find Python stdlib archive — skipping.');
}

// 3. Package metadata — filename also changed between versions
//    v0.26+  → pyodide-lock.json
//    v0.25-  → repodata.json
const lockFile = await findFirst(['pyodide-lock.json', 'repodata.json']);
if (lockFile) {
  await download(`${CDN}/${lockFile}`, path.join(OUT_DIR, lockFile));
} else {
  console.warn('  WARNING: could not find package lock file — numpy auto-download will be skipped.');
}

// 4. Pyodide self-description (always needed by the loader)
await download(`${CDN}/package.json`, path.join(OUT_DIR, 'package.json'));

// 5. numpy — find its filename from the package lock file
if (lockFile) {
  const lockPath = path.join(OUT_DIR, lockFile);
  const lock = JSON.parse(await readFile(lockPath, 'utf8'));

  // pyodide-lock.json uses lock.packages; older repodata.json uses lock.packages too
  const numpyEntry = lock.packages?.['numpy'];
  if (!numpyEntry) {
    console.warn('\n  WARNING: numpy not found in lock file — skipping numpy download.');
    console.warn('  numpy will be fetched from CDN on first browser load.\n');
  } else {
    const numpyFile = numpyEntry.file_name;
    await download(`${CDN}/${numpyFile}`, path.join(OUT_DIR, numpyFile));
    console.log(`\n  numpy package: ${numpyFile}`);
  }
}

console.log('\nPyodide setup complete.\n');
