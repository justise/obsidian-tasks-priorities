import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { TaskItem as TaskItemType } from '../types';

@customElement('task-item')
export class TaskItemComponent extends LitElement {
  @property({ type: Object })
  task?: TaskItemType;

  @property({ type: Boolean })
  draggable = true;

  @property({ type: Function })
  onToggleCompletion?: (task: TaskItemType) => void;

  @property({ type: Function })
  onFileClick?: (task: TaskItemType) => void;

  static styles = css`
    :host {
      display: block;
    }

    .task-priority-item {
      display: flex;
      align-items: flex-start;
      padding: 8px 12px;
      margin: 4px 0;
      background: var(--background-primary, #ffffff);
      border: 1px solid var(--background-modifier-border, #ddd);
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .task-priority-item:hover {
      background: var(--background-modifier-hover, #f5f5f5);
      border-color: var(--background-modifier-border-hover, #ccc);
    }

    .task-priority-item.task-completed {
      opacity: 0.6;
    }

    .task-completion-checkbox {
      width: 20px;
      height: 20px;
      border: 2px solid var(--text-muted, #666);
      border-radius: 3px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 12px;
      cursor: pointer;
      flex-shrink: 0;
      margin-top: 2px;
    }

    .task-checkbox-checked {
      background: var(--interactive-accent, #007acc);
      border-color: var(--interactive-accent, #007acc);
      color: white;
    }

    .task-content {
      flex: 1;
      min-width: 0;
    }

    .task-title {
      font-size: 14px;
      line-height: 1.4;
      color: var(--text-normal, #000);
      margin-bottom: 4px;
      word-wrap: break-word;
    }

    .task-file-info {
      font-size: 12px;
      color: var(--text-muted, #666);
      cursor: pointer;
      opacity: 0.8;
    }

    .task-file-info:hover {
      opacity: 1;
      color: var(--interactive-accent, #007acc);
    }

    .task-fade-out {
      animation: fadeOut 0.5s ease-out forwards;
    }

    @keyframes fadeOut {
      from {
        opacity: 1;
        transform: translateX(0);
      }
      to {
        opacity: 0;
        transform: translateX(-20px);
      }
    }
  `;

  render() {
    if (!this.task) return html``;

    return html`
      <div 
        class="task-priority-item ${this.task.completed ? 'task-completed' : ''}"
        draggable="${this.draggable}"
        @dragstart="${this._handleDragStart}"
      >
        <div 
          class="task-completion-checkbox"
          @click="${this._handleToggleCompletion}"
        >
          <span class="${this.task.completed ? 'task-checkbox-checked' : 'task-checkbox-unchecked'}">
            ${this.task.completed ? '✓' : ''}
          </span>
        </div>

        <div class="task-content">
          <div class="task-title">${this.task.text}</div>
          <div 
            class="task-file-info"
            @click="${this._handleFileClick}"
          >
            ${this.task.file?.path || 'Unknown file'}
          </div>
        </div>
      </div>
    `;
  }

  private _handleToggleCompletion(e: Event) {
    e.stopPropagation();
    if (this.task && this.onToggleCompletion) {
      this.onToggleCompletion(this.task);
    }
  }

  private _handleFileClick(e: Event) {
    e.stopPropagation();
    if (this.task && this.onFileClick) {
      this.onFileClick(this.task);
    }
  }

  private _handleDragStart(e: DragEvent) {
    if (!this.task) return;
    
    const dragData = {
      priority: this.task.priority,
      file: this.task.file?.path,
      line: this.task.line,
    };
    
    e.dataTransfer?.setData('application/json', JSON.stringify(dragData));
  }
}