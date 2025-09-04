import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { TaskItem as TaskItemType } from '../types';
import { getCleanTaskTitle } from '../types';

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

  @property({ type: Boolean })
  processing = false;

  @property({ type: Boolean })
  enableAnimations = false;

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

    .task-checkbox-processing {
      border: 2px solid #ff006e;
      position: relative;
      overflow: visible;
      animation: fireworksCharge 0.8s ease-in-out infinite;
    }

    .task-checkbox-spinner {
      width: 12px;
      height: 12px;
      position: relative;
      animation: centralSpin 0.8s linear infinite;
    }

    .task-checkbox-spinner::before {
      content: '●';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 8px;
      color: #fff;
      background: radial-gradient(circle, #ff006e, #8338ec);
      width: 8px;
      height: 8px;
      border-radius: 50%;
      animation: chargeUp 0.8s ease-in-out infinite;
    }

    /* Create 8 explosion particles positioned around the center */
    .task-checkbox-processing::before,
    .task-checkbox-processing::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 0.5px;
      height: 0.5px;
      border-radius: 50%;
      pointer-events: none;
      background: #ff006e;
      animation: explodeParticle 1.2s ease-out infinite;
    }

    .task-checkbox-processing::before {
      animation-delay: 0s;
      --direction-x: 1;
      --direction-y: -1;
      --distance: 25px;
    }

    .task-checkbox-processing::after {
      animation-delay: 0.15s;
      --direction-x: -1;
      --direction-y: 1;
      --distance: 25px;
      background: #06ffa5;
    }

    /* Additional particles using box-shadow for more explosion directions */
    .task-checkbox-processing {
      box-shadow: 
        0 0 0 0 #ff006e,
        0 0 0 0 #ffbe0b,
        0 0 0 0 #8338ec,
        0 0 0 0 #3a86ff,
        0 0 0 0 #06ffa5,
        0 0 0 0 #fb5607;
      animation: fireworksCharge 0.8s ease-in-out infinite, particleBurst 1.2s ease-out infinite;
    }

    .task-checkbox-check {
      animation: checkmarkFireworks 0.6s ease-out forwards;
      transform-origin: center;
    }

    @keyframes fireworksCharge {
      0% { 
        transform: scale(1);
        filter: brightness(1);
        border-color: #ff006e;
      }
      50% { 
        transform: scale(1.1);
        filter: brightness(1.5);
        border-color: #ffbe0b;
      }
      100% { 
        transform: scale(1);
        filter: brightness(1);
        border-color: #ff006e;
      }
    }

    @keyframes centralSpin {
      0% { 
        transform: rotate(0deg);
      }
      100% { 
        transform: rotate(360deg);
      }
    }

    @keyframes chargeUp {
      0% {
        transform: translate(-50%, -50%) scale(0.5);
        opacity: 1;
        filter: brightness(1);
      }
      50% {
        transform: translate(-50%, -50%) scale(1.2);
        opacity: 1;
        filter: brightness(2);
      }
      100% {
        transform: translate(-50%, -50%) scale(0.8);
        opacity: 1;
        filter: brightness(1.5);
      }
    }

    @keyframes explodeParticle {
      0% {
        transform: translate(-50%, -50%) scale(0.2);
        opacity: 0;
        width: 0.5px;
        height: 0.5px;
      }
      5% {
        transform: translate(-50%, -50%) scale(0.4);
        opacity: 0.3;
        width: 0.5px;
        height: 0.5px;
      }
      15% {
        transform: translate(-50%, -50%) scale(1);
        opacity: 1;
        width: 1px;
        height: 1px;
      }
      50% {
        transform: translate(
          calc(-50% + var(--direction-x, 1) * calc(var(--distance, 25px) * 0.5)), 
          calc(-50% + var(--direction-y, 1) * calc(var(--distance, 25px) * 0.5))
        ) scale(4);
        opacity: 1;
        width: 6px;
        height: 6px;
      }
      100% {
        transform: translate(
          calc(-50% + var(--direction-x, 1) * var(--distance, 25px)), 
          calc(-50% + var(--direction-y, 1) * var(--distance, 25px))
        ) scale(8);
        opacity: 0;
        width: 10px;
        height: 10px;
      }
    }

    @keyframes particleBurst {
      0% {
        box-shadow: 
          0 0 0 0.5px transparent,
          0 0 0 0.5px transparent,
          0 0 0 0.5px transparent,
          0 0 0 0.5px transparent,
          0 0 0 0.5px transparent,
          0 0 0 0.5px transparent;
      }
      5% {
        box-shadow: 
          0 0 0 0.5px #ff006e,
          0 0 0 0.5px #ffbe0b,
          0 0 0 0.5px #8338ec,
          0 0 0 0.5px #3a86ff,
          0 0 0 0.5px #06ffa5,
          0 0 0 0.5px #fb5607;
      }
      20% {
        box-shadow: 
          0 0 0 1.5px #ff006e,
          0 0 0 1.5px #ffbe0b,
          0 0 0 1.5px #8338ec,
          0 0 0 1.5px #3a86ff,
          0 0 0 1.5px #06ffa5,
          0 0 0 1.5px #fb5607;
      }
      50% {
        box-shadow: 
          12px -12px 0 4px #ff006e,
          -12px -12px 0 4px #ffbe0b,
          12px 12px 0 4px #8338ec,
          -12px 12px 0 4px #3a86ff,
          0 -15px 0 4px #06ffa5,
          0 15px 0 4px #fb5607;
      }
      100% {
        box-shadow: 
          25px -25px 0 8px #ff006e,
          -25px -25px 0 8px #ffbe0b,
          25px 25px 0 8px #8338ec,
          -25px 25px 0 8px #3a86ff,
          0 -30px 0 8px #06ffa5,
          0 30px 0 8px #fb5607;
        opacity: 0;
      }
    }

    @keyframes checkmarkFireworks {
      0% {
        opacity: 0;
        transform: scale(0);
        filter: drop-shadow(0 0 0px transparent);
      }
      15% {
        opacity: 1;
        transform: scale(2);
        filter: drop-shadow(0 0 20px #ff006e) brightness(3);
      }
      30% {
        transform: scale(0.7);
        filter: drop-shadow(0 0 15px #ffbe0b) brightness(2);
      }
      50% {
        transform: scale(1.3);
        filter: drop-shadow(0 0 12px #06ffa5) brightness(1.5);
      }
      70% {
        transform: scale(0.9);
        filter: drop-shadow(0 0 8px #8338ec) brightness(1.2);
      }
      100% {
        opacity: 1;
        transform: scale(1);
        filter: drop-shadow(0 0 4px #3a86ff) brightness(1);
      }
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
          class="task-completion-checkbox ${this.processing && this.enableAnimations ? 'task-checkbox-processing' : ''}"
          @click="${this._handleToggleCompletion}"
        >
          <span class="${this.task.completed ? 'task-checkbox-checked' : 'task-checkbox-unchecked'}">
            ${this.processing && this.enableAnimations ? 
              html`<div class="task-checkbox-spinner"></div>` : 
              this.task.completed ? 
                html`<span class="${this.enableAnimations ? 'task-checkbox-check' : ''}">✓</span>` : 
                ''
            }
          </span>
        </div>

        <div class="task-content">
          <div class="task-title">${getCleanTaskTitle(this.task.text)}</div>
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