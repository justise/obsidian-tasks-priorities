import type { Preview } from '@storybook/web-components';
import '../claude/styles.css';

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    docs: {
      description: {
        component: 'Task Priority Plugin components for Obsidian',
      },
    },
  },
};

export default preview;