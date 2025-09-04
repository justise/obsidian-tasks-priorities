export class TFile {
  path: string;
  
  constructor(path?: string) {
    this.path = path || '';
  }
}

export class Plugin {
  constructor(public app: any, public manifest: any) {}
}

export class ItemView {
  constructor(public leaf: any) {}
}

export class PluginSettingTab {
  constructor(public app: any, public plugin: any) {}
}

export class Notice {
  constructor(public message: string) {}
}

export class Setting {
  private element: HTMLElement;
  
  constructor(containerEl: HTMLElement) {
    this.element = document.createElement('div');
    this.element.className = 'setting-item';
    containerEl.appendChild(this.element);
  }
  
  setName(name: string): Setting {
    const nameEl = document.createElement('div');
    nameEl.className = 'setting-item-name';
    nameEl.textContent = name;
    this.element.appendChild(nameEl);
    return this;
  }
  
  setDesc(desc: string): Setting {
    const descEl = document.createElement('div');
    descEl.className = 'setting-item-description';
    descEl.textContent = desc;
    this.element.appendChild(descEl);
    return this;
  }
  
  addDropdown(callback: (dropdown: MockDropdown) => void): Setting {
    const dropdown = new MockDropdown();
    const controlEl = document.createElement('div');
    controlEl.className = 'setting-item-control';
    controlEl.appendChild(dropdown.selectEl);
    this.element.appendChild(controlEl);
    callback(dropdown);
    return this;
  }
  
  addSlider(callback: (slider: MockSlider) => void): Setting {
    const slider = new MockSlider();
    const controlEl = document.createElement('div');
    controlEl.className = 'setting-item-control';
    controlEl.appendChild(slider.sliderEl);
    this.element.appendChild(controlEl);
    callback(slider);
    return this;
  }
  
  addToggle(callback: (toggle: MockToggle) => void): Setting {
    const toggle = new MockToggle();
    const controlEl = document.createElement('div');
    controlEl.className = 'setting-item-control';
    controlEl.appendChild(toggle.toggleEl);
    this.element.appendChild(controlEl);
    callback(toggle);
    return this;
  }
  
  addText(callback: (text: MockTextComponent) => void): Setting {
    const text = new MockTextComponent();
    const controlEl = document.createElement('div');
    controlEl.className = 'setting-item-control';
    controlEl.appendChild(text.inputEl);
    this.element.appendChild(controlEl);
    callback(text);
    return this;
  }
  
  addTextArea(callback: (text: MockTextAreaComponent) => void): Setting {
    const text = new MockTextAreaComponent();
    const controlEl = document.createElement('div');
    controlEl.className = 'setting-item-control';
    controlEl.appendChild(text.inputEl);
    this.element.appendChild(controlEl);
    callback(text);
    return this;
  }
}

class MockDropdown {
  selectEl: HTMLSelectElement;
  private onChangeCallback: ((value: string) => void) | null = null;
  
  constructor() {
    this.selectEl = document.createElement('select');
    this.selectEl.addEventListener('change', () => {
      if (this.onChangeCallback) {
        this.onChangeCallback(this.selectEl.value);
      }
    });
  }
  
  addOption(value: string, text: string): MockDropdown {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = text;
    this.selectEl.appendChild(option);
    return this;
  }
  
  setValue(value: string): MockDropdown {
    this.selectEl.value = value;
    return this;
  }
  
  onChange(callback: (value: string) => void): MockDropdown {
    this.onChangeCallback = callback;
    return this;
  }
}

class MockSlider {
  sliderEl: HTMLInputElement;
  private onChangeCallback: ((value: number) => void) | null = null;
  
  constructor() {
    this.sliderEl = document.createElement('input');
    this.sliderEl.type = 'range';
    this.sliderEl.addEventListener('input', () => {
      if (this.onChangeCallback) {
        this.onChangeCallback(parseFloat(this.sliderEl.value));
      }
    });
  }
  
  setLimits(min: number, max: number, step: number): MockSlider {
    this.sliderEl.min = min.toString();
    this.sliderEl.max = max.toString();
    this.sliderEl.step = step.toString();
    return this;
  }
  
  setValue(value: number): MockSlider {
    this.sliderEl.value = value.toString();
    return this;
  }
  
  setDynamicTooltip(): MockSlider {
    // Mock implementation - doesn't need to do anything for tests
    return this;
  }
  
  onChange(callback: (value: number) => void): MockSlider {
    this.onChangeCallback = callback;
    return this;
  }
}

class MockToggle {
  toggleEl: HTMLInputElement;
  private onChangeCallback: ((value: boolean) => void) | null = null;
  
  constructor() {
    this.toggleEl = document.createElement('input');
    this.toggleEl.type = 'checkbox';
    this.toggleEl.addEventListener('change', () => {
      if (this.onChangeCallback) {
        this.onChangeCallback(this.toggleEl.checked);
      }
    });
  }
  
  setValue(value: boolean): MockToggle {
    this.toggleEl.checked = value;
    return this;
  }
  
  onChange(callback: (value: boolean) => void): MockToggle {
    this.onChangeCallback = callback;
    return this;
  }
}

class MockTextComponent {
  inputEl: HTMLInputElement;
  private onChangeCallback: ((value: string) => void) | null = null;
  
  constructor() {
    this.inputEl = document.createElement('input');
    this.inputEl.type = 'text';
    this.inputEl.addEventListener('input', () => {
      if (this.onChangeCallback) {
        this.onChangeCallback(this.inputEl.value);
      }
    });
  }
  
  setValue(value: string): MockTextComponent {
    this.inputEl.value = value;
    return this;
  }
  
  setPlaceholder(placeholder: string): MockTextComponent {
    this.inputEl.placeholder = placeholder;
    return this;
  }
  
  onChange(callback: (value: string) => void): MockTextComponent {
    this.onChangeCallback = callback;
    return this;
  }
}

class MockTextAreaComponent {
  inputEl: HTMLTextAreaElement;
  private onChangeCallback: ((value: string) => void) | null = null;
  
  constructor() {
    this.inputEl = document.createElement('textarea');
    this.inputEl.addEventListener('input', () => {
      if (this.onChangeCallback) {
        this.onChangeCallback(this.inputEl.value);
      }
    });
  }
  
  setValue(value: string): MockTextAreaComponent {
    this.inputEl.value = value;
    return this;
  }
  
  setPlaceholder(placeholder: string): MockTextAreaComponent {
    this.inputEl.placeholder = placeholder;
    return this;
  }
  
  onChange(callback: (value: string) => void): MockTextAreaComponent {
    this.onChangeCallback = callback;
    return this;
  }
}

export const VIEW_TYPE_TASK_PRIORITY = "task-priority-view";