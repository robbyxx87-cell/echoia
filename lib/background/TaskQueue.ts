/**
 * Simple Task Queue for Background Layer
 * Allows the Reactive Layer to offload heavy work without blocking
 */

import { BackgroundLayer, BackgroundTask } from './BackgroundLayer';

export class TaskQueue {
  private backgroundLayer: BackgroundLayer;
  private processingInterval: NodeJS.Timeout | null = null;

  constructor(backgroundLayer: BackgroundLayer) {
    this.backgroundLayer = backgroundLayer;
  }

  /**
   * Add a task to be processed in background
   */
  addTask(task: BackgroundTask) {
    this.backgroundLayer.enqueue(task);
  }

  /**
   * Start automatic processing (optional)
   */
  startAutoProcessing(intervalMs: number = 100) {
    if (this.processingInterval) return;

    this.processingInterval = setInterval(() => {
      // BackgroundLayer already processes its own queue
    }, intervalMs);
  }

  stopAutoProcessing() {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }
  }
}