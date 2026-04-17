#!/usr/bin/env node
import { access, readFile } from 'fs/promises';
import { constants as fsConstants } from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';

const args = process.argv.slice(2);
let root = process.cwd();

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg === '--root' && args[i + 1]) {
    root = path.resolve(args[++i]);
    continue;
  }
  if (arg === '--help' || arg === '-h') {
    console.log('Usage: node scripts/check-release.mjs [--root <repo-root>]');
    process.exit(0);
  }
}

const files = [
  'index.html',
  path.join('play', 'index.html'),
  path.join('play', 'script.js'),
  path.join('play', 'styles.css'),
  'README.md',
];

const requiredSnippets = [
  {
    file: 'index.html',
    label: 'launcher HTML',
    snippets: [
      ['href="play/index.html"', "href='play/index.html'"],
      'meta name="description"',
      'property="og:title"',
      'property="og:description"',
    ],
  },
  {
    file: path.join('play', 'index.html'),
    label: 'game HTML',
    snippets: [
      ['href="styles.css"', "href='styles.css'"],
      ['src="script.js"', "src='script.js'"],
      'meta name="description"',
      'property="og:title"',
      'property="og:description"',
    ],
  },
];

let failed = false;

async function checkFile(rel) {
  const full = path.join(root, rel);
  try {
    await access(full, fsConstants.R_OK);
    console.log(`OK  ${rel}`);
    return true;
  } catch {
    console.log(`ERR ${rel} missing or unreadable`);
    failed = true;
    return false;
  }
}

async function checkSnippets(item) {
  const full = path.join(root, item.file);
  const text = await readFile(full, 'utf8');
  const missing = [];
  for (const snippet of item.snippets) {
    if (Array.isArray(snippet)) {
      if (!snippet.some(option => text.includes(option))) {
        missing.push(snippet.join(' | '));
      }
      continue;
    }
    if (!text.includes(snippet)) missing.push(snippet);
  }
  if (missing.length === 0) {
    console.log(`OK  ${item.label}`);
    return true;
  }
  console.log(`ERR ${item.label} missing: ${missing.join(', ')}`);
  failed = true;
  return false;
}

async function runNodeCheck(rel) {
  const full = path.join(root, rel);
  try {
    execFileSync(process.execPath, ['--check', full], { stdio: 'pipe' });
    console.log(`OK  node --check ${rel}`);
    return true;
  } catch (error) {
    const stderr = error?.stderr?.toString?.().trim();
    console.log(`ERR node --check ${rel}`);
    if (stderr) console.log(stderr);
    failed = true;
    return false;
  }
}

(async () => {
  console.log(`Release check: ${root}`);
  console.log('');

  for (const rel of files) {
    await checkFile(rel);
  }

  console.log('');
  for (const item of requiredSnippets) {
    await checkSnippets(item);
  }

  console.log('');
  await runNodeCheck(path.join('play', 'script.js'));

  console.log('');
  if (failed) {
    console.log('Release check failed. Fix the items above and run again.');
    process.exit(1);
  }
  console.log('Release check passed.');
})();
