#!/usr/bin/env node
/**
 * Keeps reskinned files on the design system: tokens and src/components/ui
 * only. Checks every file in scripts/reskinned.json (and the ui components)
 * for:
 *  - inline styles: style="…", :style, v-bind:style
 *  - Tailwind arbitrary values: bg-[#…], w-[13px], grid-cols-[…]
 *  - raw palette colours: text-slate-500, bg-indigo-600, bg-white, text-black…
 *  - dark: variants and isDarkMode (tokens already follow the theme)
 *  - hex/rgb colours in templates and <style> (use var(--tc-…) or a Tailwind token name)
 *
 * Data a user chose (a colour, a size) reaches CSS only through v-bind() in a
 * component's <style>, never style=. If a line truly needs an exception, put
 * `style-check: allow <reason>` in a comment on the line before; keep these rare.
 *
 *   node scripts/check-styles.mjs            check the manifest
 *   node scripts/check-styles.mjs <files…>   check these files too
 */
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { globSync } from 'node:fs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(readFileSync(path.join(root, 'scripts/reskinned.json'), 'utf8'));
const files = [...new Set([...globSync('src/components/ui/*.vue', { cwd: root }), ...manifest.files, ...process.argv.slice(2)])];

const PALETTE = 'slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose';
const PREFIXES = 'bg|text|border|border-[trblxy]|ring|ring-offset|fill|stroke|from|via|to|divide|outline|shadow|accent|caret|placeholder|decoration';
const rules = [
  { name: 'inline style', re: /(\s|^)(:?style|v-bind:style)\s*=/ },
  { name: 'arbitrary value', re: /(?:^|[\s"'`:])!?-?[a-z][a-z0-9-]*-\[[^\]]+\]/ },
  { name: 'raw palette colour', re: new RegExp(`(?:^|[\\s"'\`:])!?(?:${PREFIXES})-(?:(?:${PALETTE})-\\d{2,3}|white|black)(?:/\\d+)?\\b`) },
  { name: 'dark: variant (tokens follow the theme)', re: /(?:^|[\s"'`])dark:/ },
  { name: 'isDarkMode (tokens follow the theme)', re: /\bisDarkMode\b/ },
];
const colourRules = [{ name: 'raw colour (use a token)', re: /#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(/ }];

let problems = 0;
for (const file of files) {
  const full = path.join(root, file);
  if (!existsSync(full)) {
    console.error(`${file}: listed in scripts/reskinned.json but missing`);
    problems++;
    continue;
  }
  const lines = readFileSync(full, 'utf8').split('\n');
  let section = 'template';
  lines.forEach((line, index) => {
    if (/^<template/.test(line)) section = 'template';
    else if (/^<script/.test(line)) section = 'script';
    else if (/^<style/.test(line)) section = 'style';
    // Scripts can hold class maps, so class rules apply there too; raw colours don't,
    // since scripts also produce output (CSS a tool generates, chart data)
    if (index > 0 && /style-check: allow/.test(lines[index - 1])) return;
    const active = section === 'script' ? rules.filter((r) => r.name !== 'inline style') : [...rules, ...(section === 'script' ? [] : colourRules)];
    for (const rule of active) {
      if (section === 'style' && rule.name === 'inline style') continue;
      if (rule.re.test(line)) {
        console.error(`${file}:${index + 1}: ${rule.name}\n    ${line.trim()}`);
        problems++;
      }
    }
  });
}

if (problems) {
  console.error(`\n${problems} problem(s). Use the tokens in tailwind.config.js and the components in src/components/ui (see frontend/RESKIN_GUIDE.md).`);
  process.exit(1);
}
console.log(`Styles OK in ${files.length} file(s)`);
