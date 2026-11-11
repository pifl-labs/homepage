import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const script = readFileSync(new URL('../public/script.js', import.meta.url), 'utf8');
const sectionStart = script.indexOf('// Smooth Scroll for Navigation Links');
const sectionEnd = script.indexOf('// Optimized Scroll Handler', sectionStart);
assert.ok(sectionStart >= 0 && sectionEnd > sectionStart, 'run the real navigation handler');
const navigation = script.slice(sectionStart, sectionEnd);

function clickFixture({ skip = true, href = '#main', missing = false, tabindex, navHeight = 64 } = {}) {
  const attributes = new Map(tabindex === undefined ? [] : [['tabindex', tabindex]]);
  const calls = { focus: [], scroll: [], history: [], prevented: 0 };
  const target = {
    offsetTop: 120,
    hasAttribute: name => attributes.has(name),
    setAttribute: (name, value) => attributes.set(name, value),
    focus: options => calls.focus.push(options),
  };
  let onClick;
  const anchor = {
    classList: { contains: name => skip && name === 'skip-link' },
    getAttribute: name => name === 'href' ? href : null,
    addEventListener: (event, callback) => {
      assert.equal(event, 'click');
      onClick = callback;
    },
  };
  vm.runInNewContext(navigation, {
    document: {
      querySelectorAll: selector => {
        assert.equal(selector, 'a[href^="#"]:not([data-email-user])');
        return [anchor];
      },
      querySelector: selector => {
        if (selector === '.navbar, .nav') return navHeight === null ? null : { offsetHeight: navHeight };
        assert.equal(selector, href);
        return missing ? null : target;
      },
    },
    history: { pushState: (...args) => calls.history.push(args) },
    window: { scrollTo: options => calls.scroll.push(options) },
  });
  onClick.call(anchor, { preventDefault: () => calls.prevented++ });
  return { calls, attributes };
}

test('app landings provide a unique main skip destination outside the normal tab order', () => {
  const source = readFileSync(new URL('../src/components/AppLanding.astro', import.meta.url), 'utf8');
  assert.equal((source.match(/id="main"/g) ?? []).length, 1);
  assert.match(source, /<main id="main" tabindex="-1" class:list=/);
});

test('shared skip link targets that main destination', () => {
  const layout = readFileSync(new URL('../src/layouts/BaseLayout.astro', import.meta.url), 'utf8');
  assert.match(layout, /<a class="skip-link" href="#main">\{skipLabel\}<\/a>/);
});

test('skip click focuses the destination without a second implicit scroll', () => {
  const { calls, attributes } = clickFixture();
  assert.equal(calls.focus.length, 1);
  assert.equal(calls.focus[0].preventScroll, true);
  assert.equal(attributes.get('tabindex'), '-1');
  assert.equal(calls.prevented, 1);
  assert.equal(calls.history[0][2], '#main');
  assert.equal(calls.scroll[0].top, 56);
  assert.equal(calls.scroll[0].behavior, 'smooth');
});

test('skip handling preserves an existing tabindex instead of overwriting it', () => {
  const { calls, attributes } = clickFixture({ tabindex: '0' });
  assert.equal(attributes.get('tabindex'), '0');
  assert.equal(calls.focus.length, 1);
});

test('ordinary section anchors keep their existing scroll and history, without stealing focus', () => {
  const { calls, attributes } = clickFixture({ skip: false, href: '#apps' });
  assert.equal(calls.focus.length, 0);
  assert.equal(attributes.has('tabindex'), false);
  assert.equal(calls.scroll.length, 1);
  assert.equal(calls.scroll[0].top, 56);
  assert.equal(calls.history[0][2], '#apps');
});

test('a missing anchor destination keeps the original browser behavior', () => {
  const { calls } = clickFixture({ missing: true });
  assert.equal(calls.prevented, 0);
  assert.equal(calls.focus.length, 0);
  assert.equal(calls.scroll.length, 0);
  assert.equal(calls.history.length, 0);
});

for (const href of ['#', '', 'mailto:hello@pifl-labs.com']) {
  test(`unsupported hash ${JSON.stringify(href)} is left alone`, () => {
    const { calls } = clickFixture({ href });
    assert.equal(calls.prevented, 0);
    assert.equal(calls.focus.length, 0);
    assert.equal(calls.scroll.length, 0);
    assert.equal(calls.history.length, 0);
  });
}

test('skip scrolling still works on pages without the shared nav element', () => {
  const { calls } = clickFixture({ navHeight: null });
  assert.equal(calls.focus.length, 1);
  assert.equal(calls.scroll[0].top, 120);
});
