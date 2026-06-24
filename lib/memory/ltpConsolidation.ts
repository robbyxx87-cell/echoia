/**
 * Advanced LTP-style Consolidation System
 * More biologically plausible memory consolidation
 */

export interface MemoryTrace {
  id: string;
  strength: number;
  state: 'LABILE' | 'CONSOLIDATED';
  reinforcementCount: number;
  lastReinforcedAt: number;
  createdAt: number;
  consolidationPotential: number; // 0 to 1
}

export interface ConsolidationResult {
  newState: 'LABILE' | 'CONSOLIDATED';
  newStrength: number;
  newConsolidationPotential: number;
  consolidated: boolean;
}

const LTP_PARAMS = {
  // Decay rates (per day)
  K_LABILE: 0.18,
  K_CONSOLIDATED: 0.007,

  // Consolidation rules
  MIN_REINFORCEMENTS: 3,
  MIN_TIME_BETWEEN_REINFORCEMENTS_HOURS: 2, // Spacing effect
  CONSOLIDATION_THRESHOLD: 0.65,

  // Potential growth
  POTENTIAL_GAIN_PER_REINFORCEMENT: 0.22,
  POTENTIAL_DECAY_RATE: 0.04, // per day if not reinforced
};

/**
 * Calculate decayed strength with improved LTP model
 */
export function calculateDecayedStrength(trace: MemoryTrace, now: number = Date.now()): number {
  const daysSinceReinforcement = (now - trace.lastReinforcedAt) / (1000 * 60 * 60 * 24);
  
  const k = trace.state === 'CONSOLIDATED' 
    ? LTP_PARAMS.K_CONSOLIDATED 
    : LTP_PARAMS.K_LABILE;

  return Math.max(0, trace.strength * Math.exp(-k * daysSinceReinforcement));
}

/**
 * Apply reinforcement with spacing effect and consolidation potential
 */
export function applyReinforcement(
  trace: MemoryTrace,
  now: number = Date.now()
): ConsolidationResult {
  const hoursSinceLastReinforcement = (now - trace.lastReinforcedAt) / (1000 * 60 * 60);

  // Calculate potential decay since last reinforcement
  const daysSince = (now - trace.lastReinforcedAt) / (1000 * 60 * 60 * 24);
  const potentialDecay = trace.consolidationPotential * LTP_PARAMS.POTENTIAL_DECAY_RATE * daysSince;

  let newPotential = Math.max(0, trace.consolidationPotential - potentialDecay);

  // Apply reinforcement
  const effectiveReinforcement = hoursSinceLastReinforcement >= LTP_PARAMS.MIN_TIME_BETWEEN_REINFORCEMENTS_HOURS 
    ? 1.0 
    : 0.6; // Reduced effect if too close (spacing)

  newPotential = Math.min(1, newPotential + LTP_PARAMS.POTENTIAL_GAIN_PER_REINFORCEMENT * effectiveReinforcement);

  const newStrength = Math.min(1, trace.strength + 0.15 * effectiveReinforcement);
  const newCount = trace.reinforcementCount + 1;

  // Check for consolidation
  let newState = trace.state;
  let consolidated = false;

  const shouldConsolidate = 
    newCount >= LTP_PARAMS.MIN_REINFORCEMENTS &&
    newPotential >= LTP_PARAMS.CONSOLIDATION_THRESHOLD &&
    trace.state === 'LABILE';

  if (shouldConsolidate) {
    newState = 'CONSOLIDATED';
    consolidated = true;
  }

  return {
    newState,
    newStrength,
    newConsolidationPotential: newPotential,
    consolidated,
  };
}

/**
 * Daily consolidation job (simulates sleep / offline consolidation)
 */
export function runConsolidationPass(memories: MemoryTrace[], now: number = Date.now()): {
  consolidatedCount: number;
  memories: MemoryTrace[];
} {
  let consolidatedCount = 0;

  const updatedMemories = memories.map(mem => {
    if (mem.state === 'CONSOLIDATED') return mem;

    const daysSince = (now - mem.lastReinforcedAt) / (1000 * 60 * 60 * 24);
    const potentialDecay = mem.consolidationPotential * LTP_PARAMS.POTENTIAL_DECAY_RATE * daysSince;
    const newPotential = Math.max(0, mem.consolidationPotential - potentialDecay);

    // Passive consolidation during "sleep"
    if (newPotential >= LTP_PARAMS.CONSOLIDATION_THRESHOLD && 
        mem.reinforcementCount >= LTP_PARAMS.MIN_REINFORCEMENTS) {
      consolidatedCount++;
      return {
        ...mem,
        state: 'CONSOLIDATED' as const,
        consolidationPotential: newPotential,
      };
    }

    return {
      ...mem,
      consolidationPotential: newPotential,
    };
  });

  return {
    consolidatedCount,
    memories: updatedMemories,
  };
}