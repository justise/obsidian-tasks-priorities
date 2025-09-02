// Setup file for Jest tests

// Mock Obsidian-specific HTMLElement methods
HTMLElement.prototype.empty = function() {
  while (this.firstChild) {
    this.removeChild(this.firstChild);
  }
};

HTMLElement.prototype.setText = function(text) {
  this.textContent = text;
};

HTMLElement.prototype.createEl = function(tagName, attrs = {}) {
  const el = document.createElement(tagName);
  
  if (attrs.text) {
    el.textContent = attrs.text;
  }
  
  if (attrs.cls) {
    if (Array.isArray(attrs.cls)) {
      el.className = attrs.cls.join(' ');
    } else {
      el.className = attrs.cls;
    }
  }
  
  if (attrs.attr) {
    Object.entries(attrs.attr).forEach(([key, value]) => {
      el.setAttribute(key, value);
    });
  }
  
  this.appendChild(el);
  return el;
};

// Mock other commonly used Obsidian DOM methods
HTMLElement.prototype.createDiv = function(attrs = {}) {
  return this.createEl('div', attrs);
};

HTMLElement.prototype.createSpan = function(attrs = {}) {
  return this.createEl('span', attrs);
};

HTMLElement.prototype.addClass = function(className) {
  this.classList.add(className);
};

HTMLElement.prototype.removeClass = function(className) {
  this.classList.remove(className);
};

HTMLElement.prototype.toggleClass = function(className, force) {
  if (force !== undefined) {
    this.classList.toggle(className, force);
  } else {
    this.classList.toggle(className);
  }
};

HTMLElement.prototype.hasClass = function(className) {
  return this.classList.contains(className);
};

// Mock DragEvent for drag and drop tests
global.DragEvent = class DragEvent extends Event {
  constructor(type, eventInitDict = {}) {
    super(type, eventInitDict);
    this.dataTransfer = eventInitDict.dataTransfer || {
      setData: jest.fn(),
      getData: jest.fn(),
      effectAllowed: 'all',
      dropEffect: 'none'
    };
  }
};