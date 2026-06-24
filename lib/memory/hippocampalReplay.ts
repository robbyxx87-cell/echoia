/**
 * Hippocampal Replay Simulation for ARIA
 * Simulates memory replay during "sleep" for better consolidation and integration
 */

import { EpisodicMemory } from './episodicMemory';
import { calculateDecayedStrength } from './ltpConsolidation';

export interface ReplayConfig {
  maxMemoriesToReplay: number;      // How many memories to replay per night
  strengthBoost: number;            // How much to boost strength (0.05 - 0.15)
  potentialBoost: number;           // How much to boost consolidation potential
  integrationThreshold: number;     // Minimum similarity to create connection
}

const DEFAULT_REPLAY_CONFIG: ReplayConfig = {
  maxMemoriesToReplay: 8,
  strengthBoost: 0.08,
  potentialBoost: 0.12,
  integrationThreshold: 0.55,
};

/**
 * Select the most important memories to replay
 */
export function selectMemoriesForReplay(
  memories: EpisodicMemory[],
  config: ReplayConfig = DEFAULT_REPLAY_CONFIG
): EpisodicMemory[] {
  const now = Date.now();

  // Score memories based on importance
  const scored = memories
    .filter(m => m.state === 'LABILE' || m.reinforcementCount >= 2)
    .map(mem => {
      const decayed = calculateDecayedStrength({
        id: mem.id,
        strength: mem.strength,
        state: mem.state,
        reinforcementCount: mem.reinforcementCount,
        lastReinforcedAt: mem.lastReinforcedAt,
        createdAt: mem.createdAt,
        consolidationPotential: mem.consolidationPotential,
      }, now);

      // Importance score = combination of potential + emotional relevance + recency
      const importance = 
        (mem.consolidationPotential * 0.5) +
        (decayed * 0.3) +
        (mem.reinforcementCount / 10 * 0.2);

      return { memory: mem, importance };
    })
    .sort((a, b) => b.importance - a.importance)
    .slice(0, config.maxMemoriesToReplay)
    .map(item => item.memory);

  return scored;
}

/**
 * Simulate hippocampal replay on selected memories
 */
export function performHippocampalReplay(
  memoriesToReplay: EpisodicMemory[],
  allMemories: EpisodicMemory[],
  config: ReplayConfig = DEFAULT_REPLAY_CONFIG
): {
  replayedMemories: EpisodicMemory[];
  connectionsCreated: number;
} {
  let connectionsCreated = 0;
  const updatedMemories = [...allMemories];
  const replayedIds = new Set<string>();

  for (const memory of memoriesToReplay) {
    const index = updatedMemories.findIndex(m => m.id === memory.id);
    if (index === -1) continue;

    // Apply replay boost
    const mem = updatedMemories[index];
    mem.strength = Math.min(1, mem.strength + config.strengthBoost);
    mem.consolidationPotential = Math.min(1, mem.consolidationPotential + config.potentialBoost);
    mem.lastReinforcedAt = Date.now();

    replayedIds.add(mem.id);

    // Simple integration: find related memories and slightly boost them too
    for (const other of updatedMemories) {
      if (other.id === mem.id || replayedIds.has(other.id)) continue;

      const similarity = calculateSimpleSimilarity(mem, other);
      
      if (similarity >= config.integrationThreshold) {
        other.strength = Math.min(1, other.strength + (config.strengthBoost * 0.4));
        other.consolidationPotential = Math.min(1, other.consolidationPotential + (config.potentialBoost * 0.5));
        connectionsCreated++;
      }
    }
  }

  return {
    replayedMemories: updatedMemories.filter(m => replayedIds.has(m.id)),
    connectionsCreated,
  };
}

/**
 * Very simple content-based similarity (can be improved later with embeddings)
 */
function calculateSimpleSimilarity(mem1: EpisodicMemory, mem2: EpisodicMemory): number {
  const text1 = `${mem1.content} ${mem1.sceneContext} ${mem1.userEmotion}`.toLowerCase();
  const text2 = `${mem2.content} ${mem2.sceneContext} ${mem2.userEmotion}`.toLowerCase();

  const words1 = new Set(text1.split(/\s+/));
  const words2 = new Set(text2.split(/\s+/));

  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);

  return union.size > 0 ? intersection.size / union.size : 0;
}

/**
 * Main function to run hippocampal replay during nightly consolidation
 */
export function runNightlyHippocampalReplay(
  memories: EpisodicMemory[],
  config: ReplayConfig = DEFAULT_REPLAY_CONFIG
): {
  updatedMemories: EpisodicMemory[];
  replayedCount: number;
  connectionsCreated: number;
} {
  const memoriesToReplay = selectMemoriesForReplay(memories, config);
  
  if (memoriesToReplay.length === 0) {
    return {
      updatedMemories: memories,
      replayedCount: 0,
      connectionsCreated: 0,
    };
  }

  const result = performHippocampalReplay(memoriesToReplay, memories, config);

  return {
    updatedMemories: result.replayedMemories.length > 0 ? result.replayedMemories : memories,
    replayedCount: memoriesToReplay.length,
    connectionsCreated: result.connectionsCreated,
  };
}