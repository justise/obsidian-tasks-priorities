import {
	Notice,
	Plugin,
	TFile,
	WorkspaceLeaf,
} from "obsidian";

import {
	TaskItem,
	TaskPriorityPluginSettings,
	DataviewTaskItem,
	DEFAULT_SETTINGS,
	VIEW_TYPE_TASK_PRIORITY,
	getTaskPriority,
	setTaskPriorityInLine,
} from "./types";
import { TaskPriorityView } from "./TaskPriorityView";
import { TaskPrioritySettingTab } from "./TaskPrioritySettingTab";

// Main plugin class
export default class TaskPriorityPlugin extends Plugin {
	settings: TaskPriorityPluginSettings;

	async onload() {
		await this.loadSettings();

		// Register the custom view
		this.registerView(
			VIEW_TYPE_TASK_PRIORITY,
			(leaf) => new TaskPriorityView(leaf, this)
		);

		// Add a plugin ribbon icon
		this.addRibbonIcon("list-checks", "Task priority view", () => {
			this.activateView();
		});

		// Add a command to open the view
		this.addCommand({
			id: "open-task-priority-view",
			name: "Open task priority view",
			callback: () => {
				this.activateView();
			},
		});

		// Add settings tab
		this.addSettingTab(new TaskPrioritySettingTab(this.app, this));
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	// Helper to activate the view
	async activateView() {
		const { workspace } = this.app;

		let leaf: WorkspaceLeaf | null = workspace.getLeavesOfType(
			VIEW_TYPE_TASK_PRIORITY
		)[0];

		if (!leaf) {
			// Use the setting to determine where to open the view
			if (this.settings.openFullPage) {
				leaf = workspace.getLeaf(true); // main workspace (center)
			} else {
				leaf = workspace.getRightLeaf(false); // right sidebar
			}
			if (leaf) {
				await leaf.setViewState({
					type: VIEW_TYPE_TASK_PRIORITY,
					active: true,
				});
			}
		}

		if (leaf) {
			workspace.revealLeaf(leaf);
		}
	}

	async findTasksWithPrioritiesUsingDataview(): Promise<TaskItem[]> {
		// Safe access to Dataview plugin API
		const dataviewPlugin = (this.app as any).plugins?.plugins?.dataview;
		const dataviewApi = dataviewPlugin?.api;
		
		if (!dataviewApi) {
			new Notice(
				"The Dataview plugin is required for Task Priorities. Please install and enable the Dataview plugin."
			);
			return [];
		}
		const query = this.settings.taskQuery; // Use setting
		
		try {
			const results = await dataviewApi.query(query);
			if (results.successful) {
				return results.value.values
					.map((item: DataviewTaskItem) => {
						const tfile = this.app.vault.getFileByPath(item.file.path);
						return {
							file: tfile, // This will be a TFile or null
							line: item.line,
							text: item.text,
							priority: getTaskPriority(item.text),
							originalText: item.text,
							completed: item.completed,
							date: item.due ? new Date(item.due) : undefined, // Use the correct property for your tasks
						} as TaskItem;
					})
					.filter((task: TaskItem) => task.file instanceof TFile);
			} else {
				console.warn('Dataview query failed:', results.error);
				new Notice(`Dataview query failed: ${results.error || 'Unknown error'}`);
				return [];
			}
		} catch (error) {
			console.error('Error executing Dataview query:', error);
			new Notice('Error executing task query. Please check your query syntax.');
			return [];
		}
	}

	// Update a task's priority in its file
	async updateTaskPriority(
		task: TaskItem,
		newPriority: string
	): Promise<string> {
		const updated_file = await this.app.vault.process(task.file, (data) => {
			const lines = data.split("\n");
			lines[task.line] = setTaskPriorityInLine(
				lines[task.line],
				newPriority
			);
			return lines.join("\n");
		});

		// const lines = content.split("\n");

		// // Update the line in the file
		// lines[task.line] = setTaskPriorityInLine(lines[task.line], newPriority);
		// await this.app.vault.modify(task.file, lines.join("\n"));

		// Show a notification
		// new Notice(`Updated priority to ${newPriority} in ${task.file.path}`);

		return Promise.resolve(updated_file.split("\n")[task.line]);
	}

	// Update a task's completion status in its file
	async updateTaskCompletion(
		task: TaskItem,
		completed: boolean
	): Promise<void> {
		await this.app.vault.process(task.file, (data) => {
			const lines = data.split("\n");
			const currentLine = lines[task.line];

			// Update the task completion status
			if (completed) {
				// Mark as completed: change [ ] to [x]
				lines[task.line] = currentLine.replace(/- \[ \]/, "- [x]");
			} else {
				// Mark as incomplete: change [x] to [ ]
				lines[task.line] = currentLine.replace(/- \[x\]/, "- [ ]");
			}

			return lines.join("\n");
		});
	}
}