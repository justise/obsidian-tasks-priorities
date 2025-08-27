export class TFile {
  path: string;
  
  constructor(path?: string) {
    this.path = path || '';
  }
}

export class Plugin {
  constructor(public app: any, public manifest: any) {}
}

export class ItemView {
  constructor(public leaf: any) {}
}

export class PluginSettingTab {
  constructor(public app: any, public plugin: any) {}
}

export class Notice {
  constructor(public message: string) {}
}

export const VIEW_TYPE_TASK_PRIORITY = "task-priority-view";