import { createShadowRootUi } from 'wxt/utils/content-script-ui/shadow-root';
import { defineContentScript } from 'wxt/utils/define-content-script';
import { findMatchingRule, hostFromUrl, resolveMatch } from '../../src/match';
import { getSettings, watchSettings } from '../../src/storage';
import type { EnvBadgeSettings, MatchedEnv } from '../../src/types';
import { renderBadge } from './badge';

export default defineContentScript({
  matches: ['<all_urls>'],
  runAt: 'document_idle',
  cssInjectionMode: 'ui',

  async main(ctx) {
    let currentSettings = await getSettings();

    const ui = await createShadowRootUi(ctx, {
      name: 'env-badge-root',
      position: 'overlay',
      anchor: 'html',
      append: 'last',
      onMount(container) {
        return renderBadge(
          container,
          currentSettings,
          computeMatch(currentSettings),
        );
      },
      onRemove(handle) {
        handle?.destroy();
      },
    });

    ui.mount();

    const stopWatch = watchSettings((next) => {
      currentSettings = next;
      ui.remove();
      ui.mount();
    });

    ctx.onInvalidated(() => {
      stopWatch();
    });

    ctx.addEventListener(window, 'wxt:locationchange', () => {
      ui.remove();
      ui.mount();
    });
  },
});

function computeMatch(settings: EnvBadgeSettings): MatchedEnv | undefined {
  const host = hostFromUrl(location.href);
  if (!host) return undefined;
  const rule = findMatchingRule(settings.rules, host);
  if (!rule) {
    if (!settings.showWhenUnknown) return undefined;
    return {
      rule: {
        id: 'unknown',
        enabled: true,
        label: 'UNKNOWN',
        kind: 'custom',
        patternType: 'glob',
        pattern: '',
      },
      label: 'UNKNOWN',
      background: '#444444',
      foreground: '#ffffff',
    };
  }
  return resolveMatch(rule);
}
