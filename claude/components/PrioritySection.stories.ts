import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { fn } from '@storybook/test';
import './PrioritySection';
import './TaskItem';
import type { TaskItem } from '../types';

// Mock TFile factory for realistic file paths
const createMockFile = (path: string) => ({
  path,
  name: path.split('/').pop() || 'unknown.md',
  basename: path.split('/').pop()?.replace('.md', '') || 'unknown',
  extension: 'md'
});

const meta: Meta = {
  title: 'Components/PrioritySection',
  component: 'priority-section',
  parameters: {
    docs: {
      description: {
        component: `
# Priority Section Component

A container component that groups tasks by priority level with comprehensive functionality:

## Key Features
- 📋 **Task Grouping** - Organizes tasks by priority level
- 🎯 **Priority Headers** - Color-coded headers with task counts
- 🖱️ **Drag & Drop** - Accept tasks dropped from other sections
- 📊 **Visual Hierarchy** - Different styling per priority level
- 🔄 **Bulk Operations** - Drag entire priority sections
- 📱 **Responsive Design** - Adapts to different screen sizes

## Priority Color Coding
- **🔺 Highest** - Red background (urgent, critical)
- **⏫ High** - Orange background (important, soon)
- **🔼 Medium** - Blue background (standard priority)
- **Normal** - Default background (no special urgency)
- **🔽 Low** - Green background (nice to have)
- **⏬️ Lowest** - Gray background (when time permits)

## Drag & Drop Behavior
- Tasks can be dragged between sections to change priority
- Empty sections show drop hints
- Visual feedback during drag operations
- Prevents invalid drops when disabled

## Usage
Typically used in Kanban-style boards where tasks are organized by priority levels.
        `
      }
    },
    layout: 'centered'
  },
  argTypes: {
    priority: {
      control: 'select',
      options: ['Highest', 'High', 'Medium', 'Normal', 'Low', 'Lowest'],
      description: 'The priority level for this section',
      table: {
        type: { summary: '"Highest" | "High" | "Medium" | "Normal" | "Low" | "Lowest"' },
        defaultValue: { summary: '"Normal"' }
      }
    },
    tasks: {
      control: 'object',
      description: 'Array of tasks belonging to this priority level',
      table: {
        type: { summary: 'TaskItem[]' },
        defaultValue: { summary: '[]' }
      }
    },
    allowDrop: {
      control: 'boolean',
      description: 'Whether this section accepts dropped tasks for priority changes',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' }
      }
    },
    onTaskDrop: {
      action: 'task-dropped',
      description: 'Callback fired when a task is dropped on this section',
      table: {
        type: { summary: '(priority: string, taskData: any) => void' }
      }
    },
    onTaskToggle: {
      action: 'task-toggled',
      description: 'Callback fired when a task completion status is toggled',
      table: {
        type: { summary: '(task: TaskItem) => void' }
      }
    },
    onFileClick: {
      action: 'file-clicked',
      description: 'Callback fired when a task file path is clicked',
      table: {
        type: { summary: '(task: TaskItem) => void' }
      }
    }
  },
  decorators: [
    (story) => html`
      <div style="min-height: 400px; padding: 20px; background: var(--background-secondary, #f8f9fa);">
        ${story()}
      </div>
    `
  ]
};

export default meta;
type Story = StoryObj;

// Realistic task data for different scenarios
const taskDataSets = {
  critical: [
    {
      file: createMockFile('Security/Critical-Issues.md') as any,
      line: 3,
      text: 'Patch SQL injection vulnerability in user login',
      priority: 'Highest',
      originalText: '- [ ] Patch SQL injection vulnerability in user login 🔺',
      completed: false,
      date: new Date('2024-01-10')
    },
    {
      file: createMockFile('Infrastructure/Production.md') as any,
      line: 8,
      text: 'Fix memory leak causing server crashes',
      priority: 'Highest',
      originalText: '- [ ] Fix memory leak causing server crashes 🔺',
      completed: false,
      date: new Date('2024-01-08')
    }
  ],
  development: [
    {
      file: createMockFile('Features/User-Management.md') as any,
      line: 12,
      text: 'Implement OAuth2 authentication flow',
      priority: 'High',
      originalText: '- [ ] Implement OAuth2 authentication flow ⏫',
      completed: false,
      date: new Date('2024-02-15')
    },
    {
      file: createMockFile('Features/Dashboard.md') as any,
      line: 5,
      text: 'Add real-time notifications system',
      priority: 'High',
      originalText: '- [ ] Add real-time notifications system ⏫',
      completed: false,
      date: new Date('2024-02-20')
    },
    {
      file: createMockFile('Features/API.md') as any,
      line: 15,
      text: 'Create GraphQL endpoint for user queries',
      priority: 'High',
      originalText: '- [x] Create GraphQL endpoint for user queries ⏫',
      completed: true,
      date: new Date('2024-01-25')
    }
  ],
  documentation: [
    {
      file: createMockFile('Docs/API-Reference.md') as any,
      line: 23,
      text: 'Update API documentation with new endpoints',
      priority: 'Medium',
      originalText: '- [ ] Update API documentation with new endpoints 🔼',
      completed: false,
      date: new Date('2024-03-01')
    },
    {
      file: createMockFile('Docs/User-Guide.md') as any,
      line: 7,
      text: 'Write tutorial for new authentication flow',
      priority: 'Medium',
      originalText: '- [ ] Write tutorial for new authentication flow 🔼',
      completed: false,
      date: new Date('2024-03-05')
    }
  ],
  maintenance: [
    {
      file: createMockFile('Maintenance/Code-Quality.md') as any,
      line: 18,
      text: 'Refactor legacy payment processing code',
      priority: 'Low',
      originalText: '- [ ] Refactor legacy payment processing code 🔽',
      completed: false,
      date: new Date('2024-04-15')
    },
    {
      file: createMockFile('Maintenance/Dependencies.md') as any,
      line: 4,
      text: 'Update all npm packages to latest versions',
      priority: 'Low',
      originalText: '- [ ] Update all npm packages to latest versions 🔽',
      completed: false,
      date: new Date('2024-04-20')
    }
  ],
  cleanup: [
    {
      file: createMockFile('Maintenance/Cleanup.md') as any,
      line: 9,
      text: 'Remove unused CSS classes and old components',
      priority: 'Lowest',
      originalText: '- [ ] Remove unused CSS classes and old components ⏬️',
      completed: false,
      date: new Date('2024-05-01')
    }
  ]
};

export const CriticalTasks: Story = {
  render: (args) => html`
    <priority-section
      .priority=${args.priority}
      .tasks=${args.tasks}
      .allowDrop=${args.allowDrop}
      .onTaskDrop=${args.onTaskDrop}
      .onTaskToggle=${args.onTaskToggle}
      .onFileClick=${args.onFileClick}
    ></priority-section>
  `,
  args: {
    priority: 'Highest',
    tasks: taskDataSets.critical,
    allowDrop: true,
    onTaskDrop: fn(),
    onTaskToggle: fn(),
    onFileClick: fn()
  },
  parameters: {
    docs: {
      description: {
        story: 'Critical priority section with urgent security and infrastructure tasks. Notice the red header indicating high urgency.'
      }
    }
  }
};

export const DevelopmentTasks: Story = {
  render: (args) => html`
    <priority-section
      .priority=${args.priority}
      .tasks=${args.tasks}
      .allowDrop=${args.allowDrop}
      .onTaskDrop=${args.onTaskDrop}
      .onTaskToggle=${args.onTaskToggle}
      .onFileClick=${args.onFileClick}
    ></priority-section>
  `,
  args: {
    priority: 'High',
    tasks: taskDataSets.development,
    allowDrop: true,
    onTaskDrop: fn(),
    onTaskToggle: fn(),
    onFileClick: fn()
  },
  parameters: {
    docs: {
      description: {
        story: 'High priority development tasks including both completed and pending items. Shows mixed task states.'
      }
    }
  }
};

export const DocumentationTasks: Story = {
  render: (args) => html`
    <priority-section
      .priority=${args.priority}
      .tasks=${args.tasks}
      .allowDrop=${args.allowDrop}
      .onTaskDrop=${args.onTaskDrop}
      .onTaskToggle=${args.onTaskToggle}
      .onFileClick=${args.onFileClick}
    ></priority-section>
  `,
  args: {
    priority: 'Medium',
    tasks: taskDataSets.documentation,
    allowDrop: true,
    onTaskDrop: fn(),
    onTaskToggle: fn(),
    onFileClick: fn()
  },
  parameters: {
    docs: {
      description: {
        story: 'Medium priority documentation tasks. Blue header indicates standard priority level.'
      }
    }
  }
};

export const EmptySection: Story = {
  render: (args) => html`
    <priority-section
      .priority=${args.priority}
      .tasks=${args.tasks}
      .allowDrop=${args.allowDrop}
      .onTaskDrop=${args.onTaskDrop}
      .onTaskToggle=${args.onTaskToggle}
      .onFileClick=${args.onFileClick}
    ></priority-section>
  `,
  args: {
    priority: 'Normal',
    tasks: [],
    allowDrop: true,
    onTaskDrop: fn(),
    onTaskToggle: fn(),
    onFileClick: fn()
  },
  parameters: {
    docs: {
      description: {
        story: 'Empty priority section showing the drop hint message. Tasks can be dropped here to change their priority.'
      }
    }
  }
};

export const MaintenanceTasks: Story = {
  render: (args) => html`
    <priority-section
      .priority=${args.priority}
      .tasks=${args.tasks}
      .allowDrop=${args.allowDrop}
      .onTaskDrop=${args.onTaskDrop}
      .onTaskToggle=${args.onTaskToggle}
      .onFileClick=${args.onFileClick}
    ></priority-section>
  `,
  args: {
    priority: 'Low',
    tasks: taskDataSets.maintenance,
    allowDrop: true,
    onTaskDrop: fn(),
    onTaskToggle: fn(),
    onFileClick: fn()
  },
  parameters: {
    docs: {
      description: {
        story: 'Low priority maintenance tasks with green header styling. These can be addressed when time permits.'
      }
    }
  }
};

export const DisabledDropZone: Story = {
  render: (args) => html`
    <priority-section
      .priority=${args.priority}
      .tasks=${args.tasks}
      .allowDrop=${args.allowDrop}
      .onTaskDrop=${args.onTaskDrop}
      .onTaskToggle=${args.onTaskToggle}
      .onFileClick=${args.onFileClick}
    ></priority-section>
  `,
  args: {
    priority: 'Lowest',
    tasks: taskDataSets.cleanup,
    allowDrop: false,
    onTaskDrop: fn(),
    onTaskToggle: fn(),
    onFileClick: fn()
  },
  parameters: {
    docs: {
      description: {
        story: 'Priority section with drop functionality disabled. Tasks cannot be dropped into this section.'
      }
    }
  }
};

export const FullKanbanBoard: Story = {
  render: () => html`
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; max-width: 1400px;">
      <priority-section
        priority="Highest"
        .tasks=${taskDataSets.critical}
        .onTaskDrop=${fn()}
        .onTaskToggle=${fn()}
        .onFileClick=${fn()}
      ></priority-section>
      
      <priority-section
        priority="High"
        .tasks=${taskDataSets.development}
        .onTaskDrop=${fn()}
        .onTaskToggle=${fn()}
        .onFileClick=${fn()}
      ></priority-section>
      
      <priority-section
        priority="Medium"
        .tasks=${taskDataSets.documentation}
        .onTaskDrop=${fn()}
        .onTaskToggle=${fn()}
        .onFileClick=${fn()}
      ></priority-section>
      
      <priority-section
        priority="Normal"
        .tasks=${[]}
        .onTaskDrop=${fn()}
        .onTaskToggle=${fn()}
        .onFileClick=${fn()}
      ></priority-section>
      
      <priority-section
        priority="Low"
        .tasks=${taskDataSets.maintenance}
        .onTaskDrop=${fn()}
        .onTaskToggle=${fn()}
        .onFileClick=${fn()}
      ></priority-section>
      
      <priority-section
        priority="Lowest"
        .tasks=${taskDataSets.cleanup}
        .onTaskDrop=${fn()}
        .onTaskToggle=${fn()}
        .onFileClick=${fn()}
      ></priority-section>
    </div>
  `,
  parameters: {
    docs: {
      description: {
        story: 'Complete Kanban board showing all priority levels with realistic task distribution. Demonstrates the full workflow and visual hierarchy.'
      }
    }
  }
};

export const ResponsiveLayout: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 16px; max-width: 400px;">
      <h3 style="margin: 0; color: var(--text-normal, #333);">Mobile/Narrow Layout</h3>
      <priority-section
        priority="Highest"
        .tasks=${taskDataSets.critical.slice(0, 1)}
        .onTaskDrop=${fn()}
        .onTaskToggle=${fn()}
        .onFileClick=${fn()}
      ></priority-section>
      
      <priority-section
        priority="High"
        .tasks=${taskDataSets.development.slice(0, 2)}
        .onTaskDrop=${fn()}
        .onTaskToggle=${fn()}
        .onFileClick=${fn()}
      ></priority-section>
      
      <priority-section
        priority="Medium"
        .tasks=${taskDataSets.documentation.slice(0, 1)}
        .onTaskDrop=${fn()}
        .onTaskToggle=${fn()}
        .onFileClick=${fn()}
      ></priority-section>
    </div>
  `,
  parameters: {
    docs: {
      description: {
        story: 'Responsive layout showing how priority sections stack vertically on narrow screens.'
      }
    }
  }
};