import { KIND_COLORS } from './defaults';
import type { EnvRule, MatchedEnv } from './types';

const GLOB_META = /[.+?^${}()|[\]\\]/g;

export function globToRegExp(pattern: string): RegExp {
  const escaped = pattern.replace(GLOB_META, '\\$&').replace(/\*/g, '.*');
  return new RegExp(`^${escaped}$`, 'i');
}

export function ruleMatches(rule: EnvRule, host: string): boolean {
  if (!rule.enabled) return false;
  if (!rule.pattern) return false;
  try {
    const re =
      rule.patternType === 'regex'
        ? new RegExp(rule.pattern, 'i')
        : globToRegExp(rule.pattern);
    return re.test(host);
  } catch {
    return false;
  }
}

export function findMatchingRule(
  rules: EnvRule[],
  host: string,
): EnvRule | undefined {
  return rules.find((rule) => ruleMatches(rule, host));
}

export function resolveMatch(rule: EnvRule): MatchedEnv {
  const palette = KIND_COLORS[rule.kind];
  return {
    rule,
    label: rule.label,
    background: palette.background,
    foreground: palette.foreground,
  };
}

export function hostFromUrl(rawUrl: string): string | undefined {
  try {
    const url = new URL(rawUrl);
    return url.hostname;
  } catch {
    return undefined;
  }
}
