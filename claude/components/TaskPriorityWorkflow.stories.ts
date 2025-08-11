import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { fn } from '@storybook/test';
import './TaskItem';
import './PrioritySection';
import type { TaskItem } from '../types';

// Mock TFile factory for realistic file paths
const createMockFile = (path: string) => ({
  path,
  name: path.split('/').pop() || 'unknown.md',
  basename: path.split('/').pop()?.replace('.md', '') || 'unknown',
  extension: 'md'
});

const meta: Meta = {
  title: 'Workflows/Task Priority System',
  parameters: {
    docs: {
      description: {
        component: `
# Task Priority System Workflow

This demonstrates the complete task priority management workflow used in the Obsidian Task Prioritizer plugin.

## Complete User Journey

### 1. Task Organization
Tasks are automatically organized into priority sections based on their emoji indicators:
- 🔺 **Highest** - Critical bugs, security issues, production failures
- ⏫ **High** - Important features, urgent requirements, time-sensitive tasks  
- 🔼 **Medium** - Standard development work, documentation, planned features
- **Normal** - Default priority, general tasks without specific urgency
- 🔽 **Low** - Nice-to-have features, technical debt, minor improvements
- ⏬️ **Lowest** - Cleanup tasks, optional optimizations, future considerations

### 2. Drag & Drop Priority Management
- **Individual Tasks**: Drag any task between sections to change its priority
- **Bulk Operations**: Drag priority section headers to move all tasks
- **Visual Feedback**: Drop zones highlight during drag operations
- **Automatic Updates**: File content updates automatically with new priority emojis

### 3. Task Interaction
- **Completion Toggle**: Click checkboxes to mark tasks complete/incomplete
- **File Navigation**: Click file paths to jump to task location in Obsidian
- **Real-time Updates**: Changes reflect immediately in the source markdown files

### 4. Visual Hierarchy
Each priority level has distinct visual styling to create clear hierarchy and improve task scanning efficiency.

## Integration with Obsidian
This system integrates seamlessly with:
- **Dataview Plugin**: Queries tasks across your entire vault
- **Tasks Plugin**: Enhanced task management features (optional)
- **Markdown Files**: Direct manipulation of task text in original files
- **File Navigation**: Jump directly to task locations for context

## Benefits
- **Visual Organization**: Clear priority hierarchy at a glance
- **Flexible Management**: Easy priority changes via drag & drop
- **Non-intrusive**: Works with standard markdown task syntax
- **Real-time Sync**: Changes persist immediately to files
- **Vault-wide Scope**: Aggregates tasks from anywhere in your vault
        `
      }
    },
    layout: 'fullscreen'
  }
};

export default meta;
type Story = StoryObj;

// Comprehensive task dataset representing a real project
const projectTasks = {
  critical: [
    {
      file: createMockFile('Security/Security-Audit.md') as any,
      line: 5,
      text: 'Fix authentication bypass vulnerability (CVE-2024-001)',
      priority: 'Highest',
      originalText: '- [ ] Fix authentication bypass vulnerability (CVE-2024-001) 🔺',
      completed: false,
      date: new Date('2024-01-08')
    },
    {
      file: createMockFile('Infrastructure/Production-Issues.md') as any,
      line: 12,
      text: 'Resolve database connection pooling causing 500 errors',
      priority: 'Highest',
      originalText: '- [ ] Resolve database connection pooling causing 500 errors 🔺',
      completed: false,
      date: new Date('2024-01-10')
    }
  ],
  important: [
    {
      file: createMockFile('Features/User-Authentication.md') as any,
      line: 8,
      text: 'Implement multi-factor authentication for admin accounts',
      priority: 'High',
      originalText: '- [ ] Implement multi-factor authentication for admin accounts ⏫',
      completed: false,
      date: new Date('2024-02-01')
    },
    {
      file: createMockFile('Features/Payment-System.md') as any,
      line: 15,
      text: 'Add support for Apple Pay and Google Pay',
      priority: 'High',
      originalText: '- [ ] Add support for Apple Pay and Google Pay ⏫',
      completed: false,
      date: new Date('2024-02-15')
    },
    {
      file: createMockFile('Features/API-v2.md') as any,
      line: 23,
      text: 'Migrate legacy API endpoints to GraphQL',
      priority: 'High',
      originalText: '- [x] Migrate legacy API endpoints to GraphQL ⏫',
      completed: true,
      date: new Date('2024-01-20')
    }
  ],
  standard: [
    {
      file: createMockFile('Documentation/API-Docs.md') as any,
      line: 7,
      text: 'Update API documentation with authentication changes',
      priority: 'Medium',
      originalText: '- [ ] Update API documentation with authentication changes 🔼',
      completed: false,
      date: new Date('2024-03-01')
    },
    {
      file: createMockFile('Testing/Integration-Tests.md') as any,
      line: 18,
      text: 'Write integration tests for payment flow',
      priority: 'Medium',
      originalText: '- [ ] Write integration tests for payment flow 🔼',
      completed: false,
      date: new Date('2024-03-10')
    },
    {
      file: createMockFile('Features/Dashboard.md') as any,
      line: 4,
      text: 'Add dark mode support to user dashboard',
      priority: 'Medium',
      originalText: '- [x] Add dark mode support to user dashboard 🔼',
      completed: true,
      date: new Date('2024-02-28')
    }
  ],
  normal: [
    {
      file: createMockFile('General/Backlog.md') as any,
      line: 11,
      text: 'Research competitor analysis for new features',
      priority: 'Normal',
      originalText: '- [ ] Research competitor analysis for new features',
      completed: false,
      date: new Date('2024-04-01')
    },
    {
      file: createMockFile('General/Team-Tasks.md') as any,
      line: 6,
      text: 'Schedule quarterly team retrospective meeting',
      priority: 'Normal',
      originalText: '- [ ] Schedule quarterly team retrospective meeting',
      completed: false,
      date: new Date('2024-03-25')
    }
  ],
  maintenance: [
    {
      file: createMockFile('Maintenance/Technical-Debt.md') as any,
      line: 20,
      text: 'Refactor user service to use modern async patterns',
      priority: 'Low',
      originalText: '- [ ] Refactor user service to use modern async patterns 🔽',
      completed: false,
      date: new Date('2024-05-15')
    },
    {
      file: createMockFile('Maintenance/Dependencies.md') as any,
      line: 3,
      text: 'Update Node.js dependencies to latest LTS versions',
      priority: 'Low',
      originalText: '- [ ] Update Node.js dependencies to latest LTS versions 🔽',
      completed: false,
      date: new Date('2024-05-01')
    }
  ],
  cleanup: [
    {
      file: createMockFile('Cleanup/Code-Quality.md') as any,
      line: 14,
      text: 'Remove deprecated feature flags from codebase',
      priority: 'Lowest',
      originalText: '- [ ] Remove deprecated feature flags from codebase ⏬️',
      completed: false,
      date: new Date('2024-06-01')
    },
    {
      file: createMockFile('Cleanup/Assets.md') as any,
      line: 9,
      text: 'Optimize and compress legacy image assets',
      priority: 'Lowest',
      originalText: '- [ ] Optimize and compress legacy image assets ⏬️',
      completed: false,
      date: new Date('2024-06-15')
    }
  ]
};

export const CompleteWorkflow: Story = {
  render: () => html`
    <div style="background: var(--background-secondary, #f8f9fa); min-height: 100vh; padding: 20px;">
      <div style="max-width: 1600px; margin: 0 auto;">
        <header style="margin-bottom: 30px; text-align: center;">
          <h1 style="color: var(--text-normal, #333); margin: 0 0 10px 0; font-size: 28px;">
            📋 Task Priority Management System
          </h1>
          <p style="color: var(--text-muted, #666); margin: 0; font-size: 16px;">
            Organize and prioritize tasks across your entire Obsidian vault
          </p>
        </header>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 20px;">
          <priority-section
            priority="Highest"
            .tasks=${projectTasks.critical}
            .onTaskDrop=${fn()}
            .onTaskToggle=${fn()}
            .onFileClick=${fn()}
          ></priority-section>
          
          <priority-section
            priority="High"
            .tasks=${projectTasks.important}
            .onTaskDrop=${fn()}
            .onTaskToggle=${fn()}
            .onFileClick=${fn()}
          ></priority-section>
          
          <priority-section
            priority="Medium"
            .tasks=${projectTasks.standard}
            .onTaskDrop=${fn()}
            .onTaskToggle=${fn()}
            .onFileClick=${fn()}
          ></priority-section>
          
          <priority-section
            priority="Normal"
            .tasks=${projectTasks.normal}
            .onTaskDrop=${fn()}
            .onTaskToggle=${fn()}
            .onFileClick=${fn()}
          ></priority-section>
          
          <priority-section
            priority="Low"
            .tasks=${projectTasks.maintenance}
            .onTaskDrop=${fn()}
            .onTaskToggle=${fn()}
            .onFileClick=${fn()}
          ></priority-section>
          
          <priority-section
            priority="Lowest"
            .tasks=${projectTasks.cleanup}
            .onTaskDrop=${fn()}
            .onTaskToggle=${fn()}
            .onFileClick=${fn()}
          ></priority-section>
        </div>

        <footer style="margin-top: 40px; padding: 20px; background: var(--background-primary, #fff); border-radius: 8px; border: 1px solid var(--background-modifier-border, #ddd);">
          <h3 style="color: var(--text-normal, #333); margin: 0 0 15px 0;">💡 How to Use</h3>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;">
            <div>
              <h4 style="color: var(--text-normal, #333); margin: 0 0 8px 0;">🎯 Prioritize Tasks</h4>
              <p style="color: var(--text-muted, #666); margin: 0; font-size: 14px;">
                Drag tasks between priority sections to adjust their importance and urgency levels.
              </p>
            </div>
            <div>
              <h4 style="color: var(--text-normal, #333); margin: 0 0 8px 0;">✅ Track Progress</h4>
              <p style="color: var(--text-muted, #666); margin: 0; font-size: 14px;">
                Click checkboxes to mark tasks complete. Completed tasks fade out automatically.
              </p>
            </div>
            <div>
              <h4 style="color: var(--text-normal, #333); margin: 0 0 8px 0;">📁 Navigate Files</h4>
              <p style="color: var(--text-muted, #666); margin: 0; font-size: 14px;">
                Click file paths to jump directly to the task location in your Obsidian vault.
              </p>
            </div>
            <div>
              <h4 style="color: var(--text-normal, #333); margin: 0 0 8px 0;">🔄 Auto-Sync</h4>
              <p style="color: var(--text-muted, #666); margin: 0; font-size: 14px;">
                Changes are automatically saved to your markdown files with appropriate emoji indicators.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  `,
  parameters: {
    docs: {
      description: {
        story: `
## Complete Task Priority Workflow

This story demonstrates the full task priority management system as it appears in the Obsidian plugin:

### Features Demonstrated:
1. **Six Priority Levels** - From critical (🔺) to lowest (⏬️) priority
2. **Real Project Data** - Tasks spanning security, features, documentation, and maintenance
3. **Visual Hierarchy** - Color-coded sections with clear priority indication
4. **Mixed Task States** - Both completed and pending tasks shown
5. **Diverse File Sources** - Tasks from different vault locations and contexts
6. **Responsive Layout** - Adapts to different screen sizes
7. **Interactive Elements** - All drag/drop and click interactions functional

### Try These Interactions:
- **Drag tasks** between priority sections
- **Click checkboxes** to toggle completion status  
- **Click file paths** to see navigation actions
- **Observe** the visual feedback and animations

This represents exactly how users would interact with the plugin in their Obsidian vault.
        `
      }
    }
  }
};

export const EmptyState: Story = {
  render: () => html`
    <div style="background: var(--background-secondary, #f8f9fa); min-height: 60vh; padding: 40px;">
      <div style="max-width: 1200px; margin: 0 auto;">
        <header style="text-align: center; margin-bottom: 40px;">
          <h1 style="color: var(--text-normal, #333); margin: 0 0 10px 0;">📋 Task Priority System</h1>
          <p style="color: var(--text-muted, #666); margin: 0;">No tasks found. Start by creating tasks in your markdown files!</p>
        </header>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px;">
          ${['Highest', 'High', 'Medium', 'Normal', 'Low', 'Lowest'].map(priority => html`
            <priority-section
              priority="${priority}"
              .tasks=${[]}
              .onTaskDrop=${fn()}
              .onTaskToggle=${fn()}
              .onFileClick=${fn()}
            ></priority-section>
          `)}
        </div>

        <div style="margin-top: 40px; padding: 30px; background: var(--background-primary, #fff); border-radius: 12px; border: 1px solid var(--background-modifier-border, #ddd); text-align: center;">
          <h3 style="color: var(--text-normal, #333); margin: 0 0 15px 0;">🚀 Getting Started</h3>
          <p style="color: var(--text-muted, #666); margin: 0 0 20px 0; max-width: 600px; margin-left: auto; margin-right: auto;">
            Create tasks in your markdown files using standard checkbox syntax. Add priority emojis to organize them:
          </p>
          
          <div style="background: var(--background-secondary, #f8f9fa); padding: 20px; border-radius: 8px; text-align: left; font-family: monospace; font-size: 14px; max-width: 500px; margin: 0 auto;">
            <div style="margin-bottom: 8px;">- [ ] Critical bug fix 🔺</div>
            <div style="margin-bottom: 8px;">- [ ] Important feature ⏫</div>
            <div style="margin-bottom: 8px;">- [ ] Documentation update 🔼</div>
            <div style="margin-bottom: 8px;">- [ ] Regular task</div>
            <div style="margin-bottom: 8px;">- [ ] Nice to have 🔽</div>
            <div>- [ ] Maybe someday ⏬️</div>
          </div>
        </div>
      </div>
    </div>
  `,
  parameters: {
    docs: {
      description: {
        story: 'Empty state showing how the system appears when no tasks are found, with helpful getting started guidance.'
      }
    }
  }
};

export const MobileLayout: Story = {
  render: () => html`
    <div style="max-width: 400px; background: var(--background-secondary, #f8f9fa); margin: 0 auto; min-height: 100vh;">
      <header style="padding: 20px 20px 15px 20px; background: var(--background-primary, #fff); border-bottom: 1px solid var(--background-modifier-border, #ddd);">
        <h2 style="margin: 0; color: var(--text-normal, #333); font-size: 20px; text-align: center;">📋 Task Priorities</h2>
      </header>
      
      <div style="padding: 15px; display: flex; flex-direction: column; gap: 15px;">
        <priority-section
          priority="Highest"
          .tasks=${projectTasks.critical.slice(0, 1)}
          .onTaskDrop=${fn()}
          .onTaskToggle=${fn()}
          .onFileClick=${fn()}
        ></priority-section>
        
        <priority-section
          priority="High"
          .tasks=${projectTasks.important.slice(0, 2)}
          .onTaskDrop=${fn()}
          .onTaskToggle=${fn()}
          .onFileClick=${fn()}
        ></priority-section>
        
        <priority-section
          priority="Medium"
          .tasks=${projectTasks.standard.slice(0, 1)}
          .onTaskDrop=${fn()}
          .onTaskToggle=${fn()}
          .onFileClick=${fn()}
        ></priority-section>
        
        <priority-section
          priority="Low"
          .tasks=${projectTasks.maintenance.slice(0, 1)}
          .onTaskDrop=${fn()}
          .onTaskToggle=${fn()}
          .onFileClick=${fn()}
        ></priority-section>
      </div>
    </div>
  `,
  parameters: {
    docs: {
      description: {
        story: 'Mobile-optimized layout showing how priority sections stack vertically on narrow screens, optimized for touch interaction.'
      }
    }
  }
};