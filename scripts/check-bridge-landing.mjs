#!/usr/bin/env node
/** Validate the Japanese Bridge activity entry without widening its locale/app scope. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { appSlugs, builtAppLandingFiles } from './built-app-pages.mjs';

const dist = fileURLToPath(new URL('../dist/', import.meta.url));
let checked = 0;
for (const lang of ['ko', 'ja', 'en']) {
  for (const file of builtAppLandingFiles(dist, lang, appSlugs)) {
    const html = readFileSync(file, 'utf8');
    const isJapaneseBridge = lang === 'ja' && file.includes('/pipi-bridge/');
    if (!isJapaneseBridge) {
      assert.ok(!html.includes('bridge-ja-activity'), `${file}: Japanese Bridge activity must not leak`);
      continue;
    }
    const sections = [...html.matchAll(/<section\b[^>]*id="bridge-ja-activity"[^>]*>(.*?)<\/section>/gs)];
    assert.equal(sections.length, 1, 'Japanese Bridge has exactly one activity entry');
    const section = sections[0][0];
    assert.match(section, /aria-labelledby="bridge-ja-activity-title"/, 'Japanese activity heading association');
    assert.match(section, /<h2\b[^>]*id="bridge-ja-activity-title"[^>]*>親子の遊び<\/h2>/, 'Japanese activity exact heading');
    const paragraphs = [...section.matchAll(/<p\b[^>]*>(.*?)<\/p>/gs)];
    assert.deepEqual(paragraphs.map(match => match[1]), ['「手伝ってください」を韓国語で言ってみる、親子の役割遊びです。', '無料の手順を画面で読めます。アプリや登録は不要です。'], 'Japanese activity separates role play from free-reading and no-app boundary');
    for (const paragraph of paragraphs) assert.match(paragraph[0], /<p\b[^>]*style="text-wrap: balance"[^>]*>/, 'Each Japanese activity paragraph uses local balanced wrapping');
    assert.deepEqual([...section.matchAll(/style="([^"]*)"/g)].map(match => match[1]), ['text-wrap: balance', 'text-wrap: balance'], 'Japanese activity has exactly two local typography declarations');
    const links = [...section.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*hreflang="([^"]+)"[^>]*>(.*?)<\/a>/gs)];
    assert.equal((section.match(/<a\b/g) ?? []).length, 1, 'Japanese activity has only one action');
    assert.equal(links.length, 1, 'Japanese activity has one language-marked link');
    assert.equal(links[0][1], 'https://pipi-worlds.com/ja/learn/korean-school-help-phrase/', 'Japanese activity exact destination');
    assert.equal(links[0][2], 'ja', 'Japanese activity matching language');
    assert.equal(links[0][3].replace(/<[^>]+>/g, '').trim(), '手順を読む', 'Japanese activity exact action label');
    assert.doesNotMatch(section, /<form|<input|<button|<script|<img|<iframe|download=|target=|onclick|\.pdf|録音|採点|効果|写真|app-download-note/, 'Japanese activity is on-screen instructions, not an app, upload, recording or grading demo');
    checked++;
  }
}
assert.equal(checked, 1, 'Japanese Bridge activity target must exist');
console.log('PASS: Japanese Bridge has one exact read-only activity link; other apps and locales have none.');
