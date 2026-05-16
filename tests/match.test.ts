import { describe, expect, it } from 'vitest';
import { DEFAULT_RULES } from '../src/defaults';
import {
  findMatchingRule,
  globToRegExp,
  hostFromUrl,
  ruleMatches,
} from '../src/match';
import type { EnvRule } from '../src/types';

const rule = (overrides: Partial<EnvRule>): EnvRule => ({
  id: 't',
  enabled: true,
  label: 'L',
  kind: 'staging',
  color: 'orange',
  patternType: 'glob',
  pattern: '*',
  ...overrides,
});

describe('globToRegExp', () => {
  it('matches wildcard segments', () => {
    expect(globToRegExp('*.example.com').test('app.example.com')).toBe(true);
    expect(globToRegExp('*.example.com').test('example.com')).toBe(false);
  });

  it('escapes regex metacharacters', () => {
    expect(globToRegExp('foo.bar').test('fooxbar')).toBe(false);
    expect(globToRegExp('foo.bar').test('foo.bar')).toBe(true);
  });
});

describe('ruleMatches', () => {
  it('respects enabled flag', () => {
    expect(ruleMatches(rule({ enabled: false, pattern: 'x' }), 'x')).toBe(
      false,
    );
  });

  it('supports regex patterns', () => {
    expect(
      ruleMatches(
        rule({ patternType: 'regex', pattern: '^prod-\\d+\\.example\\.com$' }),
        'prod-12.example.com',
      ),
    ).toBe(true);
  });

  it('returns false on invalid regex', () => {
    expect(
      ruleMatches(rule({ patternType: 'regex', pattern: '(' }), 'anything'),
    ).toBe(false);
  });
});

describe('findMatchingRule', () => {
  it('returns first matching rule respecting order', () => {
    const rules: EnvRule[] = [
      rule({ id: 'a', pattern: 'foo.bar.com', label: 'A' }),
      rule({ id: 'b', pattern: '*.bar.com', label: 'B' }),
    ];
    expect(findMatchingRule(rules, 'foo.bar.com')?.id).toBe('a');
    expect(findMatchingRule(rules, 'baz.bar.com')?.id).toBe('b');
  });

  it('returns undefined when nothing matches', () => {
    expect(findMatchingRule([], 'example.com')).toBeUndefined();
  });
});

describe('default rules', () => {
  it('matches localhost', () => {
    expect(findMatchingRule(DEFAULT_RULES, 'localhost')?.label).toBe('LOCAL');
  });

  it('matches *.local', () => {
    expect(findMatchingRule(DEFAULT_RULES, 'app.local')?.label).toBe('LOCAL');
  });

  it('matches staging subdomain', () => {
    expect(findMatchingRule(DEFAULT_RULES, 'staging.example.com')?.label).toBe(
      'STAGING',
    );
  });

  it('does not match prod by default', () => {
    expect(findMatchingRule(DEFAULT_RULES, 'app.example.com')).toBeUndefined();
  });
});

describe('hostFromUrl', () => {
  it('returns hostname', () => {
    expect(hostFromUrl('https://app.example.com/foo')).toBe('app.example.com');
  });

  it('returns undefined for invalid URL', () => {
    expect(hostFromUrl('not a url')).toBeUndefined();
  });
});
