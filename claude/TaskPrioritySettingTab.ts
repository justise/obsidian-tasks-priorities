import {
	App,
	PluginSettingTab,
	Setting,
} from "obsidian";

import TaskPriorityPlugin from "./TaskPriorityPlugin";

// Settings tab
export class TaskPrioritySettingTab extends PluginSettingTab {
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

		new Setting(containerEl)
			.setName("Priority Column Order")
			.setDesc("Order of priority columns from left to right")
			.addDropdown((dropdown) =>
				dropdown
					.addOption("high-to-low", "High to Low (Highest → Lowest)")
					.addOption("low-to-high", "Low to High (Lowest → Highest)")
					.setValue(this.plugin.settings.priorityOrder)
					.onChange(async (value: "high-to-low" | "low-to-high") => {
						this.plugin.settings.priorityOrder = value;
						await this.plugin.saveSettings();
						// Trigger view refresh to apply new order
						this.plugin.refreshView();
					})
			);

		// Experimental section
		containerEl.createEl("h3", { text: "Experimental Features" });
		containerEl.createEl("p", { 
			text: "⚠️ These features are experimental and may cause performance issues or unexpected behavior.",
			cls: "setting-item-description"
		});

		new Setting(containerEl)
			.setName("Enable Task Animations")
			.setDesc("🧪 EXPERIMENTAL: Enable fireworks animations when completing tasks. May impact performance.")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.enableAnimations)
					.onChange(async (value) => {
						this.plugin.settings.enableAnimations = value;
						await this.plugin.saveSettings();
					})
			);
	}
}