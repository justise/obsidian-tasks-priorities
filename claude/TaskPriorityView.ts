import {
	MarkdownView,
	Notice,
	WorkspaceLeaf,
	ItemView,
} from "obsidian";

import {
	TaskItem,
	VIEW_TYPE_TASK_PRIORITY,
} from "./types";
import TaskPriorityPlugin from "./TaskPriorityPlugin";

// View class for displaying tasks by priority
export class TaskPriorityView extends ItemView {
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

		// Set up interval to refresh tasks based on settings
		if (this.plugin.settings.refreshInterval > 0) {
			this.refreshInterval = window.setInterval(() => {
				this.refreshTasks();
			}, this.plugin.settings.refreshInterval * 1000);
		}

		// Add focus event listener to refresh when view becomes active
		this.app.workspace.on('active-leaf-change', (leaf) => {
			if (leaf === this.leaf) {
				this.refreshTasks();
			}
		});

		// Also listen for when the view container gets focus
		this.containerEl.addEventListener('focusin', () => {
			this.refreshTasks();
		});
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
		try {
			this.tasks = await this.plugin.findTasksWithPrioritiesUsingDataview();

			// Sort tasks by priority
			this.sortTasks(this.sortBy);
			this.renderView();
		} catch (error) {
			console.error('Failed to refresh tasks:', error);
			new Notice('Failed to refresh tasks. Please check the console for details.');
		}
	}

	// Create a task element
	createTaskElement(task: TaskItem, container: HTMLElement): HTMLElement {
		const taskEl = document.createElement("div");
		taskEl.addClass("task-priority-item");
		taskEl.setAttribute("draggable", "true");

		if (task.completed) {
			taskEl.addClass("task-completed");
		}

		// Create completion checkbox on the left
		const completionCheckbox = taskEl.createEl("div", {
			cls: "task-completion-checkbox",
		});

		const checkboxIcon = completionCheckbox.createEl("span", {
			cls: task.completed
				? "task-checkbox-checked"
				: "task-checkbox-unchecked",
		});

		checkboxIcon.innerHTML = task.completed ? "✓" : "";
		checkboxIcon.setAttribute(
			"title",
			task.completed ? "Mark as incomplete" : "Mark as complete"
		);

		completionCheckbox.addEventListener("click", async (e) => {
			e.stopPropagation();
			e.preventDefault();
			await this.toggleTaskCompletion(task, taskEl);
		});

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

	// Toggle task completion status
	async toggleTaskCompletion(
		task: TaskItem,
		taskEl: HTMLElement
	): Promise<void> {
		const newCompletedStatus = !task.completed;

		try {
			// Update the task in the file
			await this.plugin.updateTaskCompletion(task, newCompletedStatus);

			// Update the task object
			task.completed = newCompletedStatus;

			// Update the UI element
			const checkbox = taskEl.querySelector(
				".task-completion-checkbox span"
			) as HTMLElement;

			if (newCompletedStatus) {
				taskEl.addClass("task-completed");
				checkbox.addClass("task-checkbox-checked");
				checkbox.removeClass("task-checkbox-unchecked");
				checkbox.innerHTML = "✓";
				checkbox.setAttribute("title", "Mark as incomplete");

				// Add fade-out class for animation
				taskEl.addClass("task-fade-out");

				// Start fade-out process after 3 seconds
				setTimeout(() => {
					taskEl.addClass("fading");

					// Remove task from list after fade animation completes
					setTimeout(() => {
						// Remove task from the tasks array
						const taskIndex = this.tasks.indexOf(task);
						if (taskIndex > -1) {
							this.tasks.splice(taskIndex, 1);
						}

						// Remove the element from DOM
						taskEl.remove();
						
						// Re-render the view to update priority section headers with new counts
						this.renderView(true); // Preserve scroll position during update
					}, 500); // Wait for fade transition to complete
				}, 1000); // Wait 1 seconds before starting fade
			} else {
				taskEl.removeClass("task-completed");
				taskEl.removeClass("task-fade-out");
				taskEl.removeClass("fading");
				checkbox.addClass("task-checkbox-unchecked");
				checkbox.removeClass("task-checkbox-checked");
				checkbox.innerHTML = "";
				checkbox.setAttribute("title", "Mark as complete");
			}
		} catch (error) {
			new Notice(`Failed to update task: ${error.message}`);
			console.error("Error updating task completion:", error);
		}
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
						let taskData;
						try {
							taskData = JSON.parse(data);
						} catch (parseError) {
							console.error('Failed to parse drag data:', parseError);
							return;
						}
						
						// Validate task index bounds
						if (taskData.taskIndex < 0 || taskData.taskIndex >= this.tasks.length) {
							console.warn('Invalid task index:', taskData.taskIndex);
							return;
						}
						
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
							await this.renderView(true);
						}
					}
				}

				this.draggedItem = null;
			});
		});
	}

	// Store scroll positions of all scrollable containers
	storeScrollPositions(): Map<string, number> {
		const scrollPositions = new Map<string, number>();

		// Store scroll positions for each priority section
		const prioritySections = this.containerEl.querySelectorAll(
			".task-priority-items"
		);
		prioritySections.forEach((section, index) => {
			const scrollableEl = section as HTMLElement;
			scrollPositions.set(`section-${index}`, scrollableEl.scrollTop);
		});

		return scrollPositions;
	}

	// Restore scroll positions after re-render
	restoreScrollPositions(scrollPositions: Map<string, number>): void {
		// Use requestAnimationFrame to ensure DOM is updated
		requestAnimationFrame(() => {
			const prioritySections = this.containerEl.querySelectorAll(
				".task-priority-items"
			);
			prioritySections.forEach((section, index) => {
				const scrollableEl = section as HTMLElement;
				const savedPosition = scrollPositions.get(`section-${index}`);
				if (savedPosition !== undefined) {
					scrollableEl.scrollTop = savedPosition;
				}
			});
		});
	}

	// Render view with optional scroll preservation
	async renderView(preserveScroll = false): Promise<void> {
		let scrollPositions: Map<string, number> | null = null;

		if (preserveScroll) {
			scrollPositions = this.storeScrollPositions();
		}

		const container = this.containerEl.children[1];
		container.empty();

		container.addClass("task-priority-container");

		// Dot matrix background
		container.addClass("task-priority-dot-matrix-bg");

		// Create header
		const header = container.createEl("div", {
			cls: "task-priority-header",
		});
		header.createEl("h2", { text: "Tasks by priority" });

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
		
		// Determine column order based on settings
		const columnOrder = this.plugin.settings.priorityOrder === "high-to-low" 
			? ["High", "Medium", "Normal", "Low", "Lowest"]
			: ["Lowest", "Low", "Normal", "Medium", "High"];
			
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

		// Restore scroll positions if requested
		if (preserveScroll && scrollPositions) {
			this.restoreScrollPositions(scrollPositions);
		}
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