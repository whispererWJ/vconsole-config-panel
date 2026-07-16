import { defineStore } from 'pinia';

interface ConfigState {
  showVConsole: boolean;
  theme: string;
  position: string;
  autoCleanLocalstorage: boolean;
}

export const useConfigStore = defineStore('config', {
  state: (): ConfigState => ({
    showVConsole: true,
    theme: 'light',
    position: 'bottom-left',
    autoCleanLocalstorage: true,
  }),

  getters: {
    getConfig(state): ConfigState {
      return state;
    },
  },

  actions: {
    setShowVConsole(show: boolean) {
      this.showVConsole = show;
    },

    setTheme(theme: string) {
      this.theme = theme;
    },

    setPosition(position: string) {
      this.position = position;
    },

    setAutoCleanLocalstorage(autoClean: boolean) {
      this.autoCleanLocalstorage = autoClean;
    },

    updateConfig(newConfig: Partial<ConfigState>) {
      Object.assign(this.$state, newConfig);
    },
  },

  // Store persistence in localStorage
  persist: {
    key: 'vconsole-config',
    storage: localStorage,
  },
});