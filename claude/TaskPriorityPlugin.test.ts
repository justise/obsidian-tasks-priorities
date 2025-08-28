import TaskPriorityPlugin from './TaskPriorityPlugin';
import { TaskItem, getCleanTaskTitle } from './types';
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

  describe('updateTaskPriority', () => {
    it('should update task priority and return clean title text without checkbox', async () => {
      const mockFile = new TFile('test.md');
      const task: TaskItem = {
        file: mockFile,
        line: 0,
        text: '[ ] Customer Obsession follow ups',
        priority: 'Normal',
        originalText: '- [ ] Customer Obsession follow ups',
        completed: false
      };

      const mockFileContent = '- [ ] Customer Obsession follow ups\nOther content';
      const expectedFileContent = '- [ ] Customer Obsession follow ups ⏫\nOther content';

      mockApp.vault.process.mockImplementation((file: TFile, processor: (data: string) => string) => {
        const result = processor(mockFileContent);
        expect(result).toBe(expectedFileContent);
        return Promise.resolve(result);
      });

      const updatedLine = await plugin.updateTaskPriority(task, 'High');
      
      // The returned line should be the updated line from the file
      expect(updatedLine).toBe('- [ ] Customer Obsession follow ups ⏫');
      expect(mockApp.vault.process).toHaveBeenCalledWith(mockFile, expect.any(Function));
      
      // The task text should be cleaned for display (without checkbox and bullet)
      const cleanTaskTitle = getCleanTaskTitle(updatedLine);
      expect(cleanTaskTitle).toBe('Customer Obsession follow ups ⏫');
    });

    it('should update numbered list task priority and return clean title', async () => {
      const mockFile = new TFile('test.md');
      const task: TaskItem = {
        file: mockFile,
        line: 0,
        text: '[ ] Customer Obsession follow ups',
        priority: 'Normal',
        originalText: '2. [ ] Customer Obsession follow ups',
        completed: false
      };

      const mockFileContent = '2. [ ] Customer Obsession follow ups\nOther content';
      const expectedFileContent = '2. [ ] Customer Obsession follow ups 🔺\nOther content';

      mockApp.vault.process.mockImplementation((file: TFile, processor: (data: string) => string) => {
        const result = processor(mockFileContent);
        expect(result).toBe(expectedFileContent);
        return Promise.resolve(result);
      });

      const updatedLine = await plugin.updateTaskPriority(task, 'Highest');
      
      // The returned line should be the updated line from the file
      expect(updatedLine).toBe('2. [ ] Customer Obsession follow ups 🔺');
      expect(mockApp.vault.process).toHaveBeenCalledWith(mockFile, expect.any(Function));
      
      // The task text should be cleaned for display (without checkbox and numbering)
      const cleanTaskTitle = getCleanTaskTitle(updatedLine);
      expect(cleanTaskTitle).toBe('Customer Obsession follow ups 🔺');
    });

    it('should preserve task content and add priority emoji correctly', async () => {
      const mockFile = new TFile('test.md');
      const task: TaskItem = {
        file: mockFile,
        line: 0,
        text: '[ ] Review API documentation with team #urgent @john',
        priority: 'Normal', 
        originalText: '- [ ] Review API documentation with team #urgent @john',
        completed: false
      };

      const mockFileContent = '- [ ] Review API documentation with team #urgent @john\nOther content';
      const expectedFileContent = '- [ ] Review API documentation with team #urgent @john 🔼\nOther content';

      mockApp.vault.process.mockImplementation((file: TFile, processor: (data: string) => string) => {
        const result = processor(mockFileContent);
        expect(result).toBe(expectedFileContent);
        return Promise.resolve(result);
      });

      const updatedLine = await plugin.updateTaskPriority(task, 'Medium');
      
      expect(updatedLine).toBe('- [ ] Review API documentation with team #urgent @john 🔼');
      
      // The clean title should show the task content with priority but without checkbox
      const cleanTaskTitle = getCleanTaskTitle(updatedLine);
      expect(cleanTaskTitle).toBe('Review API documentation with team #urgent @john 🔼');
    });
  });

  describe('getCleanTaskTitle', () => {
    it('should remove checkbox and bullet from task titles', () => {
      const testCases = [
        {
          input: '- [ ] Customer Obsession follow ups ⏫',
          expected: 'Customer Obsession follow ups ⏫'
        },
        {
          input: '* [x] Complete project documentation',
          expected: 'Complete project documentation'
        },
        {
          input: '+ [ ] Review code changes 🔺',
          expected: 'Review code changes 🔺'
        },
        {
          input: '1. [ ] First task in numbered list',
          expected: 'First task in numbered list'
        },
        {
          input: '42. [X] Multi-digit numbered task',
          expected: 'Multi-digit numbered task'
        },
        {
          input: '  - [ ] Indented task with spaces',
          expected: 'Indented task with spaces'
        },
        {
          input: '\t3. [ ] Tab-indented numbered task',
          expected: 'Tab-indented numbered task'
        },
        {
          input: '- [ ] Task with #tags and @mentions 🔼',
          expected: 'Task with #tags and @mentions 🔼'
        }
      ];

      testCases.forEach(testCase => {
        const result = getCleanTaskTitle(testCase.input);
        expect(result).toBe(testCase.expected);
      });
    });

    it('should handle edge cases correctly', () => {
      // Empty or minimal inputs
      expect(getCleanTaskTitle('- [ ] ')).toBe('');
      expect(getCleanTaskTitle('1. [x] ')).toBe('');
      
      // Just task text without formatting
      expect(getCleanTaskTitle('Plain task text')).toBe('Plain task text');
      
      // Mixed spacing
      expect(getCleanTaskTitle('  -   [  ]   Task with weird spacing  ')).toBe('Task with weird spacing');
    });
  });
});