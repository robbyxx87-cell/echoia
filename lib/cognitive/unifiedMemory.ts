/**
 * Unified Memory System for ARIA
 * Combines Episodic Memory + Procedural Memory for richer context
 */

import { retrieveEpisodicMemories, EpisodicMemory } from '../memory/episodicMemory';
import { retrieveProceduralMemories, ProceduralMemory } from '../memory/proceduralMemory';

export interface UnifiedMemoryContext {
  episodicMemories: EpisodicMemory[];
  proceduralMemories: ProceduralMemory[];
  hasRelevantMemories: boolean;
}

/**
 * Retrieve both episodic and procedural memories relevant to the current context
 */
export function getUnifiedMemoryContext(
  userId: string,
  currentMessage: string,
  domain?: string
): UnifiedMemoryContext {
  const episodic = retrieveEpisodicMemories(userId, currentMessage, 3);
  const procedural = retrieveProceduralMemories(userId, currentMessage, domain, 2);

  return {
    episodicMemories: episodic,
    proceduralMemories: procedural,
    hasRelevantMemories: episodic.length > 0 || procedural.length > 0,
  };
}

/**
 * Build a rich memory context string to inject into the system prompt
 */
export function buildMemoryContextString(context: UnifiedMemoryContext): string {
  let output = '';

  if (context.episodicMemories.length > 0) {
    output += 'Ricordi rilevanti dalla nostra storia insieme:\n';
    context.episodicMemories.forEach((mem, i) => {
      output += `${i + 1}. ${mem.content}`;
      if (mem.sceneContext) output += ` (contesto: ${mem.sceneContext})`;
      output += '\n';
    });
    output += '\n';
  }

  if (context.proceduralMemories.length > 0) {
    output += 'Procedure e modi di fare rilevanti:\n';
    context.proceduralMemories.forEach((proc, i) => {
      output += `${i + 1}. ${proc.procedureName}\n`;
      if (proc.intuitionNotes.length > 0) {
        output += `   Intuizioni: ${proc.intuitionNotes.slice(0, 2).join(' | ')}\n`;
      }
    });
    output += '\n';
  }

  return output.trim();
}