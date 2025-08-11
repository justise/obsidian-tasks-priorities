import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { fn } from '@storybook/test';
import './TaskItem';
import type { TaskItem } from '../types';

// Mock TFile for storybook with realistic paths
const createMockFile = (path: string) => ({
  path,
  name: path.split('/').pop() || 'unknown.md',
  basename: path.split('/').pop()?.replace('.md', '') || 'unknown',
  extension: 'md'
});

const meta: Meta = {
  title: 'Components/TaskItem',
  component: 'task-item',
  parameters: {
    docs: {
      description: {
        component: `
# TaskItem Component

A reusable task item component that displays individual tasks with:
- ✅ Completion checkbox with visual feedback
- 🎯 Priority indicators using emoji system
- 📁 File path with click-to-navigate functionality
- 🖱️ Drag and drop support for priority changes
- 🎨 Hover and focus states for better UX

## Priority System
- 🔺 **Highest** - Critical, urgent tasks
- ⏫ **High** - Important tasks that need attention soon
- 🔼 **Medium** - Standard priority tasks
- (no emoji) **Normal** - Default priority
- 🔽 **Low** - Nice-to-have tasks
- ⏬️ **Lowest** - Tasks that can wait

## Usage
Used within PrioritySection components or standalone for task display.
        `
      }
    },
    layout: 'centered'
  },
  argTypes: {
    task: {
      control: 'object',
      description: 'The task data object containing file, text, priority, etc.',
      table: {
        type: { summary: 'TaskItem' },
        defaultValue: { summary: 'undefined' }
      }
    },
    draggable: {
      control: 'boolean',
      description: 'Whether the task item can be dragged for reordering',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' }
      }
    },
    onToggleCompletion: {
      action: 'completion-toggled',
      description: 'Callback fired when task completion status is toggled',
      table: {
        type: { summary: '(task: TaskItem) => void' }
      }
    },
    onFileClick: {
      action: 'file-clicked',
      description: 'Callback fired when file path is clicked to navigate',
      table: {
        type: { summary: '(task: TaskItem) => void' }
      }
    }
  },
  decorators: [
    (story) => html`
      <div style="max-width: 400px; padding: 20px; background: var(--background-primary, #ffffff);">
        ${story()}
      </div>
    `
  ]
};

export default meta;
type Story = StoryObj;

// Sample task data with realistic content
const sampleTasks = {
  development: {
    file: createMockFile('Projects/MyApp/Development.md') as any,
    line: 12,
    text: 'Implement user authentication system',
    priority: 'High',
    originalText: '- [ ] Implement user authentication system ⏫',
    completed: false,
    date: new Date('2024-02-15')
  },
  bug: {
    file: createMockFile('Issues/Bugs.md') as any,
    line: 5,
    text: 'Fix memory leak in task processing',
    priority: 'Highest',
    originalText: '- [ ] Fix memory leak in task processing 🔺',
    completed: false,
    date: new Date('2024-01-10')
  },
  documentation: {
    file: createMockFile('Docs/README.md') as any,
    line: 23,
    text: 'Update API documentation with new endpoints',
    priority: 'Medium',
    originalText: '- [ ] Update API documentation with new endpoints 🔼',
    completed: false,
    date: new Date('2024-03-01')
  },
  maintenance: {
    file: createMockFile('Maintenance/Technical-Debt.md') as any,
    line: 8,
    text: 'Refactor legacy authentication code',
    priority: 'Low',
    originalText: '- [ ] Refactor legacy authentication code 🔽',
    completed: false,
    date: new Date('2024-04-15')
  },
  completed: {
    file: createMockFile('Projects/MyApp/Done.md') as any,
    line: 15,
    text: 'Set up continuous integration pipeline',
    priority: 'Normal',
    originalText: '- [x] Set up continuous integration pipeline',
    completed: true,
    date: new Date('2024-01-05')
  }
};

export const Default: Story = {
  render: (args) => html`
    <task-item
      .task=${args.task}
      .draggable=${args.draggable}
      .onToggleCompletion=${args.onToggleCompletion}
      .onFileClick=${args.onFileClick}
    ></task-item>
  `,
  args: {
    task: sampleTasks.development,
    draggable: true,
    onToggleCompletion: fn(),
    onFileClick: fn()
  },
  parameters: {
    docs: {
      description: {
        story: 'Default task item showing a typical development task with High priority.'
      }
    }
  }
};

export const HighestPriority: Story = {
  render: (args) => html`
    <task-item
      .task=${args.task}
      .draggable=${args.draggable}
      .onToggleCompletion=${args.onToggleCompletion}
      .onFileClick=${args.onFileClick}
    ></task-item>
  `,
  args: {
    task: sampleTasks.bug,
    draggable: true,
    onToggleCompletion: fn(),
    onFileClick: fn()
  },
  parameters: {
    docs: {
      description: {
        story: 'Critical priority task marked with 🔺 emoji. These should be addressed immediately.'
      }
    }
  }
};

export const CompletedTask: Story = {
  render: (args) => html`
    <task-item
      .task=${args.task}
      .draggable=${args.draggable}
      .onToggleCompletion=${args.onToggleCompletion}
      .onFileClick=${args.onFileClick}
    ></task-item>
  `,
  args: {
    task: sampleTasks.completed,
    draggable: false,
    onToggleCompletion: fn(),
    onFileClick: fn()
  },
  parameters: {
    docs: {
      description: {
        story: 'Completed task showing the checked state with reduced opacity and check mark.'
      }
    }
  }
};

export const LowPriorityTask: Story = {
  render: (args) => html`
    <task-item
      .task=${args.task}
      .draggable=${args.draggable}
      .onToggleCompletion=${args.onToggleCompletion}
      .onFileClick=${args.onFileClick}
    ></task-item>
  `,
  args: {
    task: sampleTasks.maintenance,
    draggable: true,
    onToggleCompletion: fn(),
    onFileClick: fn()
  },
  parameters: {
    docs: {
      description: {
        story: 'Low priority task marked with 🔽 emoji. These can be addressed when time permits.'
      }
    }
  }
};

export const LongTaskText: Story = {
  render: (args) => html`
    <task-item
      .task=${args.task}
      .draggable=${args.draggable}
      .onToggleCompletion=${args.onToggleCompletion}
      .onFileClick=${args.onFileClick}
    ></task-item>
  `,
  args: {
    task: {
      ...sampleTasks.development,
      text: 'Implement comprehensive user authentication system with OAuth2, multi-factor authentication, password policies, session management, and audit logging for enterprise security compliance',
      originalText: '- [ ] Implement comprehensive user authentication system with OAuth2, multi-factor authentication, password policies, session management, and audit logging for enterprise security compliance ⏫'
    },
    draggable: true,
    onToggleCompletion: fn(),
    onFileClick: fn()
  },
  parameters: {
    docs: {
      description: {
        story: 'Task with long text content showing how text wraps and maintains readability.'
      }
    }
  }
};

export const AllPriorityLevels: Story = {
  render: () => {
    const normalTask = {...sampleTasks.development, priority: 'Normal', text: 'Write unit tests for new features', originalText: '- [ ] Write unit tests for new features'};
    const lowestTask = {...sampleTasks.maintenance, priority: 'Lowest', text: 'Clean up old log files', originalText: '- [ ] Clean up old log files ⏬️'};
    
    return html`
      <div style="display: flex; flex-direction: column; gap: 12px; max-width: 500px;">
        <h3 style="margin: 0; color: var(--text-normal, #333);">All Priority Levels</h3>
        
        <task-item
          .task=${sampleTasks.bug}
          .onToggleCompletion=${fn()}
          .onFileClick=${fn()}
        ></task-item>
        
        <task-item
          .task=${sampleTasks.development}
          .onToggleCompletion=${fn()}
          .onFileClick=${fn()}
        ></task-item>
        
        <task-item
          .task=${sampleTasks.documentation}
          .onToggleCompletion=${fn()}
          .onFileClick=${fn()}
        ></task-item>
        
        <task-item
          .task=${normalTask}
          .onToggleCompletion=${fn()}
          .onFileClick=${fn()}
        ></task-item>
        
        <task-item
          .task=${sampleTasks.maintenance}
          .onToggleCompletion=${fn()}
          .onFileClick=${fn()}
        ></task-item>
        
        <task-item
          .task=${lowestTask}
          .onToggleCompletion=${fn()}
          .onFileClick=${fn()}
        ></task-item>
      </div>
    `;
  },
  parameters: {
    docs: {
      description: {
        story: 'Showcase of all priority levels from Highest (🔺) to Lowest (⏬️) demonstrating the visual hierarchy.'
      }
    }
  }
};

export const InteractivePlayground: Story = {
  render: (args) => html`
    <task-item
      .task=${args.task}
      .draggable=${args.draggable}
      .onToggleCompletion=${args.onToggleCompletion}
      .onFileClick=${args.onFileClick}
    ></task-item>
  `,
  args: {
    task: sampleTasks.development,
    draggable: true,
    onToggleCompletion: fn(),
    onFileClick: fn()
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive playground - use the controls below to modify the task properties and see live changes.'
      }
    }
  }
};