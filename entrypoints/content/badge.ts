import type {
  BadgePosition,
  BadgeSize,
  EnvBadgeSettings,
  MatchedEnv,
} from '../../src/types';

export interface BadgeHandle {
  destroy(): void;
}

const SIZE: Record<
  BadgeSize,
  { padding: string; font: string; bandPx: number }
> = {
  normal: { padding: '6px 16px', font: '14px', bandPx: 8 },
  huge: { padding: '14px 30px', font: '24px', bandPx: 18 },
};

const Z = '2147483647';
const BADGE_OFFSET = 12;
const OPACITY = '0.95';

export function renderBadge(
  container: HTMLElement,
  settings: EnvBadgeSettings,
  match: MatchedEnv | undefined,
): BadgeHandle {
  if (!match) return { destroy: () => {} };

  const sizing = SIZE[settings.size];
  const stripeBackground = buildStripes(match.background, match.foreground);
  const banner = renderBanner(match, sizing, stripeBackground);
  const badge = renderBadgeChip(settings, match, sizing);

  container.appendChild(banner);
  container.appendChild(badge);

  return {
    destroy() {
      banner.remove();
      badge.remove();
    },
  };
}

function renderBanner(
  match: MatchedEnv,
  sizing: (typeof SIZE)[BadgeSize],
  background: string,
): HTMLElement {
  const banner = document.createElement('div');
  banner.setAttribute('aria-hidden', 'true');
  Object.assign(banner.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    right: '0',
    height: `${sizing.bandPx}px`,
    background,
    backgroundColor: match.background,
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.25)',
    zIndex: Z,
    pointerEvents: 'none',
    opacity: OPACITY,
  } satisfies Partial<CSSStyleDeclaration>);
  return banner;
}

function renderBadgeChip(
  settings: EnvBadgeSettings,
  match: MatchedEnv,
  sizing: (typeof SIZE)[BadgeSize],
): HTMLElement {
  const badge = document.createElement('div');
  badge.setAttribute('role', 'status');
  badge.setAttribute('aria-label', `Environment: ${match.label}`);
  badge.textContent = match.label;

  const top = `${sizing.bandPx + BADGE_OFFSET}px`;
  const left = settings.position === 'top-left' ? '0' : 'auto';
  const right = settings.position === 'top-right' ? '0' : 'auto';

  Object.assign(badge.style, {
    position: 'fixed',
    top,
    left,
    right,
    zIndex: Z,
    pointerEvents: 'none',
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontWeight: '900',
    fontSize: sizing.font,
    letterSpacing: '0.08em',
    padding: sizing.padding,
    borderRadius: cornerRadius(settings.position),
    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.35)',
    background: match.background,
    color: match.foreground,
    opacity: OPACITY,
    userSelect: 'none',
    textShadow: '0 1px 0 rgba(0, 0, 0, 0.2)',
    border: `2px solid ${match.foreground}`,
    textTransform: 'uppercase',
  } satisfies Partial<CSSStyleDeclaration>);

  return badge;
}

function cornerRadius(position: BadgePosition): string {
  return position === 'top-left' ? '0 0 10px 0' : '0 0 0 10px';
}

function buildStripes(bg: string, fg: string): string {
  const accent = withAlpha(fg, 0.22);
  return `repeating-linear-gradient(45deg, ${bg} 0 14px, ${accent} 14px 28px)`;
}

function withAlpha(color: string, alpha: number): string {
  if (color.startsWith('#') && (color.length === 7 || color.length === 4)) {
    const hex =
      color.length === 4
        ? `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`
        : color;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return color;
}
