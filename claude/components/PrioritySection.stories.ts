import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { fn } from '@storybook/test';
import './PrioritySection';
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
  title: 'Components/PrioritySection',
  component: 'priority-section',
  parameters: {
    docs: {
      description: {
        component: 'A priority section component that groups tasks by priority level with drag and drop functionality.'
      }
    }
  },
  argTypes: {
    priority: {
      control: 'select',
      options: ['Highest', 'High', 'Medium', 'Normal', 'Low', 'Lowest'],
      description: 'The priority level for this section'
    },
    tasks: {
      control: 'object',
      description: 'Array of tasks in this priority section'
    },
    allowDrop: {
      control: 'boolean',
      description: 'Whether this section accepts dropped tasks'
    },
    onTaskDrop: {
      description: 'Callback when a task is dropped on this section'
    },
    onTaskToggle: {
      description: 'Callback when a task completion is toggled'
    },
    onFileClick: {
      description: 'Callback when a task file is clicked'
    }
  }
};

export default meta;
type Story = StoryObj;

const sampleTasks: TaskItem[] = [
  {
    file: mockFile as any,
    line: 1,
    text: 'Fix critical bug in authentication',
    priority: 'Highest',
    originalText: '- [ ] Fix critical bug in authentication 🔺',
    completed: false,
    date: new Date('2024-01-15')
  },
  {
    file: mockFile as any,
    line: 2,
    text: 'Review security audit findings',
    priority: 'Highest',
    originalText: '- [ ] Review security audit findings 🔺',
    completed: false,
    date: new Date('2024-01-16')
  }
];

const mediumTasks: TaskItem[] = [
  {
    file: mockFile as any,
    line: 3,
    text: 'Implement new feature request',
    priority: 'Medium',
    originalText: '- [ ] Implement new feature request 🔼',
    completed: false,
    date: new Date('2024-01-20')
  },
  {
    file: mockFile as any,
    line: 4,
    text: 'Update API documentation',
    priority: 'Medium',
    originalText: '- [x] Update API documentation 🔼',
    completed: true,
    date: new Date('2024-01-18')
  }
];

export const HighestPriority: Story = {
  args: {
    priority: 'Highest',
    tasks: sampleTasks,
    allowDrop: true,
    onTaskDrop: fn(),
    onTaskToggle: fn(),
    onFileClick: fn()
  },
  render: (args) => html`
    <div style="width: 300px;">
      <priority-section
        .priority="${args.priority}"
        .tasks="${args.tasks}"
        .allowDrop="${args.allowDrop}"
        .onTaskDrop="${args.onTaskDrop}"
        .onTaskToggle="${args.onTaskToggle}"
        .onFileClick="${args.onFileClick}"
      ></priority-section>
    </div>
  `
};

export const MediumPriority: Story = {
  args: {
    priority: 'Medium',
    tasks: mediumTasks,
    allowDrop: true,
    onTaskDrop: fn(),
    onTaskToggle: fn(),
    onFileClick: fn()
  },
  render: (args) => html`
    <div style="width: 300px;">
      <priority-section
        .priority="${args.priority}"
        .tasks="${args.tasks}"
        .allowDrop="${args.allowDrop}"
        .onTaskDrop="${args.onTaskDrop}"
        .onTaskToggle="${args.onTaskToggle}"
        .onFileClick="${args.onFileClick}"
      ></priority-section>
    </div>
  `
};

export const EmptySection: Story = {
  args: {
    priority: 'Low',
    tasks: [],
    allowDrop: true,
    onTaskDrop: fn(),
    onTaskToggle: fn(),
    onFileClick: fn()
  },
  render: (args) => html`
    <div style="width: 300px;">
      <priority-section
        .priority="${args.priority}"
        .tasks="${args.tasks}"
        .allowDrop="${args.allowDrop}"
        .onTaskDrop="${args.onTaskDrop}"
        .onTaskToggle="${args.onTaskToggle}"
        .onFileClick="${args.onFileClick}"
      ></priority-section>
    </div>
  `
};

export const MultipleColumns: Story = {
  render: () => html`
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; max-width: 1000px;">
      <priority-section
        priority="Highest"
        .tasks="${sampleTasks}"
        .onTaskDrop="${fn()}"
        .onTaskToggle="${fn()}"
        .onFileClick="${fn()}"
      ></priority-section>
      
      <priority-section
        priority="Medium" 
        .tasks="${mediumTasks}"
        .onTaskDrop="${fn()}"
        .onTaskToggle="${fn()}"
        .onFileClick="${fn()}"
      ></priority-section>
      
      <priority-section
        priority="Low"
        .tasks="${[]}"
        .onTaskDrop="${fn()}"
        .onTaskToggle="${fn()}"
        .onFileClick="${fn()}"
      ></priority-section>
    </div>
  `
};

export const DisabledDrop: Story = {
  args: {
    priority: 'Normal',
    tasks: mediumTasks.slice(0, 1),
    allowDrop: false,
    onTaskDrop: fn(),
    onTaskToggle: fn(),
    onFileClick: fn()
  },
  render: (args) => html`
    <div style="width: 300px;">
      <priority-section
        .priority="${args.priority}"
        .tasks="${args.tasks}"
        .allowDrop="${args.allowDrop}"
        .onTaskDrop="${args.onTaskDrop}"
        .onTaskToggle="${args.onTaskToggle}"
        .onFileClick="${args.onFileClick}"
      ></priority-section>
    </div>
  `,
  parameters: {
    docs: {
      description: {
        story: 'Priority section with drag and drop disabled.'
      }
    }
  }
};