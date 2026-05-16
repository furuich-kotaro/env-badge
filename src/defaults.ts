import type { EnvBadgeSettings, EnvKind, EnvRule } from './types';

export const KIND_COLORS: Record<
  EnvKind,
  { background: string; foreground: string }
> = {
  production: { background: '#c0392b', foreground: '#ffffff' },
  staging: { background: '#e67e22', foreground: '#1a1a1a' },
  development: { background: '#27ae60', foreground: '#ffffff' },
  local: { background: '#2980b9', foreground: '#ffffff' },
  custom: { background: '#444444', foreground: '#ffffff' },
};

export const DEFAULT_RULES: EnvRule[] = [
  {
    id: 'default-local',
    enabled: true,
    label: 'LOCAL',
    kind: 'local',
    patternType: 'glob',
    pattern: 'localhost',
  },
  {
    id: 'default-local-ip',
    enabled: true,
    label: 'LOCAL',
    kind: 'local',
    patternType: 'glob',
    pattern: '127.0.0.1',
  },
  {
    id: 'default-local-tld',
    enabled: true,
    label: 'LOCAL',
    kind: 'local',
    patternType: 'glob',
    pattern: '*.local',
  },
  {
    id: 'default-staging-host',
    enabled: true,
    label: 'STAGING',
    kind: 'staging',
    patternType: 'glob',
    pattern: 'staging.*',
  },
  {
    id: 'default-staging-sub',
    enabled: true,
    label: 'STAGING',
    kind: 'staging',
    patternType: 'glob',
    pattern: '*.staging.*',
  },
  {
    id: 'default-dev',
    enabled: true,
    label: 'DEV',
    kind: 'development',
    patternType: 'glob',
    pattern: '*.dev.*',
  },
];

export const DEFAULT_SETTINGS: EnvBadgeSettings = {
  rules: DEFAULT_RULES,
  showWhenUnknown: false,
  position: 'top-left',
  size: 'large',
  opacity: 0.95,
  style: 'banner',
  stripes: true,
};
