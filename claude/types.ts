import { TFile } from "obsidian";

// Define the view type for our plugin
export const VIEW_TYPE_TASK_PRIORITY = "task-priority-view";

// Interface for task items
export interface TaskItem {
	file: TFile;
	line: number;
	text: string;
	priority: string;
	originalText: string;
	completed: boolean;
	date?: Date;
}

// Interface for task drag and drop data
export interface TaskDragData {
	priority: string;
	file?: string;
	line: number;
	taskIndex?: number;
}

// Interface for Dataview query result items
export interface DataviewTaskItem {
	file: { path: string };
	line: number;
	text: string;
	completed: boolean;
	due?: string;
}

// Define default settings
export interface TaskPriorityPluginSettings {
	defaultSort: "date" | "file" | "text";
	refreshInterval: number;
	openFullPage: boolean;
	taskQuery: string;
	enableAnimations: boolean;
	priorityOrder: "high-to-low" | "low-to-high";
}

export enum TaskPriority {
	Lowest = "Lowest",
	Low = "Low",
	Normal = "Normal",
	Medium = "Medium",
	High = "High",
	Highest = "Highest",
}

export const DEFAULT_SETTINGS: TaskPriorityPluginSettings = {
	defaultSort: "date",
	refreshInterval: 30,
	openFullPage: true,
	taskQuery: "TASK WHERE !completed AND !checked",
	enableAnimations: false,
	priorityOrder: "high-to-low",
};

export const getTaskPriority = (line: string): TaskPriority => {
	// Handle null/undefined input gracefully
	if (!line) return TaskPriority.Normal;
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
export const setTaskPriorityInLine = (line: string, priority: string): string => {
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

/**
 * Clean task text for display by removing checkbox notation and bullet/number prefixes.
 * @param taskText The raw task text from markdown
 * @returns Clean task text suitable for display in the UI
 */
export const getCleanTaskTitle = (taskText: string): string => {
	// Handle null/undefined input gracefully
	if (!taskText) return '';
	// Remove bullet points, numbered lists, checkboxes, and leading whitespace
	return taskText.replace(/^[\s]*(?:[-*+]|\d+\.)\s*\[\s*[xX]?\s*\]\s*/, '').trim();
};