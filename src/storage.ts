import { storage } from 'wxt/utils/storage';
import { DEFAULT_SETTINGS } from './defaults';
import type { EnvBadgeSettings } from './types';

export const settingsItem = storage.defineItem<EnvBadgeSettings>(
  'sync:settings',
  {
    fallback: DEFAULT_SETTINGS,
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
