import TaskPriorityPlugin from './TaskPriorityPlugin';
import { TaskItem } from './types';
import { TFile } from 'obsidian';

// Mock Obsidian's App
class MockApp {
  vault = {
    process: jest.fn()
  };
}

describe('TaskPriorityPlugin', () => {
  let plugin: TaskPriorityPlugin;
  let mockApp: MockApp;

  beforeEach(() => {
    mockApp = new MockApp();
    plugin = new TaskPriorityPlugin(mockApp as any, {} as any);
  });

  describe('updateTaskCompletion', () => {
    it('should mark incomplete task as completed', async () => {
      const mockFile = new TFile('test.md');
      const task: TaskItem = {
        file: mockFile,
        line: 0,
        text: 'Test task',
        priority: 'Normal',
        originalText: '- [ ] Test task',
        completed: false
      };

      const mockFileContent = '- [ ] Test task\nOther content';
      const expectedContent = '- [x] Test task\nOther content';

      mockApp.vault.process.mockImplementation((file: TFile, processor: (data: string) => string) => {
        const result = processor(mockFileContent);
        expect(result).toBe(expectedContent);
        return Promise.resolve();
      });

      await plugin.updateTaskCompletion(task, true);
      
      expect(mockApp.vault.process).toHaveBeenCalledWith(mockFile, expect.any(Function));
    });

    it('should mark completed task as incomplete', async () => {
      const mockFile = new TFile('test.md');
      const task: TaskItem = {
        file: mockFile,
        line: 0,
        text: 'Test task',
        priority: 'Normal',
        originalText: '- [x] Test task',
        completed: true
      };

      const mockFileContent = '- [x] Test task\nOther content';
      const expectedContent = '- [ ] Test task\nOther content';

      mockApp.vault.process.mockImplementation((file: TFile, processor: (data: string) => string) => {
        const result = processor(mockFileContent);
        expect(result).toBe(expectedContent);
        return Promise.resolve();
      });

      await plugin.updateTaskCompletion(task, false);
      
      expect(mockApp.vault.process).toHaveBeenCalledWith(mockFile, expect.any(Function));
    });

    it('should handle uppercase X completion marker', async () => {
      const mockFile = new TFile('test.md');
      const task: TaskItem = {
        file: mockFile,
        line: 0,
        text: 'Test task',
        priority: 'Normal',
        originalText: '- [X] Test task',
        completed: true
      };

      const mockFileContent = '- [X] Test task\nOther content';
      const expectedContent = '- [ ] Test task\nOther content';

      mockApp.vault.process.mockImplementation((file: TFile, processor: (data: string) => string) => {
        const result = processor(mockFileContent);
        expect(result).toBe(expectedContent);
        return Promise.resolve();
      });

      await plugin.updateTaskCompletion(task, false);
      
      expect(mockApp.vault.process).toHaveBeenCalledWith(mockFile, expect.any(Function));
    });

    it('should handle numbered list task marking as completed', async () => {
      const mockFile = new TFile('test.md');
      const task: TaskItem = {
        file: mockFile,
        line: 0,
        text: 'Customer Obsession follow ups',
        priority: 'High',
        originalText: '2. [ ] Customer Obsession follow ups ⏫',
        completed: false
      };

      const mockFileContent = '2. [ ] Customer Obsession follow ups ⏫\nOther content';
      const expectedContent = '2. [x] Customer Obsession follow ups ⏫\nOther content';

      mockApp.vault.process.mockImplementation((file: TFile, processor: (data: string) => string) => {
        const result = processor(mockFileContent);
        expect(result).toBe(expectedContent);
        return Promise.resolve();
      });

      await plugin.updateTaskCompletion(task, true);
      
      expect(mockApp.vault.process).toHaveBeenCalledWith(mockFile, expect.any(Function));
    });

    it('should handle numbered list task unmarking', async () => {
      const mockFile = new TFile('test.md');
      const task: TaskItem = {
        file: mockFile,
        line: 0,
        text: 'Customer Obsession follow ups',
        priority: 'High',
        originalText: '2. [x] Customer Obsession follow ups ⏫',
        completed: true
      };

      const mockFileContent = '2. [x] Customer Obsession follow ups ⏫\nOther content';
      const expectedContent = '2. [ ] Customer Obsession follow ups ⏫\nOther content';

      mockApp.vault.process.mockImplementation((file: TFile, processor: (data: string) => string) => {
        const result = processor(mockFileContent);
        expect(result).toBe(expectedContent);
        return Promise.resolve();
      });

      await plugin.updateTaskCompletion(task, false);
      
      expect(mockApp.vault.process).toHaveBeenCalledWith(mockFile, expect.any(Function));
    });

    it('should handle tasks with different bullet types and indentation', async () => {
      const testCases = [
        {
          description: 'asterisk bullet',
          input: '* [ ] Task with asterisk bullet',
          expected: '* [x] Task with asterisk bullet'
        },
        {
          description: 'plus bullet',
          input: '+ [ ] Task with plus bullet',
          expected: '+ [x] Task with plus bullet'
        },
        {
          description: 'indented dash bullet',
          input: '  - [ ] Indented task',
          expected: '  - [x] Indented task'
        },
        {
          description: 'indented asterisk bullet',
          input: '    * [ ] Deeply indented task',
          expected: '    * [x] Deeply indented task'
        },
        {
          description: 'task with priority emoji',
          input: '- [ ] ⏫ High priority task',
          expected: '- [x] ⏫ High priority task'
        },
        {
          description: 'numbered list task',
          input: '1. [ ] First numbered task',
          expected: '1. [x] First numbered task'
        },
        {
          description: 'multi-digit numbered list task',
          input: '42. [ ] Task number forty-two',
          expected: '42. [x] Task number forty-two'
        },
        {
          description: 'indented numbered list task',
          input: '  3. [ ] Indented numbered task',
          expected: '  3. [x] Indented numbered task'
        },
        {
          description: 'numbered list with priority',
          input: '2. [ ] Customer Obsession follow ups ⏫',
          expected: '2. [x] Customer Obsession follow ups ⏫'
        }
      ];

      for (const testCase of testCases) {
        const mockFile = new TFile('test.md');
        const task: TaskItem = {
          file: mockFile,
          line: 0,
          text: 'Test task',
          priority: 'Normal',
          originalText: testCase.input,
          completed: false
        };

        mockApp.vault.process.mockImplementation((file: TFile, processor: (data: string) => string) => {
          const result = processor(testCase.input);
          expect(result).toBe(testCase.expected);
          return Promise.resolve();
        });

        await plugin.updateTaskCompletion(task, true);
        expect(mockApp.vault.process).toHaveBeenCalledWith(mockFile, expect.any(Function));
      }
    });

    it('should not modify other lines when updating task completion', async () => {
      const mockFile = new TFile('test.md');
      const task: TaskItem = {
        file: mockFile,
        line: 2,
        text: 'Middle task',
        priority: 'Normal',
        originalText: '- [ ] Middle task',
        completed: false
      };

      const mockFileContent = `- [ ] First task
- [x] Already completed
- [ ] Middle task
- [ ] Last task`;

      const expectedContent = `- [ ] First task
- [x] Already completed
- [x] Middle task
- [ ] Last task`;

      mockApp.vault.process.mockImplementation((file: TFile, processor: (data: string) => string) => {
        const result = processor(mockFileContent);
        expect(result).toBe(expectedContent);
        return Promise.resolve();
      });

      await plugin.updateTaskCompletion(task, true);
      
      expect(mockApp.vault.process).toHaveBeenCalledWith(mockFile, expect.any(Function));
    });
  });
});