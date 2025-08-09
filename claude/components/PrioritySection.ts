import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { TaskItem } from '../types';

@customElement('priority-section')
export class PrioritySectionComponent extends LitElement {
  @property({ type: String })
  priority = 'Normal';

  @property({ type: Array })
  tasks: TaskItem[] = [];

  @property({ type: Boolean })
  allowDrop = true;

  @property({ type: Function })
  onTaskDrop?: (priority: string, taskData: any) => void;

  @property({ type: Function })
  onTaskToggle?: (task: TaskItem) => void;

  @property({ type: Function })
  onFileClick?: (task: TaskItem) => void;

  static styles = css`
    :host {
      display: block;
      background: var(--background-secondary, #f8f9fa);
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid var(--background-modifier-border, #ddd);
    }

    .task-priority-section {
      min-height: 200px;
      transition: all 0.2s ease;
    }

    .task-priority-section.task-priority-drop-target {
      background: var(--background-modifier-hover, #e8f4fd);
      border-color: var(--interactive-accent, #007acc);
    }

    .task-priority-section-header {
      padding: 12px 16px;
      background: var(--background-primary, #ffffff);
      border-bottom: 1px solid var(--background-modifier-border, #ddd);
      font-weight: 600;
      font-size: 14px;
      color: var(--text-normal, #000);
      cursor: grab;
      user-select: none;
    }

    .task-priority-section-header:active {
      cursor: grabbing;
    }

    .task-priority-section-header.priority-highest {
      background: #fee2e2;
      color: #991b1b;
    }

    .task-priority-section-header.priority-high {
      background: #fef3c7;
      color: #92400e;
    }

    .task-priority-section-header.priority-medium {
      background: #dbeafe;
      color: #1e40af;
    }

    .task-priority-section-header.priority-low {
      background: #d1fae5;
      color: #065f46;
    }

    .task-priority-section-header.priority-lowest {
      background: #f3f4f6;
      color: #374151;
    }

    .task-priority-items {
      padding: 8px;
      min-height: 150px;
      max-height: 400px;
      overflow-y: auto;
    }

    .task-priority-items:empty::after {
      content: 'Drop tasks here';
      display: block;
      text-align: center;
      color: var(--text-muted, #666);
      font-style: italic;
      padding: 40px 20px;
    }
  `;

  render() {
    const priorityClass = `priority-${this.priority.toLowerCase()}`;
    
    return html`
      <div 
        class="task-priority-section"
        data-priority="${this.priority}"
        @dragover="${this._handleDragOver}"
        @dragleave="${this._handleDragLeave}"
        @drop="${this._handleDrop}"
      >
        <div 
          class="task-priority-section-header ${priorityClass}"
          draggable="true"
          @dragstart="${this._handleHeaderDragStart}"
        >
          Priority ${this.priority} (${this.tasks.length})
        </div>
        
        <div class="task-priority-items">
          ${this.tasks.map(task => html`
            <task-item
              .task="${task}"
              .onToggleCompletion="${this.onTaskToggle}"
              .onFileClick="${this.onFileClick}"
            ></task-item>
          `)}
        </div>
      </div>
    `;
  }

  private _handleDragOver(e: DragEvent) {
    if (!this.allowDrop) return;
    e.preventDefault();
    this.shadowRoot?.querySelector('.task-priority-section')?.classList.add('task-priority-drop-target');
  }

  private _handleDragLeave(e: DragEvent) {
    const rect = this.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      this.shadowRoot?.querySelector('.task-priority-section')?.classList.remove('task-priority-drop-target');
    }
  }

  private _handleDrop(e: DragEvent) {
    e.preventDefault();
    this.shadowRoot?.querySelector('.task-priority-section')?.classList.remove('task-priority-drop-target');
    
    const data = e.dataTransfer?.getData('application/json');
    if (data && this.onTaskDrop) {
      const taskData = JSON.parse(data);
      this.onTaskDrop(this.priority, taskData);
    }
  }

  private _handleHeaderDragStart(e: DragEvent) {
    e.dataTransfer?.setData('text/plain', this.priority);
  }
}