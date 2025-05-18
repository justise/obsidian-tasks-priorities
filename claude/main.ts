import {
	App,
	MarkdownView,
	Notice,
	Plugin,
	PluginSettingTab,
	Setting,
	TFile,
	WorkspaceLeaf,
	ItemView,
} from "obsidian";

// Define the view type for our plugin
const VIEW_TYPE_TASK_PRIORITY = "task-priority-view";

// Interface for task items
interface TaskItem {
	file: TFile;
	line: number;
	text: string;
	priority: string;
	originalText: string;
	completed: boolean;
}

// Define default settings
interface TaskPriorityPluginSettings {
	priorityRegex: string;
	defaultSort: "priority" | "file" | "text";
	refreshInterval: number;
	openFullPage: boolean; // Add this line
}

enum TaskPriority {
	Lowest = "Lowest",
	Low = "Low",
	Normal = "Normal",
	Medium = "Medium",
	High = "High",
	Highest = "Highest",
}

const DEFAULT_SETTINGS: TaskPriorityPluginSettings = {
	priorityRegex: "\\[([A-Z])\\]",
	defaultSort: "priority",
	refreshInterval: 30,
	openFullPage: true,
};

const getTaskPriority = (line: string): TaskPriority => {
	if (line.includes("🔺")) return TaskPriority.Highest;
	if (line.includes("⏫")) return TaskPriority.High;
	if (line.includes("🔼")) return TaskPriority.Medium;
	if (line.includes("🔽")) return TaskPriority.Low;
	if (line.includes("⏬️")) return TaskPriority.Lowest;

	return TaskPriority.Normal;
};

/**
 * Replace any priority emoji in the line with the emoji for the specified priority.
 * @param line The task line.
 * @param priority The priority as a string ("Highest", "High", etc).
 * @returns The line with the priority emoji replaced.
 */
const setTaskPriorityInLine = (line: string, priority: string): string => {
	const priorityEmojiMap: Record<string, string> = {
		Highest: "🔺",
		High: "⏫",
		Medium: "🔼",
		Normal: "",
		Low: "🔽",
		Lowest: "⏬️",
	};

	// Remove any existing priority emoji
	const cleanedLine = line
		.replace(/🔺|⏫|🔼|🔽|⏬️/g, "")
		.replace(/\s+$/, ""); // Remove trailing spaces

	const emoji = priorityEmojiMap[priority] ?? "";

	// Insert the emoji at the end of the line (or adjust as needed)
	return emoji
		? `${cleanedLine} ${emoji}`.replace(/\s{2,}/g, " ").trim()
		: cleanedLine.trim();
};

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
		this.addRibbonIcon("list-checks", "Task Priority View", () => {
			this.activateView();
		});

		// Add a command to open the view
		this.addCommand({
			id: "open-task-priority-view",
			name: "Open Task Priority View",
			callback: () => {
				this.activateView();
			},
		});

		// Add settings tab
		this.addSettingTab(new TaskPrioritySettingTab(this.app, this));

		console.log("Task Priority Plugin loaded");
	}

	onunload() {
		console.log("Task Priority Plugin unloaded");
	}

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
		//@ts-ignore
		const dataviewApi = this.app.plugins.plugins.dataview.api;
		if (!dataviewApi) {
			new Notice("Dataview plugin is not enabled.");
			return [];
		}
		const query = "TASK WHERE !completed AND !checked"; // where not done
		const results = await dataviewApi.query(query);
		if (results.successful) {
			return results.value.values
				.map((item: any) => {
					const tfile = this.app.vault.getAbstractFileByPath(
						item.file.path
					);
					return {
						file: tfile, // This will be a TFile or null
						line: item.line,
						text: item.text,
						priority: getTaskPriority(item.text),
						originalText: item.text,
						completed: item.completed,
					} as TaskItem;
				})
				.filter((task: TaskItem) => task.file instanceof TFile);
		} else {
			return [];
		}
	}

	// Function to find all tasks with priorities in the vault
	// async findTasksWithPriorities(): Promise<TaskItem[]> {
	// 	const files = this.app.vault.getMarkdownFiles();
	// 	const priorityRegex = new RegExp(this.settings.priorityRegex);
	// 	const tasks: TaskItem[] = [];

	// 	for (const file of files) {
	// 		const content = await this.app.vault.read(file);
	// 		const lines = content.split("\n");

	// 		for (let i = 0; i < lines.length; i++) {
	// 			const line = lines[i];
	// 			// Check if line contains a task marker and a priority
	// 			if (line.includes("- [ ]") || line.includes("- [x]")) {
	// 				const priorityMatch = line.match(priorityRegex);
	// 				if (priorityMatch) {
	// 					const completed = line.includes("- [x]");
	// 					tasks.push({
	// 						file: file,
	// 						line: i,
	// 						text: line
	// 							.replace(/^[\s-]*\[[x ]\]\s*/, "")
	// 							.replace(priorityRegex, "")
	// 							.trim(),
	// 						priority: priorityMatch[1],
	// 						originalText: line,
	// 						completed,
	// 					});
	// 				} else {
	// 					const completed = line.includes("- [x]");
	// 					tasks.push({
	// 						file: file,
	// 						line: i,
	// 						text: line.replace(/^[\s-]*\[[x ]\]\s*/, "").trim(),
	// 						priority: "Normal",
	// 						originalText: line,
	// 						completed,
	// 					});
	// 				}
	// 			}
	// 		}
	// 	}

	// 	return tasks;
	// }

	// Update a task's priority in its file
	async updateTaskPriority(
		task: TaskItem,
		newPriority: string
	): Promise<string> {
		const content = await this.app.vault.read(task.file);
		const lines = content.split("\n");

		// Update the line in the file
		lines[task.line] = setTaskPriorityInLine(lines[task.line], newPriority);
		await this.app.vault.modify(task.file, lines.join("\n"));

		// Show a notification
		new Notice(`Updated priority to ${newPriority} in ${task.file.path}`);

		return Promise.resolve(lines[task.line]);
	}
}

// View class for displaying tasks by priority
class TaskPriorityView extends ItemView {
	plugin: TaskPriorityPlugin;
	tasks: TaskItem[] = [];
	draggedItem: HTMLElement | null = null;
	refreshInterval: number | null = null;

	constructor(leaf: WorkspaceLeaf, plugin: TaskPriorityPlugin) {
		super(leaf);
		this.plugin = plugin;
	}

	getViewType(): string {
		return VIEW_TYPE_TASK_PRIORITY;
	}

	getDisplayText(): string {
		return "Task Priorities";
	}

	async onOpen(): Promise<void> {
		await this.refreshTasks();

		// Set up interval to refresh tasks
		// Temp while debugging styling
		// this.refreshInterval = window.setInterval(() => {
		// 	this.refreshTasks();
		// }, this.plugin.settings.refreshInterval * 1000);
	}

	async onClose() {
		if (this.refreshInterval) {
			clearInterval(this.refreshInterval);
		}
	}

	// Get icon for the view
	getIcon(): string {
		return "list-checks";
	}

	// Method to refresh task data
	async refreshTasks(): Promise<void> {
		//this.tasks = await this.plugin.findTasksWithPriorities();
		this.tasks = await this.plugin.findTasksWithPrioritiesUsingDataview();
		console.log("refresh tasks:", this.tasks);
		// Sort tasks by priority
		this.tasks.sort((a, b) => a.priority.localeCompare(b.priority));
		this.renderView();
	}

	// Render the view
	async renderView(): Promise<void> {
		const container = this.containerEl.children[1];
		container.empty();
		container.addClass("task-priority-container");

		// Dot matrix background
		container.addClass("task-priority-dot-matrix-bg");

		// Create header
		const header = container.createEl("div", {
			cls: "task-priority-header",
		});
		header.createEl("h2", { text: "Tasks by Priority" });

		// Create refresh button
		const refreshBtn = header.createEl("button", {
			cls: "task-priority-refresh-btn",
			text: "Refresh",
		});
		refreshBtn.addEventListener("click", () => this.refreshTasks());

		// Create sorting options
		const sortingDiv = container.createEl("div", {
			cls: "task-priority-sorting",
		});
		sortingDiv.createEl("span", { text: "Sort by: " });

		const sortOptions = ["priority", "file", "text"];
		const sortSelect = sortingDiv.createEl("select");

		sortOptions.forEach((option) => {
			const optEl = sortSelect.createEl("option", {
				text: option.charAt(0).toUpperCase() + option.slice(1),
				value: option,
			});
			if (option === this.plugin.settings.defaultSort) {
				optEl.selected = true;
			}
		});

		sortSelect.addEventListener("change", (e) => {
			const target = e.target as HTMLSelectElement;
			this.sortTasks(target.value as "priority" | "file" | "text");
		});

		// Create task list
		const taskList = container.createEl("div", {
			cls: "task-priority-list",
		});

		// Group tasks by priority
		const tasksByPriority: Record<string, TaskItem[]> = {
			Lowest: [],
			Low: [],
			Normal: [],
			Medium: [],
			High: [],
			Highest: [],
		};

		this.tasks.forEach((task) => {
			if (!tasksByPriority[task.priority]) {
				tasksByPriority[task.priority] = [];
			}
			tasksByPriority[task.priority].push(task);
		});

		// Render "Highest" section at the top
		const highestSection = taskList.createEl("div", {
			cls: "task-priority-section task-priority-section-highest",
			attr: { "data-priority": "Highest" },
		});
		const highestHeader = highestSection.createEl("div", {
			cls: "task-priority-section-header",
			text: `Priority Highest (${tasksByPriority["Highest"].length})`,
		});
		highestHeader.setAttribute("draggable", "true");
		highestHeader.addEventListener("dragstart", (e) => {
			e.dataTransfer?.setData("text/plain", "Highest");
			this.draggedItem = highestHeader;
		});
		const highestTasksContainer = highestSection.createEl("div", {
			cls: "task-priority-items",
		});
		tasksByPriority["Highest"].forEach((task) => {
			const taskEl = this.createTaskElement(task, highestTasksContainer);
			highestTasksContainer.appendChild(taskEl);
		});

		// Render other priorities in horizontal columns
		const columnWrapper = taskList.createEl("div", {
			cls: "task-priority-columns",
		});
		const columnOrder = ["High", "Medium", "Normal", "Low", "Lowest"];
		columnOrder.forEach((priority) => {
			const section = columnWrapper.createEl("div", {
				cls: `task-priority-section task-priority-section-${priority.toLowerCase()}`,
				attr: { "data-priority": priority },
			});
			const header = section.createEl("div", {
				cls: "task-priority-section-header",
				text: `Priority ${priority} (${tasksByPriority[priority].length})`,
			});
			header.setAttribute("draggable", "true");
			header.addEventListener("dragstart", (e) => {
				e.dataTransfer?.setData("text/plain", priority);
				this.draggedItem = header;
			});
			const tasksContainer = section.createEl("div", {
				cls: "task-priority-items",
			});
			tasksByPriority[priority].forEach((task) => {
				const taskEl = this.createTaskElement(task, tasksContainer);
				tasksContainer.appendChild(taskEl);
			});
		});

		// Set up drop zones for all sections
		this.setupDropZones(taskList);
	}

	// Create a task element
	createTaskElement(task: TaskItem, container: HTMLElement): HTMLElement {
		const taskEl = document.createElement("div");
		taskEl.addClass("task-priority-item");
		taskEl.setAttribute("draggable", "true");

		if (task.completed) {
			taskEl.addClass("task-completed");
		}

		// Create task content
		const taskContent = taskEl.createEl("div", { cls: "task-content" });

		// Title with file info
		const titleEl = taskContent.createEl("div", { cls: "task-title" });
		titleEl.setText(task.text);

		// File info
		const fileInfo = taskContent.createEl("div", { cls: "task-file-info" });
		fileInfo.setText(task.file.path);
		fileInfo.addEventListener("click", () => {
			// Open the file at the specific line
			this.app.workspace
				.getLeaf()
				.openFile(task.file)
				.then(() => {
					const view =
						this.app.workspace.getActiveViewOfType(MarkdownView);
					if (view) {
						const editor = view.editor;
						editor.setCursor({ line: task.line, ch: 0 });
						editor.focus();
					}
				});
		});

		// Priority badge
		// const priorityBadge = taskEl.createEl("div", {
		// 	cls: "task-priority-badge",
		// 	text: task.priority,
		// });

		// Set up drag events
		taskEl.addEventListener("dragstart", (e) => {
			e.dataTransfer?.setData(
				"application/json",
				JSON.stringify({
					taskIndex: this.tasks.indexOf(task),
					priority: task.priority,
					file: task.file.path,
					line: task.line,
				})
			);
			this.draggedItem = taskEl;
		});

		return taskEl;
	}

	// Set up drop zones for drag and drop functionality
	setupDropZones(container: HTMLElement): void {
		const prioritySections = container.querySelectorAll(
			".task-priority-section"
		);

		prioritySections.forEach((section) => {
			// Make the section a drop target
			section.addEventListener("dragover", (e) => {
				e.preventDefault();
				if (this.draggedItem) {
					section.addClass("task-priority-drop-target");
				}
			});

			section.addEventListener("dragleave", () => {
				section.removeClass("task-priority-drop-target");
			});

			section.addEventListener("drop", async (e: DragEvent) => {
				e.preventDefault();
				section.removeClass("task-priority-drop-target");

				const targetPriority = section.getAttribute("data-priority");

				if (!targetPriority || !this.draggedItem) return;

				// Check if dragging a priority header (bulk move) or single task
				if (this.draggedItem.hasClass("task-priority-section-header")) {
					const sourcePriority =
						e.dataTransfer?.getData("text/plain");
					if (sourcePriority && sourcePriority !== targetPriority) {
						// Update all tasks with this priority
						const tasksToUpdate = this.tasks.filter(
							(t) => t.priority === sourcePriority
						);

						for (const task of tasksToUpdate) {
							await this.plugin.updateTaskPriority(
								task,
								targetPriority
							);
						}
					}
				} else {
					// Single task move
					const data = e.dataTransfer?.getData("application/json");
					if (data) {
						const taskData = JSON.parse(data);
						const task = this.tasks[taskData.taskIndex];

						if (task && task.priority !== targetPriority) {
							const updatedTaskText =
								await this.plugin.updateTaskPriority(
									task,
									targetPriority
								);
							const newTask = {
								...task,
								priority: targetPriority,
								text: updatedTaskText.replace(
									/\s*[-]\s*\[([x ])\]\s*/,
									""
								),
							};
							this.tasks[taskData.taskIndex] = newTask;

							// Update the task's priority in the tasks array
							// Update the task element in the UI
							await this.renderView();
						}
					}
				}

				this.draggedItem = null;
			});
		});
	}

	// Sort tasks by the specified criteria
	sortTasks(sortBy: "priority" | "file" | "text"): void {
		switch (sortBy) {
			case "priority":
				this.tasks.sort((a, b) => a.priority.localeCompare(b.priority));
				break;
			case "file":
				this.tasks.sort((a, b) =>
					a.file.path.localeCompare(b.file.path)
				);
				break;
			case "text":
				this.tasks.sort((a, b) => a.text.localeCompare(b.text));
				break;
		}

		this.renderView();
	}
}

// Settings tab
class TaskPrioritySettingTab extends PluginSettingTab {
	plugin: TaskPriorityPlugin;

	constructor(app: App, plugin: TaskPriorityPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		containerEl.createEl("h2", { text: "Task Priority Plugin Settings" });

		new Setting(containerEl)
			.setName("Priority Regular Expression")
			.setDesc(
				"Regular expression to match priorities. Default matches [A], [B], etc."
			)
			.addText((text) =>
				text
					.setPlaceholder("\\[([A-Z])\\]")
					.setValue(this.plugin.settings.priorityRegex)
					.onChange(async (value) => {
						this.plugin.settings.priorityRegex = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Default Sort")
			.setDesc("How to sort tasks by default")
			.addDropdown((dropdown) =>
				dropdown
					.addOption("priority", "Priority")
					.addOption("file", "File name")
					.addOption("text", "Task text")
					.setValue(this.plugin.settings.defaultSort)
					.onChange(async (value: "priority" | "file" | "text") => {
						this.plugin.settings.defaultSort = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Refresh Interval")
			.setDesc("How often to refresh tasks automatically (in seconds)")
			.addSlider((slider) =>
				slider
					.setLimits(5, 120, 5)
					.setValue(this.plugin.settings.refreshInterval)
					.setDynamicTooltip()
					.onChange(async (value) => {
						this.plugin.settings.refreshInterval = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Open View Full Size")
			.setDesc(
				"Open the Task Priority view as a full page (center) or in the right sidebar"
			)
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.openFullPage)
					.onChange(async (value) => {
						this.plugin.settings.openFullPage = value;
						await this.plugin.saveSettings();
					})
			);
	}
}
