export type EnvKind = 'production' | 'staging' | 'development' | 'local';

export type PatternType = 'glob' | 'regex';

export type BadgePosition = 'top-left' | 'top-right';

export type BadgeSize = 'normal' | 'huge';

export type BadgeColor =
  | 'grey'
  | 'blue'
  | 'red'
  | 'yellow'
  | 'green'
  | 'pink'
  | 'purple'
  | 'cyan'
  | 'orange';

export interface EnvRule {
  id: string;
  enabled: boolean;
  label: string;
  kind: EnvKind;
  color: BadgeColor;
  patternType: PatternType;
  pattern: string;
}

export interface EnvBadgeSettings {
  rules: EnvRule[];
  position: BadgePosition;
  size: BadgeSize;
}

export interface MatchedEnv {
  rule: EnvRule;
  label: string;
  background: string;
  foreground: string;
}
