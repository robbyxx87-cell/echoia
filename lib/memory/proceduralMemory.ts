/**
 * Procedural Memory System for ARIA
 * For storing "how to do things" - skills, procedures, tacit knowledge
 * Especially useful for Knowledge Transfer use case
 */

export interface ProceduralMemory {
  id: string;
  userId: string;

  // Core procedure identification
  procedureName: string;
  domain: string;                    // e.g., "customer_service", "technical_troubleshooting", "sales"

  // The actual procedure
  steps: string[];                   // Ordered steps
  preconditions: string[];           // When this procedure applies
  exceptions: string[];              // Known exceptions + how to handle them

  // Tacit / Intuitive knowledge (the hardest part to capture)
  intuitionNotes: string[];          // "Tricks", heuristics, "I do this even if not written"
  warningSigns: string[];            // Early signals that something is going wrong

  // Metadata
  proficiencyLevel: number;          // 0.0 - 1.0 (how well ARIA has internalized it)
  reinforcementCount: number;
  lastUsedAt: number;
  createdAt: number;
}

const proceduralStore = new Map<string, ProceduralMemory[]>();

/**
 * Store a new procedural memory
 */
export function storeProceduralMemory(
  userId: string,
  procedureName: string,
  domain: string,
  steps: string[],
  preconditions: string[] = [],
  exceptions: string[] = [],
  intuitionNotes: string[] = [],
  warningSigns: string[] = []
): ProceduralMemory {
  if (!proceduralStore.has(userId)) {
    proceduralStore.set(userId, []);
  }

  const proc: ProceduralMemory = {
    id: crypto.randomUUID(),
    userId,
    procedureName,
    domain,
    steps,
    preconditions,
    exceptions,
    intuitionNotes,
    warningSigns,
    proficiencyLevel: 0.3,           // Starts relatively low
    reinforcementCount: 1,
    lastUsedAt: Date.now(),
    createdAt: Date.now(),
  };

  proceduralStore.get(userId)!.push(proc);
  return proc;
}

/**
 * Retrieve relevant procedural memories
 */
export function retrieveProceduralMemories(
  userId: string,
  context: string,
  domain?: string,
  limit: number = 3
): ProceduralMemory[] {
  const procedures = proceduralStore.get(userId) || [];
  if (procedures.length === 0) return [];

  const contextLower = context.toLowerCase();

  const scored = procedures.map(proc => {
    let score = 0;

    // Domain match (strong signal)
    if (domain && proc.domain.toLowerCase() === domain.toLowerCase()) {
      score += 0.4;
    }

    // Name match
    if (proc.procedureName.toLowerCase().includes(contextLower)) {
      score += 0.35;
    }

    // Step or precondition match
    const allText = [...proc.steps, ...proc.preconditions, ...proc.exceptions].join(' ').toLowerCase();
    if (allText.includes(contextLower)) {
      score += 0.25;
    }

    // Boost by proficiency and usage
    score += proc.proficiencyLevel * 0.3;
    score += Math.min(proc.reinforcementCount / 10, 0.2);

    return { procedure: proc, score };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.procedure);
}

/**
 * Reinforce / refine a procedural memory after successful use
 */
export function reinforceProceduralMemory(
  userId: string,
  procedureId: string,
  successFeedback?: string
): boolean {
  const procedures = proceduralStore.get(userId) || [];
  const proc = procedures.find(p => p.id === procedureId);

  if (!proc) return false;

  proc.reinforcementCount += 1;
  proc.lastUsedAt = Date.now();

  // Gradually increase proficiency
  proc.proficiencyLevel = Math.min(1, proc.proficiencyLevel + 0.07);

  // Optionally add new intuition notes from feedback
  if (successFeedback && successFeedback.length > 10) {
    proc.intuitionNotes.push(successFeedback);
  }

  return true;
}

/**
 * Add tacit knowledge / intuition to an existing procedure
 */
export function addIntuitionNote(
  userId: string,
  procedureId: string,
  note: string
): boolean {
  const procedures = proceduralStore.get(userId) || [];
  const proc = procedures.find(p => p.id === procedureId);

  if (!proc) return false;

  proc.intuitionNotes.push(note);
  return true;
}

/**
 * Get all procedural memories for a user (for inspection or export)
 */
export function getAllProceduralMemories(userId: string): ProceduralMemory[] {
  return proceduralStore.get(userId) || [];
}