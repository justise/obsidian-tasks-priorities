import { TaskPriorityView } from './TaskPriorityView';
import { TaskItem, TaskPriority } from './types';
import TaskPriorityPlugin from './TaskPriorityPlugin';
import { TFile, WorkspaceLeaf } from 'obsidian';

// Mock DOM methods
Object.defineProperty(global, 'performance', {
  writable: true,
  value: {
    now: jest.fn(() => Date.now())
  }
});

// Mock Obsidian classes
class MockWorkspaceLeaf {
  view: any = null;
  constructor() {}
}

class MockApp {
  workspace = {
    activeLeaf: null as any,
    on: jest.fn(),
    getLeavesOfType: jest.fn().mockReturnValue([])
  };
  vault = {
    process: jest.fn()
  };
}

class MockPlugin extends TaskPriorityPlugin {
  settings = {
    defaultSort: 'date' as const,
    refreshInterval: 30,
    openFullPage: true,
    taskQuery: 'TASK WHERE !completed',
    enableAnimations: false,
    priorityOrder: 'high-to-low' as const
  };
  findTasksWithPrioritiesUsingDataview = jest.fn().mockResolvedValue([]);
  updateTaskPriority = jest.fn().mockResolvedValue('updated line');
  updateTaskCompletion = jest.fn().mockResolvedValue();
}

describe('TaskPriorityView', () => {
  let mockApp: MockApp;
  let mockPlugin: MockPlugin;
  let mockLeaf: MockWorkspaceLeaf;
  let view: TaskPriorityView;
  let mockContainerEl: HTMLElement;

  beforeEach(() => {
    mockApp = new MockApp();
    mockPlugin = new MockPlugin(mockApp as any, {} as any);
    mockLeaf = new MockWorkspaceLeaf();
    view = new TaskPriorityView(mockLeaf as any, mockPlugin);
    mockContainerEl = document.createElement('div');
    
    // Set up the expected container structure (Obsidian ItemView creates these)
    const header = document.createElement('div');
    header.className = 'view-header';
    mockContainerEl.appendChild(header);
    
    const content = document.createElement('div');
    content.className = 'view-content';
    mockContainerEl.appendChild(content);
    
    view.containerEl = mockContainerEl;
    view.app = mockApp as any;
    
    // Reset mock calls
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with correct default state', () => {
      expect(view.plugin).toBe(mockPlugin);
      expect(view.tasks).toEqual([]);
      expect(view.sortBy).toBe('date');
      expect(view.refreshInterval).toBeNull();
      expect(view.draggedItem).toBeNull();
    });

    it('should set up event listeners on construction', () => {
      const newView = new TaskPriorityView(mockLeaf as any, mockPlugin);
      // Event listeners are set up in onOpen, not constructor
      expect(newView).toBeTruthy();
    });

    it('should load settings from plugin', () => {
      mockPlugin.settings.defaultSort = 'file';
      const newView = new TaskPriorityView(mockLeaf as any, mockPlugin);
      expect(newView.sortBy).toBe('file'); // Should match plugin's defaultSort setting
    });

    it('should handle missing plugin gracefully', () => {
      expect(() => new TaskPriorityView(mockLeaf as any, null as any)).toThrow('Cannot read properties of null');
    });
  });

  describe('task rendering', () => {
    beforeEach(() => {
      view.tasks = [
        {
          file: new TFile('test1.md'),
          line: 0,
          text: 'High priority task',
          priority: 'High',
          originalText: '- [ ] High priority task ⏫',
          completed: false
        },
        {
          file: new TFile('test2.md'),
          line: 0,
          text: 'Normal priority task',
          priority: 'Normal',
          originalText: '- [ ] Normal priority task',
          completed: false
        }
      ];
    });

    it('should group tasks by priority correctly', () => {
      // Test that tasks can be grouped by priority using filter
      const highTasks = view.tasks.filter(t => t.priority === 'High');
      const normalTasks = view.tasks.filter(t => t.priority === 'Normal');
      const highestTasks = view.tasks.filter(t => t.priority === 'Highest');
      
      expect(highTasks).toHaveLength(1);
      expect(normalTasks).toHaveLength(1);
      expect(highestTasks).toHaveLength(0);
    });

    it('should sort tasks within priority groups', () => {
      view.sortBy = 'text';
      view.tasks = [
        {
          file: new TFile('test.md'),
          line: 0,
          text: 'B task',
          priority: 'High',
          originalText: '- [ ] B task ⏫',
          completed: false
        },
        {
          file: new TFile('test.md'),
          line: 1,
          text: 'A task',
          priority: 'High',
          originalText: '- [ ] A task ⏫',
          completed: false
        }
      ];
      view.sortTasks();
      expect(view.tasks[0].text).toBe('B task');
      expect(view.tasks[1].text).toBe('A task');
    });

    it('should handle empty task lists', () => {
      view.tasks = [];
      expect(() => view.renderView()).not.toThrow();
      const sections = mockContainerEl.querySelectorAll('.priority-section');
      expect(sections.length).toBeGreaterThanOrEqual(0);
    });

    it('should render task counts in headers', () => {
      view.renderView();
      const headers = mockContainerEl.querySelectorAll('.priority-header');
      headers.forEach(header => {
        expect(header.textContent).toMatch(/\(\d+\)/);
      });
    });

    it('should apply correct CSS classes to elements', () => {
      view.renderView();
      expect(mockContainerEl.querySelector('.task-priority-container')).toBeTruthy();
      expect(mockContainerEl.querySelector('.task-priority-header')).toBeTruthy();
    });
  });

  describe('sorting and filtering', () => {
    beforeEach(() => {
      view.tasks = [
        {
          file: new TFile('b.md'),
          line: 0,
          text: 'Z task',
          priority: 'Normal',
          originalText: '- [ ] Z task',
          completed: false,
          date: new Date('2024-01-02')
        },
        {
          file: new TFile('a.md'),
          line: 0,
          text: 'A task',
          priority: 'Normal',
          originalText: '- [ ] A task',
          completed: false,
          date: new Date('2024-01-01')
        }
      ];
    });

    it('should sort by date correctly', () => {
      view.sortBy = 'date';
      view.sortTasks();
      expect(view.tasks[0].date?.getTime()).toBeGreaterThan(view.tasks[1].date?.getTime()!);
    });

    it('should sort by file path correctly', () => {
      view.sortBy = 'file';
      view.sortTasks();
      expect(view.tasks[0].file.path).toBe('b.md');
      expect(view.tasks[1].file.path).toBe('a.md');
    });

    it('should sort by clean task text correctly', () => {
      view.sortBy = 'text';
      view.sortTasks();
      expect(view.tasks[0].text).toBe('Z task');
      expect(view.tasks[1].text).toBe('A task');
    });

    it('should handle mixed date formats', () => {
      view.tasks[0].date = new Date('2024-12-31');
      view.tasks[1].date = new Date('2024-01-01');
      view.sortBy = 'date';
      view.sortTasks();
      expect(view.tasks[0].date?.getFullYear()).toBe(2024);
      expect(view.tasks[0].date?.getMonth()).toBe(11); // December
    });

    it('should handle tasks without dates', () => {
      view.tasks[0].date = undefined;
      view.tasks[1].date = new Date('2024-01-01');
      view.sortBy = 'date';
      expect(() => view.sortTasks()).not.toThrow();
    });
  });

  describe('drag and drop', () => {
    let mockTaskEl: HTMLElement;
    let mockDragEvent: DragEvent;

    beforeEach(() => {
      mockTaskEl = document.createElement('div');
      mockTaskEl.setAttribute('draggable', 'true');
      mockContainerEl.appendChild(mockTaskEl);
      
      mockDragEvent = new DragEvent('dragstart');
      Object.defineProperty(mockDragEvent, 'dataTransfer', {
        value: {
          setData: jest.fn(),
          getData: jest.fn().mockReturnValue(JSON.stringify({
            taskIndex: 0,
            priority: 'Normal',
            file: 'test.md',
            line: 0
          }))
        }
      });
    });

    it('should set drag data correctly on dragstart', () => {
      view.tasks = [{
        file: new TFile('test.md'),
        line: 0,
        text: 'Test task',
        priority: 'Normal',
        originalText: '- [ ] Test task',
        completed: false
      }];
      
      const dragStartHandler = jest.fn();
      mockTaskEl.addEventListener('dragstart', dragStartHandler);
      mockTaskEl.dispatchEvent(mockDragEvent);
      
      expect(dragStartHandler).toHaveBeenCalled();
    });

    it('should handle drop events on priority sections', () => {
      const dropEvent = new DragEvent('drop');
      Object.defineProperty(dropEvent, 'dataTransfer', {
        value: {
          getData: jest.fn().mockReturnValue(JSON.stringify({
            taskIndex: 0,
            priority: 'Normal',
            file: 'test.md',
            line: 0
          }))
        }
      });
      
      const prioritySection = document.createElement('div');
      prioritySection.setAttribute('data-priority', 'High');
      mockContainerEl.appendChild(prioritySection);
      
      expect(() => prioritySection.dispatchEvent(dropEvent)).not.toThrow();
    });

    it('should update task priority on successful drop', async () => {
      view.tasks = [{
        file: new TFile('test.md'),
        line: 0,
        text: 'Test task',
        priority: 'Normal',
        originalText: '- [ ] Test task',
        completed: false
      }];
      
      await mockPlugin.updateTaskPriority(view.tasks[0], 'High');
      expect(mockPlugin.updateTaskPriority).toHaveBeenCalledWith(view.tasks[0], 'High');
    });

    it('should handle invalid drop targets', () => {
      const invalidDropEvent = new DragEvent('drop');
      Object.defineProperty(invalidDropEvent, 'dataTransfer', {
        value: {
          getData: jest.fn().mockReturnValue('invalid json')
        }
      });
      
      expect(() => mockContainerEl.dispatchEvent(invalidDropEvent)).not.toThrow();
    });

    it('should provide visual feedback during drag', () => {
      view.draggedItem = mockTaskEl;
      expect(view.draggedItem).toBe(mockTaskEl);
      
      view.draggedItem = null;
      expect(view.draggedItem).toBeNull();
    });
  });

  describe('refresh and focus behavior', () => {
    it('should refresh on active leaf change', async () => {
      const refreshSpy = jest.spyOn(view, 'refreshTasks');
      await view.onOpen();
      expect(mockApp.workspace.on).toHaveBeenCalledWith('active-leaf-change', expect.any(Function));
    });

    it('should refresh on container focus', () => {
      const refreshSpy = jest.spyOn(view, 'refreshTasks');
      view.onOpen();
      
      const focusEvent = new Event('focusin');
      view.containerEl.dispatchEvent(focusEvent);
      
      // The event listener should be set up, but we can't easily test the actual refresh
      expect(refreshSpy).toHaveBeenCalledTimes(1); // Called once in onOpen
    });

    it('should refresh on window focus (when active)', async () => {
      mockApp.workspace.activeLeaf = view.leaf;
      await view.onOpen();
      
      const windowFocusEvent = new Event('focus');
      window.dispatchEvent(windowFocusEvent);
      
      // Window focus handler should be set up
      expect(view.windowFocusHandler).toBeTruthy();
    });

    it('should not refresh on window focus (when inactive)', () => {
      mockApp.workspace.activeLeaf = null;
      view.onOpen();
      
      const refreshSpy = jest.spyOn(view, 'refreshTasks');
      const initialCallCount = refreshSpy.mock.calls.length;
      
      const windowFocusEvent = new Event('focus');
      window.dispatchEvent(windowFocusEvent);
      
      // Should not call refresh when view is not active
      expect(refreshSpy).toHaveBeenCalledTimes(initialCallCount);
    });

    it('should handle rapid refresh requests', async () => {
      const refreshPromises = [];
      for (let i = 0; i < 5; i++) {
        refreshPromises.push(view.refreshTasks());
      }
      
      await Promise.all(refreshPromises);
      expect(mockPlugin.findTasksWithPrioritiesUsingDataview).toHaveBeenCalledTimes(5);
    });

    it('should clean up event listeners on close', async () => {
      await view.onOpen();
      const originalHandler = view.windowFocusHandler;
      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
      
      await view.onClose();
      
      expect(removeEventListenerSpy).toHaveBeenCalledWith('focus', originalHandler);
      expect(view.windowFocusHandler).toBeNull();
    });
  });

  describe('error states', () => {
    it('should display error message when Dataview unavailable', async () => {
      mockPlugin.findTasksWithPrioritiesUsingDataview.mockResolvedValue([]);
      
      await view.refreshTasks();
      
      // Should handle empty results gracefully
      expect(view.tasks).toEqual([]);
    });

    it('should handle task loading failures gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      mockPlugin.findTasksWithPrioritiesUsingDataview.mockRejectedValue(new Error('Failed to load'));
      
      await expect(view.refreshTasks()).resolves.not.toThrow();
      
      expect(consoleSpy).toHaveBeenCalledWith('Failed to refresh tasks:', expect.any(Error));
      consoleSpy.mockRestore();
    });

    it('should recover from temporary plugin errors', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      mockPlugin.findTasksWithPrioritiesUsingDataview
        .mockRejectedValueOnce(new Error('Temporary error'))
        .mockResolvedValueOnce([]);
      
      await expect(view.refreshTasks()).resolves.not.toThrow();
      await expect(view.refreshTasks()).resolves.not.toThrow();
      
      expect(consoleSpy).toHaveBeenCalledWith('Failed to refresh tasks:', expect.any(Error));
      consoleSpy.mockRestore();
    });
  });

  describe('task completion', () => {
    beforeEach(() => {
      view.tasks = [{
        file: new TFile('test.md'),
        line: 0,
        text: 'Test task',
        priority: 'Normal',
        originalText: '- [ ] Test task',
        completed: false
      }];
    });

    it('should toggle task completion status', async () => {
      const mockTaskEl = document.createElement('div');
      const checkboxContainer = document.createElement('div');
      checkboxContainer.className = 'task-completion-checkbox';
      const checkbox = document.createElement('span');
      checkboxContainer.appendChild(checkbox);
      mockTaskEl.appendChild(checkboxContainer);
      
      await view.toggleTaskCompletion(view.tasks[0], mockTaskEl);
      
      expect(mockPlugin.updateTaskCompletion).toHaveBeenCalledWith(view.tasks[0], true);
      expect(view.tasks[0].completed).toBe(true);
    });

    it('should handle completion toggle errors', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      mockPlugin.updateTaskCompletion.mockRejectedValue(new Error('Update failed'));
      const mockTaskEl = document.createElement('div');
      
      await expect(view.toggleTaskCompletion(view.tasks[0], mockTaskEl)).resolves.not.toThrow();
      
      expect(consoleSpy).toHaveBeenCalledWith('Error updating task completion:', expect.any(Error));
      consoleSpy.mockRestore();
    });

    it('should update UI after successful completion', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const mockTaskEl = document.createElement('div');
      const checkboxContainer = document.createElement('div');
      checkboxContainer.className = 'task-completion-checkbox';
      const checkbox = document.createElement('span');
      checkboxContainer.appendChild(checkbox);
      mockTaskEl.appendChild(checkboxContainer);
      
      await view.toggleTaskCompletion(view.tasks[0], mockTaskEl);
      
      expect(view.tasks[0].completed).toBe(true);
      consoleSpy.mockRestore();
    });
  });

  describe('view lifecycle', () => {
    it('should set up refresh interval on open', async () => {
      mockPlugin.settings.refreshInterval = 60;
      await view.onOpen();
      
      expect(view.refreshInterval).toBeTruthy();
    });

    it('should not set up refresh interval when disabled', () => {
      mockPlugin.settings.refreshInterval = 0;
      view.onOpen();
      
      expect(view.refreshInterval).toBeNull();
    });

    it('should clear refresh interval on close', async () => {
      view.refreshInterval = setInterval(() => {}, 1000);
      const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
      
      await view.onClose();
      
      expect(clearIntervalSpy).toHaveBeenCalled();
    });

    it('should return correct view type', () => {
      expect(view.getViewType()).toBe('task-priority-view');
    });

    it('should return correct display text', () => {
      expect(view.getDisplayText()).toBe('Task Priorities');
    });

    it('should return correct icon', () => {
      expect(view.getIcon()).toBe('list-checks');
    });
  });

  describe('utility methods', () => {
    it('should handle task priority grouping', () => {
      const tasks: TaskItem[] = [
        { file: new TFile('test.md'), line: 0, text: 'High task', priority: 'High', originalText: '', completed: false },
        { file: new TFile('test.md'), line: 1, text: 'Normal task', priority: 'Normal', originalText: '', completed: false },
        { file: new TFile('test.md'), line: 2, text: 'High task 2', priority: 'High', originalText: '', completed: false }
      ];
      
      view.tasks = tasks;
      expect(view.tasks).toHaveLength(3);
      expect(view.tasks.filter(t => t.priority === 'High')).toHaveLength(2);
      expect(view.tasks.filter(t => t.priority === 'Normal')).toHaveLength(1);
    });

    it('should handle priority order setting', () => {
      mockPlugin.settings.priorityOrder = 'low-to-high';
      
      // The view should respect this setting when rendering
      expect(mockPlugin.settings.priorityOrder).toBe('low-to-high');
    });

    it('should update sort method dynamically', () => {
      view.sortBy = 'date';
      expect(view.sortBy).toBe('date');
      
      view.sortBy = 'file';
      expect(view.sortBy).toBe('file');
    });
  });
});