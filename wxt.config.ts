import { defineConfig } from 'wxt';

export default defineConfig({
  srcDir: '.',
  modules: ['@wxt-dev/auto-icons'],
  autoIcons: {
    baseIconPath: 'assets/icon.svg',
  },
  manifest: {
    name: 'Env Badge',
    description:
      'Show an always-on environment badge so you never confuse production with staging again.',
    version: '0.1.0',
    permissions: ['storage'],
    host_permissions: ['<all_urls>'],
    action: {
      default_title: 'Env Badge',
    },
  },
});
