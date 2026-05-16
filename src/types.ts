export type EnvKind =
  | 'production'
  | 'staging'
  | 'development'
  | 'local'
  | 'custom';

export type PatternType = 'glob' | 'regex';

export interface EnvRule {
  id: string;
  enabled: boolean;
  label: string;
  kind: EnvKind;
  patternType: PatternType;
  pattern: string;
  background?: string;
  foreground?: string;
}

export type BadgePosition =
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right';

export type BadgeSize = 'compact' | 'normal' | 'large' | 'huge';

export type DisplayStyle = 'badge' | 'banner' | 'frame' | 'all';

export interface EnvBadgeSettings {
  rules: EnvRule[];
  showWhenUnknown: boolean;
  position: BadgePosition;
  size: BadgeSize;
  opacity: number;
  style: DisplayStyle;
  stripes: boolean;
}

export interface MatchedEnv {
  rule: EnvRule;
  label: string;
  background: string;
  foreground: string;
}
