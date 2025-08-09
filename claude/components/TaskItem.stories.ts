import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { fn } from '@storybook/test';
import './TaskItem';
import type { TaskItem } from '../types';

// Mock TFile for storybook
const mockFile = {
  path: 'project/tasks.md',
  name: 'tasks.md',
  basename: 'tasks',
  extension: 'md'
};

const meta: Meta = {
  title: 'Components/TaskItem',
  component: 'task-item',
  parameters: {
    docs: {
      description: {
        component: 'A task item component that displays individual tasks with completion status, priority, and file information.'
      }
    }
  },
  argTypes: {
    task: {
      control: 'object',
      description: 'The task data object'
    },
    draggable: {
      control: 'boolean',
      description: 'Whether the task item can be dragged'
    },
    onToggleCompletion: {
      description: 'Callback when task completion is toggled'
    },
    onFileClick: {
      description: 'Callback when file info is clicked'
    }
  }
};

export default meta;
type Story = StoryObj;

const baseTask: TaskItem = {
  file: mockFile as any,
  line: 5,
  text: 'Complete the task prioritizer plugin documentation',
  priority: 'High',
  originalText: '- [ ] Complete the task prioritizer plugin documentation 🔼',
  completed: false,
  date: new Date('2024-01-15')
};

export const Default: Story = {
  args: {
    task: baseTask,
    draggable: true,
    onToggleCompletion: fn(),
    onFileClick: fn()
  },
  render: (args) => html`
    <task-item
      .task="${args.task}"
      .draggable="${args.draggable}"
      .onToggleCompletion="${args.onToggleCompletion}"
      .onFileClick="${args.onFileClick}"
    ></task-item>
  `
};

export const CompletedTask: Story = {
  args: {
    task: {
      ...baseTask,
      completed: true,
      text: 'Set up project structure',
      originalText: '- [x] Set up project structure'
    },
    draggable: true,
    onToggleCompletion: fn(),
    onFileClick: fn()
  },
  render: (args) => html`
    <task-item
      .task="${args.task}"
      .draggable="${args.draggable}"
      .onToggleCompletion="${args.onToggleCompletion}"
      .onFileClick="${args.onFileClick}"
    ></task-item>
  `
};

export const HighPriorityTask: Story = {
  args: {
    task: {
      ...baseTask,
      priority: 'Highest',
      text: 'Fix critical security vulnerability',
      originalText: '- [ ] Fix critical security vulnerability 🔺'
    },
    draggable: true,
    onToggleCompletion: fn(),
    onFileClick: fn()
  },
  render: (args) => html`
    <task-item
      .task="${args.task}"
      .draggable="${args.draggable}"
      .onToggleCompletion="${args.onToggleCompletion}"
      .onFileClick="${args.onFileClick}"
    ></task-item>
  `
};

export const LowPriorityTask: Story = {
  args: {
    task: {
      ...baseTask,
      priority: 'Low',
      text: 'Update README with new features',
      originalText: '- [ ] Update README with new features 🔽'
    },
    draggable: true,
    onToggleCompletion: fn(),
    onFileClick: fn()
  },
  render: (args) => html`
    <task-item
      .task="${args.task}"
      .draggable="${args.draggable}"
      .onToggleCompletion="${args.onToggleCompletion}"
      .onFileClick="${args.onFileClick}"
    ></task-item>
  `
};

export const MultipleTasksExample: Story = {
  render: () => html`
    <div style="max-width: 400px; space-y: 8px;">
      <task-item
        .task="${{ ...baseTask, text: 'Review pull request #123', priority: 'High' }}"
        .onToggleCompletion="${fn()}"
        .onFileClick="${fn()}"
      ></task-item>
      <task-item
        .task="${{ ...baseTask, text: 'Write unit tests', priority: 'Medium', completed: false }}"
        .onToggleCompletion="${fn()}"
        .onFileClick="${fn()}"
      ></task-item>
      <task-item
        .task="${{ ...baseTask, text: 'Update dependencies', priority: 'Low', completed: true }}"
        .onToggleCompletion="${fn()}"
        .onFileClick="${fn()}"
      ></task-item>
    </div>
  `
};