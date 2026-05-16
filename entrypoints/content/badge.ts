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
  { padding: string; font: string; bandPx: number; framePx: number }
> = {
  compact: { padding: '2px 10px', font: '11px', bandPx: 4, framePx: 3 },
  normal: { padding: '6px 16px', font: '14px', bandPx: 8, framePx: 4 },
  large: { padding: '10px 22px', font: '18px', bandPx: 12, framePx: 6 },
  huge: { padding: '14px 30px', font: '24px', bandPx: 18, framePx: 10 },
};

const POSITION: Record<BadgePosition, Partial<CSSStyleDeclaration>> = {
  'top-left': { top: '0', left: '0' },
  'top-right': { top: '0', right: '0' },
  'bottom-left': { bottom: '0', left: '0' },
  'bottom-right': { bottom: '0', right: '0' },
};

const BADGE_OFFSET = 12;
const Z = '2147483647';

export function renderBadge(
  container: HTMLElement,
  settings: EnvBadgeSettings,
  match: MatchedEnv | undefined,
): BadgeHandle {
  if (!match) return { destroy: () => {} };

  const elements: HTMLElement[] = [];
  const sizing = SIZE[settings.size];
  const showBanner = settings.style === 'banner' || settings.style === 'all';
  const showFrame = settings.style === 'frame' || settings.style === 'all';
  const stripeBackground = settings.stripes
    ? buildStripes(match.background, match.foreground)
    : match.background;

  if (showBanner) {
    elements.push(renderBanner(settings, match, sizing, stripeBackground));
  }
  if (showFrame) {
    elements.push(renderFrame(settings, match, sizing));
  }
  elements.push(renderBadgeChip(settings, match, sizing, showBanner));

  for (const el of elements) container.appendChild(el);

  return {
    destroy() {
      for (const el of elements) el.remove();
    },
  };
}

function renderBanner(
  settings: EnvBadgeSettings,
  match: MatchedEnv,
  sizing: (typeof SIZE)[BadgeSize],
  background: string,
): HTMLElement {
  const banner = document.createElement('div');
  banner.setAttribute('aria-hidden', 'true');
  const onTop = settings.position.startsWith('top');
  Object.assign(banner.style, {
    position: 'fixed',
    left: '0',
    right: '0',
    [onTop ? 'top' : 'bottom']: '0',
    height: `${sizing.bandPx}px`,
    background,
    backgroundColor: match.background,
    boxShadow: onTop
      ? '0 2px 6px rgba(0, 0, 0, 0.25)'
      : '0 -2px 6px rgba(0, 0, 0, 0.25)',
    zIndex: Z,
    pointerEvents: 'none',
    opacity: String(settings.opacity),
  } satisfies Partial<CSSStyleDeclaration>);
  return banner;
}

function renderFrame(
  settings: EnvBadgeSettings,
  match: MatchedEnv,
  sizing: (typeof SIZE)[BadgeSize],
): HTMLElement {
  const frame = document.createElement('div');
  frame.setAttribute('aria-hidden', 'true');
  Object.assign(frame.style, {
    position: 'fixed',
    inset: '0',
    border: `${sizing.framePx}px solid ${match.background}`,
    zIndex: Z,
    pointerEvents: 'none',
    boxSizing: 'border-box',
    opacity: String(settings.opacity),
  } satisfies Partial<CSSStyleDeclaration>);
  return frame;
}

function renderBadgeChip(
  settings: EnvBadgeSettings,
  match: MatchedEnv,
  sizing: (typeof SIZE)[BadgeSize],
  hasBanner: boolean,
): HTMLElement {
  const badge = document.createElement('div');
  badge.setAttribute('role', 'status');
  badge.setAttribute('aria-label', `Environment: ${match.label}`);
  badge.textContent = match.label;

  Object.assign(badge.style, {
    position: 'fixed',
    zIndex: Z,
    pointerEvents: 'none',
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontWeight: '900',
    fontSize: sizing.font,
    letterSpacing: '0.08em',
    padding: sizing.padding,
    borderRadius: '0 0 10px 0',
    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.35)',
    background: match.background,
    color: match.foreground,
    opacity: String(settings.opacity),
    userSelect: 'none',
    textShadow: '0 1px 0 rgba(0, 0, 0, 0.2)',
    border: `2px solid ${match.foreground}`,
    textTransform: 'uppercase',
  } satisfies Partial<CSSStyleDeclaration>);

  const offset = hasBanner ? sizing.bandPx + BADGE_OFFSET : BADGE_OFFSET;
  const pos = positionWithOffset(settings.position, offset);
  Object.assign(badge.style, pos);
  badge.style.borderRadius = cornerRadius(settings.position);

  return badge;
}

function positionWithOffset(
  position: BadgePosition,
  offset: number,
): Partial<CSSStyleDeclaration> {
  const base = POSITION[position];
  const out: Partial<CSSStyleDeclaration> = {};
  const setProp = (key: keyof CSSStyleDeclaration, value: string) => {
    (out as unknown as Record<string, string>)[key as string] = value;
  };
  for (const [key, value] of Object.entries(base)) {
    if (value === '0') {
      const numeric = key === 'top' || key === 'bottom' ? offset : 0;
      setProp(key as keyof CSSStyleDeclaration, `${numeric}px`);
    }
  }
  return out;
}

function cornerRadius(position: BadgePosition): string {
  switch (position) {
    case 'top-left':
      return '0 0 10px 0';
    case 'top-right':
      return '0 0 0 10px';
    case 'bottom-left':
      return '0 10px 0 0';
    case 'bottom-right':
      return '10px 0 0 0';
  }
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
