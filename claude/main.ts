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
	date?: Date;
}

// Define default settings
interface TaskPriorityPluginSettings {
	defaultSort: "date" | "file" | "text";
	refreshInterval: number;
	openFullPage: boolean;
	taskQuery: string; // Add this line
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
	defaultSort: "date",
	refreshInterval: 30,
	openFullPage: true,
	taskQuery: "TASK WHERE !completed AND !checked", // Add this line
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
		//@ts-ignore
		const dataviewApi = this.app.plugins.plugins.dataview?.api;
		if (!dataviewApi) {
			new Notice(
				"The Dataview plugin is required for Task Priorities. Please install and enable the Dataview plugin."
			);
			return [];
		}
		const query = this.settings.taskQuery; // Use setting
		const results = await dataviewApi.query(query);
		if (results.successful) {
			return results.value.values
				.map((item: any) => {
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
}

// View class for displaying tasks by priority
class TaskPriorityView extends ItemView {
	plugin: TaskPriorityPlugin;
	tasks: TaskItem[] = [];
	draggedItem: HTMLElement | null = null;
	refreshInterval: number | null = null;
	sortBy: "date" | "file" | "text" = "date";

	constructor(leaf: WorkspaceLeaf, plugin: TaskPriorityPlugin) {
		super(leaf);
		this.plugin = plugin;
		this.sortBy = plugin.settings.defaultSort;
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
		this.tasks = await this.plugin.findTasksWithPrioritiesUsingDataview();

		// Sort tasks by priority
		this.sortTasks(this.sortBy);
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

		const actionsDiv = header.createEl("div", {
			cls: "task-priority-actions",
		});

		// Create sorting options
		const sortingDiv = actionsDiv.createEl("div", {
			cls: "task-priority-sorting",
		});
		sortingDiv.createEl("span", { text: "Sort by: " });

		const sortOptions = ["date", "file", "text"];
		const sortSelect = sortingDiv.createEl("select");

		sortOptions.forEach((option) => {
			const optEl = sortSelect.createEl("option", {
				text: option.charAt(0).toUpperCase() + option.slice(1),
				value: option,
			});
			if (option === this.sortBy) {
				optEl.selected = true;
			}
		});

		sortSelect.addEventListener("change", (e) => {
			const target = e.target as HTMLSelectElement;
			const sortValue = target.value as "date" | "file" | "text";
			this.sortBy = sortValue;
			this.sortTasks(sortValue);
		});

		// Create refresh button
		const refreshBtn = actionsDiv.createEl("button", {
			cls: "task-priority-refresh-btn",
			text: "Refresh",
		});
		refreshBtn.addEventListener("click", () => this.refreshTasks());

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
			text: `Priority highest (${tasksByPriority["Highest"].length})`,
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
	sortTasks(sortBy: "date" | "file" | "text"): void {
		switch (sortBy) {
			case "date":
				this.tasks.sort((a, b) => {
					if (!a.date && !b.date) return 0;
					if (!a.date) return 1;
					if (!b.date) return -1;
					return a.date.getTime() - b.date.getTime();
				});
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

		new Setting(containerEl)
			.setName("Default Sort")
			.setDesc("How to sort tasks by default")
			.addDropdown((dropdown) =>
				dropdown
					.addOption("date", "Date")
					.addOption("file", "File name")
					.addOption("text", "Task text")
					.setValue(this.plugin.settings.defaultSort)
					.onChange(async (value: "date" | "file" | "text") => {
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

		new Setting(containerEl)
			.setName("Task Query")
			.setDesc(
				"Dataview query to find tasks (e.g. TASK WHERE !completed AND !checked)"
			)
			.addTextArea((text) => {
				text.inputEl.style.minHeight = "150px";
				text.inputEl.style.minWidth = "300px";
				return text
					.setValue(this.plugin.settings.taskQuery)
					.setPlaceholder("TASK WHERE !completed AND !checked")
					.onChange(async (value) => {
						this.plugin.settings.taskQuery = value;
						await this.plugin.saveSettings();
					});
			});
	}
}
