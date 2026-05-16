import { DEFAULT_SETTINGS, KIND_COLORS } from '../../src/defaults';
import { findMatchingRule, hostFromUrl, resolveMatch } from '../../src/match';
import { getSettings, saveSettings } from '../../src/storage';
import type {
  EnvBadgeSettings,
  EnvKind,
  EnvRule,
  PatternType,
} from '../../src/types';

const $ = <T extends Element = HTMLElement>(selector: string): T =>
  qs<T>(document, selector);

const qs = <T extends Element = HTMLElement>(
  root: ParentNode,
  selector: string,
): T => {
  const el = root.querySelector<T>(selector);
  if (!el) throw new Error(`Element not found: ${selector}`);
  return el;
};

const refs = {
  rules: $<HTMLDivElement>('#rules'),
  template: $<HTMLTemplateElement>('#rule-template'),
  addRule: $<HTMLButtonElement>('#add-rule'),
  resetRules: $<HTMLButtonElement>('#reset-rules'),
  position: $<HTMLSelectElement>('#position'),
  size: $<HTMLSelectElement>('#size'),
  style: $<HTMLSelectElement>('#style'),
  stripes: $<HTMLInputElement>('#stripes'),
  opacity: $<HTMLInputElement>('#opacity'),
  opacityOut: $<HTMLOutputElement>('#opacity-out'),
  showUnknown: $<HTMLInputElement>('#show-unknown'),
  probeInput: $<HTMLInputElement>('#probe-input'),
  probeResult: $<HTMLSpanElement>('#probe-result'),
  saveStatus: $<HTMLSpanElement>('#save-status'),
};

let settings: EnvBadgeSettings = structuredClone(DEFAULT_SETTINGS);
let saveTimer: ReturnType<typeof setTimeout> | undefined;

void (async () => {
  settings = structuredClone(await getSettings());
  hydrate();
  bind();
  updateProbe();
})();

function hydrate(): void {
  refs.position.value = settings.position;
  refs.size.value = settings.size;
  refs.style.value = settings.style;
  refs.stripes.checked = settings.stripes;
  refs.opacity.value = String(settings.opacity);
  refs.opacityOut.value = settings.opacity.toFixed(2);
  refs.showUnknown.checked = settings.showWhenUnknown;
  renderRules();
}

function bind(): void {
  refs.addRule.addEventListener('click', () => {
    settings.rules.push(newRule());
    renderRules();
    queueSave();
  });

  refs.resetRules.addEventListener('click', () => {
    settings = structuredClone(DEFAULT_SETTINGS);
    hydrate();
    queueSave();
  });

  refs.position.addEventListener('change', () => {
    settings.position = refs.position.value as EnvBadgeSettings['position'];
    queueSave();
  });

  refs.size.addEventListener('change', () => {
    settings.size = refs.size.value as EnvBadgeSettings['size'];
    queueSave();
  });

  refs.style.addEventListener('change', () => {
    settings.style = refs.style.value as EnvBadgeSettings['style'];
    queueSave();
  });

  refs.stripes.addEventListener('change', () => {
    settings.stripes = refs.stripes.checked;
    queueSave();
  });

  refs.opacity.addEventListener('input', () => {
    settings.opacity = Number(refs.opacity.value);
    refs.opacityOut.value = settings.opacity.toFixed(2);
    queueSave();
  });

  refs.showUnknown.addEventListener('change', () => {
    settings.showWhenUnknown = refs.showUnknown.checked;
    queueSave();
  });

  refs.probeInput.addEventListener('input', updateProbe);
}

function renderRules(): void {
  refs.rules.replaceChildren();
  settings.rules.forEach((rule, index) => {
    const fragment = refs.template.content.firstElementChild;
    if (!fragment) throw new Error('rule-template missing root element');
    const node = fragment.cloneNode(true) as HTMLElement;
    bindRuleNode(node, rule, index);
    refs.rules.appendChild(node);
  });
  updateProbe();
}

function bindRuleNode(node: HTMLElement, rule: EnvRule, index: number): void {
  const fields = {
    enabled: qs<HTMLInputElement>(node, '[data-field="enabled"]'),
    label: qs<HTMLInputElement>(node, '[data-field="label"]'),
    kind: qs<HTMLSelectElement>(node, '[data-field="kind"]'),
    patternType: qs<HTMLSelectElement>(node, '[data-field="patternType"]'),
    pattern: qs<HTMLInputElement>(node, '[data-field="pattern"]'),
    background: qs<HTMLInputElement>(node, '[data-field="background"]'),
    foreground: qs<HTMLInputElement>(node, '[data-field="foreground"]'),
  };
  const palette = KIND_COLORS[rule.kind];

  fields.enabled.checked = rule.enabled;
  fields.label.value = rule.label;
  fields.kind.value = rule.kind;
  fields.patternType.value = rule.patternType;
  fields.pattern.value = rule.pattern;
  fields.background.value = rule.background ?? palette.background;
  fields.foreground.value = rule.foreground ?? palette.foreground;

  fields.enabled.addEventListener('change', () => {
    rule.enabled = fields.enabled.checked;
    queueSave();
    updateProbe();
  });
  fields.label.addEventListener('input', () => {
    rule.label = fields.label.value;
    queueSave();
    updateProbe();
  });
  fields.kind.addEventListener('change', () => {
    rule.kind = fields.kind.value as EnvKind;
    const nextPalette = KIND_COLORS[rule.kind];
    rule.background = nextPalette.background;
    rule.foreground = nextPalette.foreground;
    fields.background.value = nextPalette.background;
    fields.foreground.value = nextPalette.foreground;
    queueSave();
    updateProbe();
  });
  fields.patternType.addEventListener('change', () => {
    rule.patternType = fields.patternType.value as PatternType;
    queueSave();
    updateProbe();
  });
  fields.pattern.addEventListener('input', () => {
    rule.pattern = fields.pattern.value;
    queueSave();
    updateProbe();
  });
  fields.background.addEventListener('input', () => {
    rule.background = fields.background.value;
    queueSave();
    updateProbe();
  });
  fields.foreground.addEventListener('input', () => {
    rule.foreground = fields.foreground.value;
    queueSave();
    updateProbe();
  });

  qs<HTMLButtonElement>(node, '[data-action="up"]').addEventListener(
    'click',
    () => swap(index, index - 1),
  );
  qs<HTMLButtonElement>(node, '[data-action="down"]').addEventListener(
    'click',
    () => swap(index, index + 1),
  );
  qs<HTMLButtonElement>(node, '[data-action="delete"]').addEventListener(
    'click',
    () => {
      settings.rules.splice(index, 1);
      renderRules();
      queueSave();
    },
  );
}

function swap(a: number, b: number): void {
  const rules = settings.rules;
  if (b < 0 || b >= rules.length) return;
  const ruleA = rules[a];
  const ruleB = rules[b];
  if (!ruleA || !ruleB) return;
  rules[a] = ruleB;
  rules[b] = ruleA;
  renderRules();
  queueSave();
}

function newRule(): EnvRule {
  return {
    id: `rule-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    enabled: true,
    label: 'NEW',
    kind: 'custom',
    patternType: 'glob',
    pattern: '*.example.com',
  };
}

function updateProbe(): void {
  const raw = refs.probeInput.value.trim();
  if (!raw) {
    refs.probeResult.textContent = '—';
    refs.probeResult.style.background = '';
    refs.probeResult.style.color = '';
    return;
  }
  const host = raw.includes('://') ? hostFromUrl(raw) : raw;
  if (!host) {
    refs.probeResult.textContent = 'invalid URL';
    return;
  }
  const rule = findMatchingRule(settings.rules, host);
  if (!rule) {
    refs.probeResult.textContent = 'no match';
    refs.probeResult.style.background = '';
    refs.probeResult.style.color = '';
    return;
  }
  const match = resolveMatch(rule);
  refs.probeResult.textContent = match.label;
  refs.probeResult.style.background = match.background;
  refs.probeResult.style.color = match.foreground;
}

function queueSave(): void {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(async () => {
    await saveSettings(settings);
    showSaved();
  }, 200);
}

function showSaved(): void {
  refs.saveStatus.textContent = 'Saved';
  refs.saveStatus.classList.add('is-visible');
  setTimeout(() => refs.saveStatus.classList.remove('is-visible'), 1200);
}
