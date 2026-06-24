/**
 * Nightly Consolidation Job for ARIA
 * Combines LTP consolidation + Hippocampal Replay + Downscaling
 * This simulates what happens in the brain during sleep
 */

import { EpisodicMemory } from './episodicMemory';
import { runConsolidationPass } from './ltpConsolidation';
import { runNightlyHippocampalReplay, ReplayConfig } from './hippocampalReplay';

export interface NightlyConsolidationResult {
  totalMemories: number;
  consolidated: number;
  replayed: number;
  connectionsCreated: number;
  pruned: number;
}

/**
 * Main nightly consolidation process
 */
export function runNightlyConsolidation(
  memories: EpisodicMemory[],
  replayConfig?: ReplayConfig
): NightlyConsolidationResult {
  const initialCount = memories.length;

  // Step 1: Advanced LTP Consolidation Pass
  const consolidationResult = runConsolidationPass(memories);
  let workingMemories = consolidationResult.memories;

  // Step 2: Hippocampal Replay (on important memories)
  const replayResult = runNightlyHippocampalReplay(workingMemories, replayConfig);
  workingMemories = replayResult.updatedMemories;

  // Step 3: Downscaling + Cleanup (Synaptic Homeostasis)
  const downscaled = workingMemories.map(mem => {
    // Gentle downscaling for all memories
    const newStrength = mem.strength * 0.93;
    const newPotential = mem.consolidationPotential * 0.96;

    return {
      ...mem,
      strength: Math.max(0.05, newStrength),
      consolidationPotential: Math.max(0, newPotential),
    };
  });

  // Remove very weak memories that were never consolidated
  const cleaned = downscaled.filter(mem => 
    mem.strength > 0.08 || mem.state === 'CONSOLIDATED'
  );

  const prunedCount = downscaled.length - cleaned.length;

  return {
    totalMemories: initialCount,
    consolidated: consolidationResult.consolidatedCount,
    replayed: replayResult.replayedCount,
    connectionsCreated: replayResult.connectionsCreated,
    pruned: prunedCount,
  };
}

/**
 * Helper to get summary of what happened during the night
 */
export function getConsolidationSummary(result: NightlyConsolidationResult): string {
  return `
Nightly Consolidation Summary:
- Memories processed: ${result.totalMemories}
- Newly consolidated: ${result.consolidated}
- Memories replayed: ${result.replayed}
- New connections formed: ${result.connectionsCreated}
- Weak memories pruned: ${result.pruned}
  `.trim();
}