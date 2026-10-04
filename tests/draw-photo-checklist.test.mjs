import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const component = readFileSync(new URL('../src/components/DrawPhotoChecklist.astro', import.meta.url), 'utf8');
const landing = readFileSync(new URL('../src/components/AppLanding.astro', import.meta.url), 'utf8');
test('photo checklist renders only for English Draw', () => {
  assert.match(landing, /app\.slug === 'pipi-draw' && lang === 'en' && <DrawPhotoChecklist \/>/);
});
test('links to the exact already published English PNG with distinct campaign', () => {
  const match = component.match(/const checklistUrl = '([^']+)'/);
  const url = new URL(match[1]);
  assert.equal(url.origin, 'https://pipi-worlds.com');
  assert.equal(url.pathname, '/assets/marketing/outline-photo-en-20260922/poster.png');
  assert.equal(url.searchParams.get('utm_campaign'), 'draw_photo_choice_20261004');
  assert.equal(url.searchParams.get('utm_content'), 'en_resource_panel');
  assert.equal((component.match(/<a /g) || []).length, 1);
});
test('names file type, discloses illustration and preserves keyboard focus', () => {
  for (const text of ['(PNG)', 'AI-made illustrations', 'not app conversion results', ':focus-visible', 'min-height: 44px']) assert.ok(component.includes(text), text);
  assert.doesNotMatch(component, /download[= ]|target=/);
});
