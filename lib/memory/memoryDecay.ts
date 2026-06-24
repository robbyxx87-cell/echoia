import { db } from '@/db';
import { memoryTraces, reinforcementEvents, memoryDecayJobs } from '@/db/schema/memoryDecay';
import { eq, and, lt, gte } from 'drizzle-orm';

// ============================================
// MEMORY DECAY SYSTEM - Core Logic
// Two-phase exponential decay (Labile vs Consolidated)
// ============================================

const DECAY_CONSTANTS = {
  // Labile phase (fast decay)
  K_LABILE: 0.15,           // per day
  LABILE_THRESHOLD: 4,      // reinforcements needed to consolidate
  
  // Consolidated phase (slow decay)
  K_CONSOLIDATED: 0.008,    // per day
  
  // Pruning
  PRUNE_THRESHOLD: 0.05,    // strength below this = pruned
  MAX_LABILE_AGE_DAYS: 30,  // max days in labile state
};

// Input type for decay calculation
export interface DecayInput {
  strength: number;
  state: 'LABILE' | 'CONSOLIDATED' | 'PRUNED';
  lastReinforcedAt: number; // Unix ms
  reinforcementCount: number;
}

// Calculate decayed strength using two-phase model
export function computeDecayedStrength(input: DecayInput, now: number = Date.now()): number {
  if (input.state === 'PRUNED') return 0;

  const daysSinceReinforcement = (now - input.lastReinforcedAt) / (1000 * 60 * 60 * 24);
  
  let decayedStrength: number;

  if (input.state === 'CONSOLIDATED') {
    // Slow decay for consolidated memories
    decayedStrength = input.strength * Math.exp(-DECAY_CONSTANTS.K_CONSOLIDATED * daysSinceReinforcement);
  } else {
    // Fast decay for labile memories
    decayedStrength = input.strength * Math.exp(-DECAY_CONSTANTS.K_LABILE * daysSinceReinforcement);
  }

  return Math.max(0, Math.min(1, decayedStrength));
}

// Check if a trace should consolidate
export function shouldConsolidate(reinforcementCount: number, currentState: string): boolean {
  return currentState === 'LABILE' && reinforcementCount >= DECAY_CONSTANTS.LABILE_THRESHOLD;
}

// Check if a trace should be pruned
export function shouldPrune(strength: number): boolean {
  return strength < DECAY_CONSTANTS.PRUNE_THRESHOLD;
}

// Reinforce a memory trace
export async function reinforceTrace(
  traceId: string,
  userId: string,
  triggerType: string,
  strengthBoost: number = 0.15
) {
  const [trace] = await db
    .select()
    .from(memoryTraces)
    .where(eq(memoryTraces.id, traceId))
    .limit(1);

  if (!trace) return null;

  const newStrength = Math.min(1, trace.strength + strengthBoost);
  const newCount = trace.reinforcementCount + 1;
  
  let newState = trace.state;
  
  // Check for consolidation
  if (shouldConsolidate(newCount, trace.state)) {
    newState = 'CONSOLIDATED';
  }

  // Update trace
  await db
    .update(memoryTraces)
    .set({
      strength: newStrength,
      reinforcementCount: newCount,
      state: newState,
      lastReinforcedAt: Date.now(),
      consolidatedAt: newState === 'CONSOLIDATED' && trace.state !== 'CONSOLIDATED' 
        ? Date.now() 
        : trace.consolidatedAt,
    })
    .where(eq(memoryTraces.id, traceId));

  // Log reinforcement event
  await db.insert(reinforcementEvents).values({
    id: crypto.randomUUID(),
    traceId,
    userId,
    triggerType,
    strengthDelta: strengthBoost,
    newStrength,
    createdAt: Date.now(),
  });

  return { newStrength, newState };
}

// Daily decay job (should be scheduled)
export async function runDailyMemoryDecay(): Promise<{
  processed: number;
  consolidated: number;
  pruned: number;
  durationMs: number;
}> {
  const startTime = Date.now();
  const now = Date.now();

  const activeTraces = await db
    .select()
    .from(memoryTraces)
    .where(and(
      eq(memoryTraces.state, 'LABILE'),
      gte(memoryTraces.strength, DECAY_CONSTANTS.PRUNE_THRESHOLD)
    ));

  let consolidated = 0;
  let pruned = 0;

  for (const trace of activeTraces) {
    const decayed = computeDecayedStrength({
      strength: trace.strength,
      state: trace.state as any,
      lastReinforcedAt: trace.lastReinforcedAt,
      reinforcementCount: trace.reinforcementCount,
    }, now);

    let newState = trace.state;
    let updateData: any = { strength: decayed };

    // Check consolidation
    if (shouldConsolidate(trace.reinforcementCount, trace.state)) {
      newState = 'CONSOLIDATED';
      updateData.state = 'CONSOLIDATED';
      updateData.consolidatedAt = now;
      consolidated++;
    }

    // Check pruning
    if (shouldPrune(decayed)) {
      newState = 'PRUNED';
      updateData.state = 'PRUNED';
      updateData.prunedAt = now;
      pruned++;
    }

    await db
      .update(memoryTraces)
      .set(updateData)
      .where(eq(memoryTraces.id, trace.id));
  }

  const duration = Date.now() - startTime;

  // Log job execution
  await db.insert(memoryDecayJobs).values({
    id: crypto.randomUUID(),
    executedAt: now,
    tracesProcessed: activeTraces.length,
    tracesConsolidated: consolidated,
    tracesPruned: pruned,
    durationMs: duration,
  });

  return {
    processed: activeTraces.length,
    consolidated,
    pruned,
    durationMs: duration,
  };
}