// Turn a YouTube .vtt caption file into plain text.
// Auto-captions repeat each line as it "rolls" up the screen, so drop
// timing lines and inline tags, then skip any line identical to the one before.
// Usage: node vtt-to-text.mjs <file.vtt>
import { readFileSync } from 'node:fs';

const lines = readFileSync(process.argv[2], 'utf8').replace(/^﻿/, '').split(/\r?\n/);
const out = [];
for (const raw of lines) {
  if (!raw.trim() || raw.startsWith('WEBVTT') || /^(Kind|Language):/.test(raw) || raw.includes('-->')) continue;
  const text = raw.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&gt;/g, '>').replace(/&lt;/g, '<').trim();
  if (text && text !== out[out.length - 1]) out.push(text);
}
console.log(out.join(' ').replace(/\s+/g, ' '));
