import type { Preview } from '@storybook/web-components';
import '../claude/styles.css';

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
      sort: 'requiredFirst',
    },
    docs: {
      description: {
        component: 'Interactive components for the Obsidian Task Priority Plugin - a Kanban-style task management system.',
      },
      source: {
        state: 'open',
      },
      canvas: {
        sourceState: 'shown',
      },
    },
    backgrounds: {
      default: 'obsidian-dark',
      values: [
        {
          name: 'obsidian-light',
          value: '#ffffff',
        },
        {
          name: 'obsidian-dark',
          value: '#202020',
        },
        {
          name: 'neutral',
          value: '#f8f9fa',
        },
      ],
    },
    viewport: {
      viewports: {
        mobile: {
          name: 'Mobile',
          styles: {
            width: '375px',
            height: '667px',
          },
        },
        tablet: {
          name: 'Tablet',
          styles: {
            width: '768px',
            height: '1024px',
          },
        },
        desktop: {
          name: 'Desktop',
          styles: {
            width: '1200px',
            height: '800px',
          },
        },
        wide: {
          name: 'Wide Screen',
          styles: {
            width: '1600px',
            height: '900px',
          },
        },
      },
    },
    options: {
      storySort: {
        order: [
          'Workflows',
          ['Task Priority System'],
          'Components',
          ['TaskItem', 'PrioritySection'],
        ],
      },
    },
  },
  globalTypes: {
    theme: {
      description: 'Obsidian theme',
      defaultValue: 'dark',
      toolbar: {
        title: 'Theme',
        icon: 'paintbrush',
        items: [
          { value: 'light', title: 'Light Theme', icon: 'sun' },
          { value: 'dark', title: 'Dark Theme', icon: 'moon' },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (story, context) => {
      const theme = context.globals.theme || 'dark';
      return `
        <div class="obsidian-theme-${theme}" style="min-height: 100vh; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;">
          ${story()}
        </div>
      `;
    },
  ],
};

export default preview;