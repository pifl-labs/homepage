import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import test from 'node:test';

test('every app landing requests the CSS URL keyed to its current bytes', () => {
  const css = readFileSync(new URL('../public/styles-app-landing.css', import.meta.url));
  const component = readFileSync(new URL('../src/components/AppLanding.astro', import.meta.url), 'utf8');
  const hash = createHash('sha256').update(css).digest('hex').slice(0, 12);
  const href = component.match(/extraCss=\{\['([^']+)'\]\}/)?.[1];

  assert.equal(href, `/styles-app-landing.css?v=${hash}`);
});
