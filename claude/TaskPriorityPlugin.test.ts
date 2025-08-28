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
    it('should mark incomplete task as completed with completion date', async () => {
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
      const today = new Date().toISOString().split('T')[0];
      const expectedContent = `- [x] Test task ✅ ${today}\nOther content`;

      mockApp.vault.process.mockImplementation((file: TFile, processor: (data: string) => string) => {
        const result = processor(mockFileContent);
        expect(result).toBe(expectedContent);
        return Promise.resolve();
      });

      await plugin.updateTaskCompletion(task, true);
      
      expect(mockApp.vault.process).toHaveBeenCalledWith(mockFile, expect.any(Function));
    });

    it('should mark completed task as incomplete and remove completion date', async () => {
      const mockFile = new TFile('test.md');
      const task: TaskItem = {
        file: mockFile,
        line: 0,
        text: 'Test task',
        priority: 'Normal',
        originalText: '- [x] Test task ✅ 2023-12-01',
        completed: true
      };

      const mockFileContent = '- [x] Test task ✅ 2023-12-01\nOther content';
      const expectedContent = '- [ ] Test task\nOther content';

      mockApp.vault.process.mockImplementation((file: TFile, processor: (data: string) => string) => {
        const result = processor(mockFileContent);
        expect(result).toBe(expectedContent);
        return Promise.resolve();
      });

      await plugin.updateTaskCompletion(task, false);
      
      expect(mockApp.vault.process).toHaveBeenCalledWith(mockFile, expect.any(Function));
    });

    it('should handle uppercase X completion marker with completion date', async () => {
      const mockFile = new TFile('test.md');
      const task: TaskItem = {
        file: mockFile,
        line: 0,
        text: 'Test task',
        priority: 'Normal',
        originalText: '- [X] Test task ✅ 2023-12-01',
        completed: true
      };

      const mockFileContent = '- [X] Test task ✅ 2023-12-01\nOther content';
      const expectedContent = '- [ ] Test task\nOther content';

      mockApp.vault.process.mockImplementation((file: TFile, processor: (data: string) => string) => {
        const result = processor(mockFileContent);
        expect(result).toBe(expectedContent);
        return Promise.resolve();
      });

      await plugin.updateTaskCompletion(task, false);
      
      expect(mockApp.vault.process).toHaveBeenCalledWith(mockFile, expect.any(Function));
    });

    it('should handle numbered list task marking as completed with date', async () => {
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
      const today = new Date().toISOString().split('T')[0];
      const expectedContent = `2. [x] Customer Obsession follow ups ⏫ ✅ ${today}\nOther content`;

      mockApp.vault.process.mockImplementation((file: TFile, processor: (data: string) => string) => {
        const result = processor(mockFileContent);
        expect(result).toBe(expectedContent);
        return Promise.resolve();
      });

      await plugin.updateTaskCompletion(task, true);
      
      expect(mockApp.vault.process).toHaveBeenCalledWith(mockFile, expect.any(Function));
    });

    it('should handle numbered list task unmarking and remove completion date', async () => {
      const mockFile = new TFile('test.md');
      const task: TaskItem = {
        file: mockFile,
        line: 0,
        text: 'Customer Obsession follow ups',
        priority: 'High',
        originalText: '2. [x] Customer Obsession follow ups ⏫ ✅ 2023-12-01',
        completed: true
      };

      const mockFileContent = '2. [x] Customer Obsession follow ups ⏫ ✅ 2023-12-01\nOther content';
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
          expectedPattern: /^\* \[x\] Task with asterisk bullet ✅ \d{4}-\d{2}-\d{2}$/
        },
        {
          description: 'plus bullet',
          input: '+ [ ] Task with plus bullet',
          expectedPattern: /^\+ \[x\] Task with plus bullet ✅ \d{4}-\d{2}-\d{2}$/
        },
        {
          description: 'indented dash bullet',
          input: '  - [ ] Indented task',
          expectedPattern: /^  - \[x\] Indented task ✅ \d{4}-\d{2}-\d{2}$/
        },
        {
          description: 'indented asterisk bullet',
          input: '    * [ ] Deeply indented task',
          expectedPattern: /^    \* \[x\] Deeply indented task ✅ \d{4}-\d{2}-\d{2}$/
        },
        {
          description: 'task with priority emoji',
          input: '- [ ] ⏫ High priority task',
          expectedPattern: /^- \[x\] ⏫ High priority task ✅ \d{4}-\d{2}-\d{2}$/
        },
        {
          description: 'numbered list task',
          input: '1. [ ] First numbered task',
          expectedPattern: /^1\. \[x\] First numbered task ✅ \d{4}-\d{2}-\d{2}$/
        },
        {
          description: 'multi-digit numbered list task',
          input: '42. [ ] Task number forty-two',
          expectedPattern: /^42\. \[x\] Task number forty-two ✅ \d{4}-\d{2}-\d{2}$/
        },
        {
          description: 'indented numbered list task',
          input: '  3. [ ] Indented numbered task',
          expectedPattern: /^  3\. \[x\] Indented numbered task ✅ \d{4}-\d{2}-\d{2}$/
        },
        {
          description: 'numbered list with priority',
          input: '2. [ ] Customer Obsession follow ups ⏫',
          expectedPattern: /^2\. \[x\] Customer Obsession follow ups ⏫ ✅ \d{4}-\d{2}-\d{2}$/
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
          expect(result).toMatch(testCase.expectedPattern);
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

      const today = new Date().toISOString().split('T')[0];
      const expectedContent = `- [ ] First task
- [x] Already completed
- [x] Middle task ✅ ${today}
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