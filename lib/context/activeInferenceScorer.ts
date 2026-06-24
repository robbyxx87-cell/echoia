/**
 * Simplified Active Inference Scoring for ARIA
 * Uses concepts of Risk and Ambiguity (Expected Free Energy approximation)
 */

export interface ContextScore {
  risk: number;           // 0-1: How much this context deviates from desired internal state
  ambiguity: number;      // 0-1: How much uncertainty this context helps reduce
  expectedFreeEnergy: number; // Combined score (lower is better)
}

/**
 * Calculate a simplified Expected Free Energy score for a piece of context
 */
export function scoreContextWithActiveInference(
  contextType: 'episodic' | 'procedural' | 'soulState' | 'history',
  relevance: number,           // How relevant this context is to the current message (0-1)
  alignmentWithDesiredState: number, // How well it aligns with desired internal state (0-1)
  uncertaintyReduction: number,      // How much it reduces uncertainty (0-1)
  currentTension: number = 0.3       // Current relational tension (influences risk)
): ContextScore {
  
  // Risk: Higher when context pulls away from desired state or increases tension
  let risk = 1 - alignmentWithDesiredState;
  
  // Increase risk if tension is already high and context is emotionally charged
  if (currentTension > 0.6 && contextType === 'episodic') {
    risk = Math.min(1, risk + 0.15);
  }
  
  // Ambiguity: Lower when context significantly reduces uncertainty
  const ambiguity = Math.max(0, 1 - uncertaintyReduction * relevance);
  
  // Expected Free Energy (simplified): Risk + Ambiguity
  // We want to minimize this
  const expectedFreeEnergy = (risk * 0.6) + (ambiguity * 0.4);
  
  return {
    risk: Math.max(0, Math.min(1, risk)),
    ambiguity: Math.max(0, Math.min(1, ambiguity)),
    expectedFreeEnergy: Math.max(0, Math.min(1, expectedFreeEnergy)),
  };
}

/**
 * Decide whether to include a piece of context based on EFE
 */
export function shouldIncludeContext(score: ContextScore, threshold: number = 0.65): boolean {
  return score.expectedFreeEnergy < threshold;
}

/**
 * Rank multiple context options by Expected Free Energy (lower is better)
 */
export function rankContextsByEFE<T>(
  contexts: Array<{ item: T; score: ContextScore }>
): Array<{ item: T; score: ContextScore }> {
  return [...contexts].sort((a, b) => 
    a.score.expectedFreeEnergy - b.score.expectedFreeEnergy
  );
}