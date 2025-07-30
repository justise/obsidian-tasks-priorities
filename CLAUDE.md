# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an Obsidian plugin called "Task Prioritizer" that provides Kanban-style task prioritization with drag-and-drop functionality. The plugin integrates with the Dataview plugin (required) and optionally with the Tasks plugin to display and manage tasks by priority levels using emoji indicators.

## Architecture

The plugin follows Obsidian's standard plugin architecture:

- **Main Plugin Class** (`TaskPriorityPlugin`): Core plugin logic extending Obsidian's `Plugin` class
- **Custom View Class** (`TaskPriorityView`): Custom view extending `ItemView` for the task priority interface  
- **Settings Class** (`TaskPrioritySettingTab`): Configuration interface extending `PluginSettingTab`
- **Task Management**: Uses Dataview API integration to query and manipulate tasks across vault files

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
npm install

# Development build with watch mode
npm run dev

# Production build
npm run build

# Version management (updates manifest.json and versions.json)
npm run version
```

### Build System
- **Build Tool**: esbuild with TypeScript compilation
- **Entry Points**: `claude/main.ts` and `claude/styles.css`
- **Output**: Generates `main.js` and `styles.css` in root directory
- **Watch Mode**: Available via `npm run dev` for development

## File Structure

- `claude/main.ts`: Main plugin source code
- `claude/styles.css`: Plugin-specific CSS styles  
- `manifest.json`: Obsidian plugin manifest
- `esbuild.config.mjs`: Build configuration
- `tsconfig.json`: TypeScript configuration
- Generated files: `main.js`, `styles.css` (auto-generated from claude/ folder)

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