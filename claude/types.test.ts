import { getTaskPriority, setTaskPriorityInLine, getCleanTaskTitle, TaskPriority } from './types';

describe('getTaskPriority', () => {
  it('should detect highest priority emoji 🔺', () => {
    const line = '- [ ] Fix critical bug 🔺';
    const result = getTaskPriority(line);
    expect(result).toBe(TaskPriority.Highest);
  });

  it('should detect high priority emoji ⏫', () => {
    const line = '- [ ] Important meeting ⏫';
    const result = getTaskPriority(line);
    expect(result).toBe(TaskPriority.High);
  });

  it('should detect medium priority emoji 🔼', () => {
    const line = '- [ ] Update documentation 🔼';
    const result = getTaskPriority(line);
    expect(result).toBe(TaskPriority.Medium);
  });

  it('should detect low priority emoji 🔽', () => {
    const line = '- [ ] Clean up code 🔽';
    const result = getTaskPriority(line);
    expect(result).toBe(TaskPriority.Low);
  });

  it('should detect lowest priority emoji ⏬️', () => {
    const line = '- [ ] Maybe someday task ⏬️';
    const result = getTaskPriority(line);
    expect(result).toBe(TaskPriority.Lowest);
  });

  it('should return Normal for tasks without priority emojis', () => {
    const line = '- [ ] Regular task';
    const result = getTaskPriority(line);
    expect(result).toBe(TaskPriority.Normal);
  });

  it('should handle multiple emojis in same line (first match wins)', () => {
    const line = '- [ ] Task with 🔺 and ⏫ emojis';
    const result = getTaskPriority(line);
    expect(result).toBe(TaskPriority.Highest);
  });

  it('should handle emojis anywhere in the line', () => {
    const line = 'Some text 🔼 more text - [ ] Task content';
    const result = getTaskPriority(line);
    expect(result).toBe(TaskPriority.Medium);
  });

  it('should be case insensitive to surrounding text', () => {
    const line = 'URGENT TASK ⏫ WITH CAPS';
    const result = getTaskPriority(line);
    expect(result).toBe(TaskPriority.High);
  });

  it('should handle empty string', () => {
    const line = '';
    const result = getTaskPriority(line);
    expect(result).toBe(TaskPriority.Normal);
  });

  it('should handle undefined input gracefully', () => {
    const line = undefined as any;
    const result = getTaskPriority(line);
    expect(result).toBe(TaskPriority.Normal);
  });
});

describe('setTaskPriorityInLine', () => {
  it('should add highest priority emoji to normal task', () => {
    const line = '- [ ] Normal task';
    const result = setTaskPriorityInLine(line, 'Highest');
    expect(result).toBe('- [ ] Normal task 🔺');
  });

  it('should replace existing priority with new priority', () => {
    const line = '- [ ] Task with priority ⏫';
    const result = setTaskPriorityInLine(line, 'Medium');
    expect(result).toBe('- [ ] Task with priority 🔼');
  });

  it('should remove priority emoji when setting to Normal', () => {
    const line = '- [ ] High priority task ⏫';
    const result = setTaskPriorityInLine(line, 'Normal');
    expect(result).toBe('- [ ] High priority task');
  });

  it('should handle multiple existing emojis correctly', () => {
    const line = '- [ ] Task 🔺 with 🔼 multiple ⏫ emojis';
    const result = setTaskPriorityInLine(line, 'Low');
    expect(result).toBe('- [ ] Task with multiple emojis 🔽');
  });

  it('should preserve task content while changing priority', () => {
    const line = '- [ ] Task with #tags and @mentions ⏫';
    const result = setTaskPriorityInLine(line, 'Lowest');
    expect(result).toBe('- [ ] Task with #tags and @mentions ⏬️');
  });

  it('should handle whitespace correctly', () => {
    const line = '  - [ ]   Spaced task   ⏫   ';
    const result = setTaskPriorityInLine(line, 'High');
    expect(result).toBe('- [ ] Spaced task ⏫');
  });

  it('should handle empty priority gracefully', () => {
    const line = '- [ ] Task with priority ⏫';
    const result = setTaskPriorityInLine(line, '');
    expect(result).toBe('- [ ] Task with priority');
  });

  it('should handle undefined priority gracefully', () => {
    const line = '- [ ] Task with priority ⏫';
    const result = setTaskPriorityInLine(line, undefined as any);
    expect(result).toBe('- [ ] Task with priority');
  });

  it('should handle invalid priority strings', () => {
    const line = '- [ ] Task';
    const result = setTaskPriorityInLine(line, 'InvalidPriority');
    expect(result).toBe('- [ ] Task');
  });

  it('should not duplicate spaces when adding emojis', () => {
    const line = '- [ ] Task content  ';
    const result = setTaskPriorityInLine(line, 'High');
    expect(result).toBe('- [ ] Task content ⏫');
  });

  it('should handle completed tasks', () => {
    const line = '- [x] Completed task ⏫';
    const result = setTaskPriorityInLine(line, 'Medium');
    expect(result).toBe('- [x] Completed task 🔼');
  });

  it('should handle numbered lists', () => {
    const line = '1. [ ] Numbered task ⏫';
    const result = setTaskPriorityInLine(line, 'Lowest');
    expect(result).toBe('1. [ ] Numbered task ⏬️');
  });

  it('should handle empty line', () => {
    const line = '';
    const result = setTaskPriorityInLine(line, 'High');
    expect(result).toBe('⏫');
  });
});

describe('getCleanTaskTitle', () => {
  it('should handle malformed markdown gracefully', () => {
    const taskText = '- [] Malformed checkbox';
    const result = getCleanTaskTitle(taskText);
    expect(result).toBe('Malformed checkbox');
  });

  it('should preserve unicode characters in task text', () => {
    const taskText = '- [ ] Task with 中文 and émojis 🎉';
    const result = getCleanTaskTitle(taskText);
    expect(result).toBe('Task with 中文 and émojis 🎉');
  });

  it('should handle very long task titles', () => {
    const longTitle = 'Very '.repeat(100) + 'long task title';
    const taskText = `- [ ] ${longTitle}`;
    const result = getCleanTaskTitle(taskText);
    expect(result).toBe(longTitle);
  });

  it('should handle tasks with only whitespace', () => {
    const taskText = '- [ ]     ';
    const result = getCleanTaskTitle(taskText);
    expect(result).toBe('');
  });

  it('should handle mixed bullet and checkbox formats', () => {
    const taskText = '* [X] Mixed format task';
    const result = getCleanTaskTitle(taskText);
    expect(result).toBe('Mixed format task');
  });

  it('should handle deeply nested tasks', () => {
    const taskText = '        - [ ] Deeply nested task';
    const result = getCleanTaskTitle(taskText);
    expect(result).toBe('Deeply nested task');
  });

  it('should handle tasks with special characters', () => {
    const taskText = '- [ ] Task with @#$%^&*()_+-={}[]|\\:";\'<>?,./';
    const result = getCleanTaskTitle(taskText);
    expect(result).toBe('Task with @#$%^&*()_+-={}[]|\\:";\'<>?,./');
  });

  it('should handle tasks with line breaks in input', () => {
    const taskText = '- [ ] Task with\nnewline';
    const result = getCleanTaskTitle(taskText);
    expect(result).toBe('Task with\nnewline');
  });

  it('should handle empty string input', () => {
    const taskText = '';
    const result = getCleanTaskTitle(taskText);
    expect(result).toBe('');
  });

  it('should handle null/undefined input gracefully', () => {
    const result1 = getCleanTaskTitle(null as any);
    const result2 = getCleanTaskTitle(undefined as any);
    expect(result1).toBe('');
    expect(result2).toBe('');
  });
});