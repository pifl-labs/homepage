/** Enumerate landing pages without treating policy-only routes as app launches. */
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

export function registeredAppSlugs(source) {
  const slugs = [...source.matchAll(/slug: '([^']+)'/g)].map((match) => match[1]);
  assert.ok(slugs.length > 0, 'The app catalog must not be empty');
  assert.equal(new Set(slugs).size, slugs.length, 'Duplicate registered app slug');
  return slugs;
}

export function builtAppLandingFiles(dist, lang, registered) {
  assert.ok(registered.length > 0, 'Registered app inventory is required');
  const dir = join(dist, lang, 'apps');
  for (const slug of registered) {
    assert.ok(existsSync(join(dir, slug, 'index.html')), `Missing registered landing: ${lang}/${slug}`);
  }
  const files = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const landing = join(dir, entry.name, 'index.html');
    if (existsSync(landing)) {
      files.push(landing);
    } else {
      assert.ok(
        ['privacy', 'support'].some((page) => existsSync(join(dir, entry.name, page, 'index.html'))),
        `Unexplained app directory without landing or policy: ${lang}/${entry.name}`,
      );
    }
  }
  return files;
}

export const appSlugs = registeredAppSlugs(readFileSync(new URL('../src/data/apps.ts', import.meta.url), 'utf8'));
