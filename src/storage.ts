import { storage } from 'wxt/utils/storage';
import { DEFAULT_COLOR_FOR_KIND, DEFAULT_SETTINGS } from './defaults';
import type { EnvBadgeSettings, EnvKind } from './types';

export const settingsItem = storage.defineItem<EnvBadgeSettings>(
  'sync:settings',
  {
    fallback: DEFAULT_SETTINGS,
    version: 2,
    migrations: {
      2: (oldValue: unknown): EnvBadgeSettings => {
        const v1 = (oldValue ?? {}) as Partial<EnvBadgeSettings> & {
          rules?: Array<Partial<EnvBadgeSettings['rules'][number]>>;
        };
        const rules = (v1.rules ?? DEFAULT_SETTINGS.rules).map((rule) => ({
          id: rule.id ?? `rule-${Math.random().toString(36).slice(2, 9)}`,
          enabled: rule.enabled ?? true,
          label: rule.label ?? 'NEW',
          kind: rule.kind ?? ('staging' as EnvKind),
          color: rule.color ?? DEFAULT_COLOR_FOR_KIND[rule.kind ?? 'staging'],
          patternType: rule.patternType ?? 'glob',
          pattern: rule.pattern ?? '',
        }));
        return {
          rules,
          position: v1.position ?? DEFAULT_SETTINGS.position,
          size: v1.size ?? DEFAULT_SETTINGS.size,
        };
      },
    },
  },
);

export async function getSettings(): Promise<EnvBadgeSettings> {
  return await settingsItem.getValue();
}

export async function saveSettings(settings: EnvBadgeSettings): Promise<void> {
  await settingsItem.setValue(settings);
}

export function watchSettings(
  callback: (settings: EnvBadgeSettings) => void,
): () => void {
  return settingsItem.watch((next) => callback(next));
}
