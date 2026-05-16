import {
  BADGE_COLOR_LABELS,
  BADGE_COLOR_ORDER,
  BADGE_COLORS,
  DEFAULT_COLOR_FOR_KIND,
  DEFAULT_SETTINGS,
} from '../../src/defaults';
import { getSettings, saveSettings } from '../../src/storage';
import type {
  BadgeColor,
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
  saveStatus: $<HTMLSpanElement>('#save-status'),
};

let settings: EnvBadgeSettings = structuredClone(DEFAULT_SETTINGS);
let saveTimer: ReturnType<typeof setTimeout> | undefined;

void (async () => {
  settings = structuredClone(await getSettings());
  hydrate();
  bind();
})();

function hydrate(): void {
  refs.position.value = settings.position;
  refs.size.value = settings.size;
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
}

function bindRuleNode(node: HTMLElement, rule: EnvRule, index: number): void {
  const fields = {
    enabled: qs<HTMLInputElement>(node, '[data-field="enabled"]'),
    label: qs<HTMLInputElement>(node, '[data-field="label"]'),
    kind: qs<HTMLSelectElement>(node, '[data-field="kind"]'),
    color: qs<HTMLSelectElement>(node, '[data-field="color"]'),
    patternType: qs<HTMLSelectElement>(node, '[data-field="patternType"]'),
    pattern: qs<HTMLInputElement>(node, '[data-field="pattern"]'),
  };
  const swatch = qs<HTMLSpanElement>(node, '[data-color-preview]');

  populateColorOptions(fields.color);

  fields.enabled.checked = rule.enabled;
  fields.label.value = rule.label;
  fields.kind.value = rule.kind;
  fields.color.value = rule.color;
  fields.patternType.value = rule.patternType;
  fields.pattern.value = rule.pattern;
  applySwatch(swatch, rule.color);

  fields.enabled.addEventListener('change', () => {
    rule.enabled = fields.enabled.checked;
    queueSave();
  });
  fields.label.addEventListener('input', () => {
    rule.label = fields.label.value;
    queueSave();
  });
  fields.kind.addEventListener('change', () => {
    rule.kind = fields.kind.value as EnvKind;
    const nextColor = DEFAULT_COLOR_FOR_KIND[rule.kind];
    rule.color = nextColor;
    fields.color.value = nextColor;
    applySwatch(swatch, nextColor);
    queueSave();
  });
  fields.color.addEventListener('change', () => {
    rule.color = fields.color.value as BadgeColor;
    applySwatch(swatch, rule.color);
    queueSave();
  });
  fields.patternType.addEventListener('change', () => {
    rule.patternType = fields.patternType.value as PatternType;
    queueSave();
  });
  fields.pattern.addEventListener('input', () => {
    rule.pattern = fields.pattern.value;
    queueSave();
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
    kind: 'staging',
    color: DEFAULT_COLOR_FOR_KIND.staging,
    patternType: 'glob',
    pattern: '*.example.com',
  };
}

function populateColorOptions(select: HTMLSelectElement): void {
  if (select.options.length > 0) return;
  for (const color of BADGE_COLOR_ORDER) {
    const opt = document.createElement('option');
    opt.value = color;
    opt.textContent = BADGE_COLOR_LABELS[color];
    select.appendChild(opt);
  }
}

function applySwatch(swatch: HTMLElement, color: BadgeColor): void {
  swatch.style.backgroundColor = BADGE_COLORS[color].background;
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
