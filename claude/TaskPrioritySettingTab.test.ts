import { TaskPrioritySettingTab } from './TaskPrioritySettingTab';
import { DEFAULT_SETTINGS } from './types';
import TaskPriorityPlugin from './TaskPriorityPlugin';

// Mock Obsidian classes
class MockApp {
  workspace = { activeLeaf: null };
}

class MockPlugin extends TaskPriorityPlugin {
  settings = { ...DEFAULT_SETTINGS };
  saveSettings = jest.fn();
  refreshView = jest.fn();
}

describe('TaskPrioritySettingTab', () => {
  let mockApp: MockApp;
  let mockPlugin: MockPlugin;
  let settingTab: TaskPrioritySettingTab;
  let mockContainerEl: HTMLElement;

  beforeEach(() => {
    mockApp = new MockApp();
    mockPlugin = new MockPlugin(mockApp as any, {} as any);
    settingTab = new TaskPrioritySettingTab(mockApp as any, mockPlugin);
    mockContainerEl = document.createElement('div');
    settingTab.containerEl = mockContainerEl;
  });

  describe('initialization', () => {
    it('should initialize with default settings', () => {
      const plugin = new MockPlugin(mockApp as any, {} as any);
      expect(plugin.settings.defaultSort).toBe('date');
      expect(plugin.settings.refreshInterval).toBe(30);
      expect(plugin.settings.openFullPage).toBe(true);
    });

    it('should initialize with app and plugin references', () => {
      expect(settingTab.app).toBe(mockApp);
      expect(settingTab.plugin).toBe(mockPlugin);
    });
  });

  describe('display method', () => {
    it('should create all setting controls', () => {
      settingTab.display();
      const headings = mockContainerEl.querySelectorAll('h2, h3');
      const settings = mockContainerEl.querySelectorAll('.setting-item');
      expect(headings.length).toBeGreaterThan(0);
      expect(settings.length).toBeGreaterThan(0);
    });

    it('should clear container before adding content', () => {
      mockContainerEl.innerHTML = '<div>existing content</div>';
      settingTab.display();
      expect(mockContainerEl.innerHTML).not.toContain('existing content');
    });

    it('should create experimental features section', () => {
      settingTab.display();
      const experimentalHeading = Array.from(mockContainerEl.querySelectorAll('h3'))
        .find(h => h.textContent?.includes('Experimental'));
      expect(experimentalHeading).toBeTruthy();
    });
  });

  describe('sort setting', () => {
    it('should update plugin settings when sort changes', () => {
      mockPlugin.settings.defaultSort = 'date';
      settingTab.display();
      const sortDropdown = mockContainerEl.querySelector('select') as HTMLSelectElement;
      sortDropdown.value = 'file';
      sortDropdown.dispatchEvent(new Event('change'));
      expect(mockPlugin.settings.defaultSort).toBe('file');
      expect(mockPlugin.saveSettings).toHaveBeenCalled();
    });

    it('should display current sort value in dropdown', () => {
      mockPlugin.settings.defaultSort = 'text';
      settingTab.display();
      const sortDropdown = mockContainerEl.querySelector('select') as HTMLSelectElement;
      expect(sortDropdown.value).toBe('text');
    });

    it('should handle invalid sort option gracefully', () => {
      mockPlugin.settings.defaultSort = 'invalid' as any;
      expect(() => settingTab.display()).not.toThrow();
    });
  });

  describe('refresh interval setting', () => {
    it('should validate refresh interval bounds (0-3600)', () => {
      settingTab.display();
      const intervalInput = Array.from(mockContainerEl.querySelectorAll('input'))
        .find(input => input.type === 'number') as HTMLInputElement;
      intervalInput.value = '5000';
      intervalInput.dispatchEvent(new Event('change'));
      expect(mockPlugin.settings.refreshInterval).toBeLessThanOrEqual(3600);
    });

    it('should handle zero refresh interval', () => {
      settingTab.display();
      const intervalInput = Array.from(mockContainerEl.querySelectorAll('input'))
        .find(input => input.type === 'number') as HTMLInputElement;
      intervalInput.value = '0';
      intervalInput.dispatchEvent(new Event('change'));
      expect(mockPlugin.settings.refreshInterval).toBe(0);
      expect(mockPlugin.saveSettings).toHaveBeenCalled();
    });

    it('should handle negative values gracefully', () => {
      settingTab.display();
      const intervalInput = Array.from(mockContainerEl.querySelectorAll('input'))
        .find(input => input.type === 'number') as HTMLInputElement;
      intervalInput.value = '-10';
      intervalInput.dispatchEvent(new Event('change'));
      expect(mockPlugin.settings.refreshInterval).toBeGreaterThanOrEqual(0);
    });

    it('should display current interval value', () => {
      mockPlugin.settings.refreshInterval = 60;
      settingTab.display();
      const intervalInput = Array.from(mockContainerEl.querySelectorAll('input'))
        .find(input => input.type === 'number') as HTMLInputElement;
      expect(intervalInput.value).toBe('60');
    });
  });

  describe('task query setting', () => {
    it('should update plugin settings when query changes', () => {
      settingTab.display();
      const queryInput = Array.from(mockContainerEl.querySelectorAll('input'))
        .find(input => input.type === 'text') as HTMLInputElement;
      queryInput.value = 'TASK WHERE !completed';
      queryInput.dispatchEvent(new Event('change'));
      expect(mockPlugin.settings.taskQuery).toBe('TASK WHERE !completed');
      expect(mockPlugin.saveSettings).toHaveBeenCalled();
    });

    it('should display current query value', () => {
      mockPlugin.settings.taskQuery = 'TASK WHERE priority = high';
      settingTab.display();
      const queryInput = Array.from(mockContainerEl.querySelectorAll('input'))
        .find(input => input.type === 'text') as HTMLInputElement;
      expect(queryInput.value).toBe('TASK WHERE priority = high');
    });

    it('should handle empty query gracefully', () => {
      settingTab.display();
      const queryInput = Array.from(mockContainerEl.querySelectorAll('input'))
        .find(input => input.type === 'text') as HTMLInputElement;
      queryInput.value = '';
      queryInput.dispatchEvent(new Event('change'));
      expect(mockPlugin.settings.taskQuery).toBe('');
      expect(mockPlugin.saveSettings).toHaveBeenCalled();
    });
  });

  describe('full page setting', () => {
    it('should update plugin settings when fullpage toggle changes', () => {
      settingTab.display();
      const fullPageToggle = Array.from(mockContainerEl.querySelectorAll('input'))
        .find(input => input.type === 'checkbox') as HTMLInputElement;
      fullPageToggle.checked = false;
      fullPageToggle.dispatchEvent(new Event('change'));
      expect(mockPlugin.settings.openFullPage).toBe(false);
      expect(mockPlugin.saveSettings).toHaveBeenCalled();
    });

    it('should display current fullpage value', () => {
      mockPlugin.settings.openFullPage = false;
      settingTab.display();
      const fullPageToggle = Array.from(mockContainerEl.querySelectorAll('input'))
        .find(input => input.type === 'checkbox') as HTMLInputElement;
      expect(fullPageToggle.checked).toBe(false);
    });
  });

  describe('animations setting', () => {
    it('should update plugin settings when animations toggle changes', () => {
      settingTab.display();
      const animationsToggle = Array.from(mockContainerEl.querySelectorAll('input'))
        .filter(input => input.type === 'checkbox')[1] as HTMLInputElement;
      animationsToggle.checked = true;
      animationsToggle.dispatchEvent(new Event('change'));
      expect(mockPlugin.settings.enableAnimations).toBe(true);
      expect(mockPlugin.saveSettings).toHaveBeenCalled();
    });

    it('should display current animations value', () => {
      mockPlugin.settings.enableAnimations = true;
      settingTab.display();
      const animationsToggle = Array.from(mockContainerEl.querySelectorAll('input'))
        .filter(input => input.type === 'checkbox')[1] as HTMLInputElement;
      expect(animationsToggle.checked).toBe(true);
    });
  });

  describe('settings persistence', () => {
    it('should call saveSettings after each change', () => {
      settingTab.display();
      const sortDropdown = mockContainerEl.querySelector('select') as HTMLSelectElement;
      sortDropdown.value = 'file';
      sortDropdown.dispatchEvent(new Event('change'));
      expect(mockPlugin.saveSettings).toHaveBeenCalledTimes(1);
    });

    it('should refresh view after settings change', () => {
      settingTab.display();
      const sortDropdown = mockContainerEl.querySelector('select') as HTMLSelectElement;
      sortDropdown.value = 'text';
      sortDropdown.dispatchEvent(new Event('change'));
      expect(mockPlugin.refreshView).toHaveBeenCalledTimes(1);
    });
  });

  describe('error handling', () => {
    it('should handle plugin without saveSettings method', () => {
      const pluginWithoutSave = { ...mockPlugin, saveSettings: undefined };
      const settingTabWithoutSave = new TaskPrioritySettingTab(mockApp as any, pluginWithoutSave as any);
      settingTabWithoutSave.containerEl = mockContainerEl;
      expect(() => settingTabWithoutSave.display()).not.toThrow();
    });

    it('should handle plugin without refreshView method', () => {
      const pluginWithoutRefresh = { ...mockPlugin, refreshView: undefined };
      const settingTabWithoutRefresh = new TaskPrioritySettingTab(mockApp as any, pluginWithoutRefresh as any);
      settingTabWithoutRefresh.containerEl = mockContainerEl;
      expect(() => settingTabWithoutRefresh.display()).not.toThrow();
    });

    it('should handle missing containerEl gracefully', () => {
      settingTab.containerEl = null as any;
      expect(() => settingTab.display()).not.toThrow();
    });
  });

  describe('validation', () => {
    it('should clamp refresh interval to valid range', () => {
      settingTab.display();
      const intervalInput = Array.from(mockContainerEl.querySelectorAll('input'))
        .find(input => input.type === 'number') as HTMLInputElement;
      intervalInput.value = '10000';
      intervalInput.dispatchEvent(new Event('change'));
      expect(mockPlugin.settings.refreshInterval).toBeLessThanOrEqual(3600);
    });

    it('should handle non-numeric refresh interval input', () => {
      settingTab.display();
      const intervalInput = Array.from(mockContainerEl.querySelectorAll('input'))
        .find(input => input.type === 'number') as HTMLInputElement;
      intervalInput.value = 'abc';
      intervalInput.dispatchEvent(new Event('change'));
      expect(typeof mockPlugin.settings.refreshInterval).toBe('number');
    });

    it('should maintain valid settings object structure', () => {
      settingTab.display();
      expect(mockPlugin.settings).toHaveProperty('defaultSort');
      expect(mockPlugin.settings).toHaveProperty('refreshInterval');
      expect(mockPlugin.settings).toHaveProperty('openFullPage');
      expect(mockPlugin.settings).toHaveProperty('taskQuery');
      expect(mockPlugin.settings).toHaveProperty('enableAnimations');
    });
  });
});