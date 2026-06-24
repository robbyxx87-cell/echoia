/**
 * Dual Cognitive Pipeline (Reactive + Background)
 * 
 * Questo è il nuovo flusso principale:
 * - ReactiveLayer → gestisce la risposta veloce all'utente
 * - BackgroundLayer → elabora in background i task pesanti
 */

import { ReactiveLayer, ReactiveInput, ReactiveOutput } from '../reactive/ReactiveLayer';
import { BackgroundLayer, BackgroundTask } from '../background/BackgroundLayer';
import { TaskQueue } from '../background/TaskQueue';

export class DualCognitivePipeline {
  private reactiveLayer: ReactiveLayer;
  private backgroundLayer: BackgroundLayer;
  private taskQueue: TaskQueue;

  constructor() {
    this.reactiveLayer = new ReactiveLayer();
    this.backgroundLayer = new BackgroundLayer();
    this.taskQueue = new TaskQueue(this.backgroundLayer);
  }

  /**
   * Metodo principale chiamato quando l'utente invia un messaggio.
   * Deve essere il più veloce possibile.
   */
  async processMessage(input: {
    userId: string;
    userMessage: string;
    domain?: string;
  }): Promise<ReactiveOutput> {

    // === REACTIVE PATH (veloce) ===
    const reactiveInput: ReactiveInput = {
      userId: input.userId,
      userMessage: input.userMessage,
      domain: input.domain,
    };

    const reactiveOutput = await this.reactiveLayer.process(reactiveInput);

    // === BACKGROUND PATH (asincrono) ===
    // Mandiamo task pesanti in background senza bloccare la risposta

    this.taskQueue.addTask({
      type: 'prediction_update',
      userId: input.userId,
      payload: { userMessage: input.userMessage },
    });

    this.taskQueue.addTask({
      type: 'active_learning',
      userId: input.userId,
      payload: { userMessage: input.userMessage },
    });

    // Nota: memory_consolidation e nightly_job possono essere schedulati
    // periodicamente invece che ad ogni messaggio

    return reactiveOutput;
  }
}