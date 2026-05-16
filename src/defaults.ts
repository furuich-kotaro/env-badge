import type { BadgeColor, EnvBadgeSettings, EnvKind, EnvRule } from './types';

export const BADGE_COLORS: Record<
  BadgeColor,
  { background: string; foreground: string }
> = {
  grey: { background: '#5f6368', foreground: '#ffffff' },
  blue: { background: '#1a73e8', foreground: '#ffffff' },
  red: { background: '#d93025', foreground: '#ffffff' },
  yellow: { background: '#fbbc04', foreground: '#1a1a1a' },
  green: { background: '#188038', foreground: '#ffffff' },
  pink: { background: '#d01884', foreground: '#ffffff' },
  purple: { background: '#9334e6', foreground: '#ffffff' },
  cyan: { background: '#007b83', foreground: '#ffffff' },
  orange: { background: '#fa903e', foreground: '#1a1a1a' },
};

export const BADGE_COLOR_LABELS: Record<BadgeColor, string> = {
  grey: 'Grey',
  blue: 'Blue',
  red: 'Red',
  yellow: 'Yellow',
  green: 'Green',
  pink: 'Pink',
  purple: 'Purple',
  cyan: 'Cyan',
  orange: 'Orange',
};

export const BADGE_COLOR_ORDER: BadgeColor[] = [
  'grey',
  'blue',
  'cyan',
  'green',
  'yellow',
  'orange',
  'red',
  'pink',
  'purple',
];

export const DEFAULT_COLOR_FOR_KIND: Record<EnvKind, BadgeColor> = {
  production: 'red',
  staging: 'orange',
  development: 'green',
  local: 'blue',
};

export const DEFAULT_RULES: EnvRule[] = [
  {
    id: 'default-local',
    enabled: true,
    label: 'LOCAL',
    kind: 'local',
    color: 'blue',
    patternType: 'glob',
    pattern: 'localhost',
  },
  {
    id: 'default-local-ip',
    enabled: true,
    label: 'LOCAL',
    kind: 'local',
    color: 'blue',
    patternType: 'glob',
    pattern: '127.0.0.1',
  },
  {
    id: 'default-local-tld',
    enabled: true,
    label: 'LOCAL',
    kind: 'local',
    color: 'blue',
    patternType: 'glob',
    pattern: '*.local',
  },
  {
    id: 'default-staging-host',
    enabled: true,
    label: 'STAGING',
    kind: 'staging',
    color: 'orange',
    patternType: 'glob',
    pattern: 'staging.*',
  },
  {
    id: 'default-staging-sub',
    enabled: true,
    label: 'STAGING',
    kind: 'staging',
    color: 'orange',
    patternType: 'glob',
    pattern: '*.staging.*',
  },
  {
    id: 'default-dev',
    enabled: true,
    label: 'DEV',
    kind: 'development',
    color: 'green',
    patternType: 'glob',
    pattern: '*.dev.*',
  },
];

export const DEFAULT_SETTINGS: EnvBadgeSettings = {
  rules: DEFAULT_RULES,
  position: 'top-left',
  size: 'normal',
};
