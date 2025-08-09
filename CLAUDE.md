# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an Obsidian plugin called "Task Prioritizer" that provides Kanban-style task prioritization with drag-and-drop functionality. The plugin integrates with the Dataview plugin (required) and optionally with the Tasks plugin to display and manage tasks by priority levels using emoji indicators.

## Architecture

The plugin follows a modular architecture with clear separation of concerns:

### Core Components
- **Main Plugin Class** (`claude/TaskPriorityPlugin.ts`): Core plugin logic extending Obsidian's `Plugin` class
- **Custom View Class** (`claude/TaskPriorityView.ts`): Custom view extending `ItemView` for the task priority interface  
- **Settings Class** (`claude/TaskPrioritySettingTab.ts`): Configuration interface extending `PluginSettingTab`
- **Type Definitions** (`claude/types.ts`): Centralized interfaces, enums, and utility functions

### UI Components (Lit-based)
- **TaskItemComponent** (`claude/components/TaskItem.ts`): Reusable task item web component with drag/drop support
- **PrioritySectionComponent** (`claude/components/PrioritySection.ts`): Priority section container with drop zone functionality
- **Storybook Integration**: Interactive component documentation and testing environment

### Data Integration
- **Dataview API Integration**: Safe access to Dataview plugin for task querying across vault files
- **File Manipulation**: Direct markdown file updates for task priority and completion status

### Core Components

1. **Task Priority System**: Uses emoji-based priority indicators:
   - 🔺 Highest
   - ⏫ High  
   - 🔼 Medium
   - (no emoji) Normal
   - 🔽 Low
   - ⏬️ Lowest

2. **Dataview Integration**: Queries tasks using configurable Dataview queries (default: `TASK WHERE !completed AND !checked`)

3. **File Manipulation**: Updates task priorities by modifying the original markdown files where tasks are defined

## Development Commands

### Build and Development
```bash
# Install dependencies
yarn install

# Development build with watch mode
yarn dev

# Production build
yarn build

# Version management (updates manifest.json and versions.json)
yarn version

# Run Storybook for component development
yarn storybook

# Build static Storybook for deployment
yarn build-storybook
```

### Build System
- **Build Tool**: esbuild with TypeScript compilation
- **Entry Points**: `claude/main.ts` and `claude/styles.css`
- **Output**: Generates `main.js` and `styles.css` in root directory
- **Watch Mode**: Available via `yarn dev` for development
- **Component Development**: Storybook provides isolated component development and testing

## File Structure

### Core Plugin Files
- `claude/main.ts`: Entry point that exports the main plugin class
- `claude/TaskPriorityPlugin.ts`: Main plugin class with lifecycle and data management
- `claude/TaskPriorityView.ts`: Custom Obsidian view for task priority interface
- `claude/TaskPrioritySettingTab.ts`: Plugin settings configuration interface
- `claude/types.ts`: TypeScript interfaces, enums, and utility functions
- `claude/styles.css`: Plugin-specific CSS styles

### UI Components (Lit Web Components)
- `claude/components/TaskItem.ts`: Individual task item component
- `claude/components/PrioritySection.ts`: Priority section container component
- `claude/components/*.stories.ts`: Storybook stories for component documentation

### Configuration & Build
- `manifest.json`: Obsidian plugin manifest
- `package.json`: Node.js dependencies and scripts
- `esbuild.config.mjs`: Build configuration for plugin bundling
- `tsconfig.json`: TypeScript configuration with decorator support
- `.storybook/`: Storybook configuration for component development

### Generated Files
- `main.js`, `styles.css`: Auto-generated plugin bundle (from claude/ folder)
- `yarn.lock`: Dependency lock file

## Key Interfaces and Types

```typescript
interface TaskItem {
    file: TFile;
    line: number; 
    text: string;
    priority: string;
    originalText: string;
    completed: boolean;
    date?: Date;
}

interface TaskPriorityPluginSettings {
    defaultSort: "date" | "file" | "text";
    refreshInterval: number;
    openFullPage: boolean;
    taskQuery: string;
}

enum TaskPriority {
    Lowest = "Lowest",
    Low = "Low", 
    Normal = "Normal",
    Medium = "Medium",
    High = "High",
    Highest = "Highest"
}
```

## Plugin Dependencies

- **Required**: Dataview plugin - used for querying tasks across vault
- **Optional**: Tasks plugin - enables direct task editing from the priority view
- **Obsidian API**: Standard plugin uses ItemView, Plugin, PluginSettingTab classes

## Development Notes

- The plugin creates a custom view type `VIEW_TYPE_TASK_PRIORITY = "task-priority-view"`
- Tasks are manipulated by directly modifying markdown files using `app.vault.process()`
- Drag-and-drop functionality updates task priority by replacing emoji indicators in the original text
- View can be opened in main workspace (full page) or right sidebar based on settings
- CSS uses CSS custom properties for Obsidian theme integration (`var(--background-modifier-border)`, etc.)

## Plugin Registration

The plugin registers:
- Ribbon icon ("list-checks")  
- Command palette command ("Open task priority view")
- Custom view type for the task priority interface
- Settings tab for configuration

## Testing Strategy

Since this is an Obsidian plugin, testing typically involves:
- Manual testing within Obsidian development environment
- Testing with various task formats and priorities
- Verifying Dataview integration with different query configurations
- Testing drag-and-drop functionality across priority groups