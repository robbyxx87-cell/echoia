import { computeDecayedStrength } from '../memory/memoryDecay';

// ============================================
// SIMPLE IN-MEMORY MEMORY STORE
// For testing the platform without full DB
// ============================================

interface MemoryTrace {
  id: string;
  content: string;
  strength: number;
  lastReinforcedAt: number;
  reinforcementCount: number;
  state: 'LABILE' | 'CONSOLIDATED';
}

const memoryStore = new Map<string, MemoryTrace[]>();

export function addMemory(userId: string, content: string) {
  if (!memoryStore.has(userId)) {
    memoryStore.set(userId, []);
  }
  
  const memories = memoryStore.get(userId)!;
  
  memories.push({
    id: crypto.randomUUID(),
    content,
    strength: 1.0,
    lastReinforcedAt: Date.now(),
    reinforcementCount: 1,
    state: 'LABILE',
  });
}

export function retrieveRelevantMemories(userId: string, query: string, limit = 3): string[] {
  const memories = memoryStore.get(userId) || [];
  if (memories.length === 0) return [];

  const now = Date.now();
  
  // Simple relevance + decay scoring
  const scored = memories.map(mem => {
    const decayedStrength = computeDecayedStrength({
      strength: mem.strength,
      state: mem.state,
      lastReinforcedAt: mem.lastReinforcedAt,
      reinforcementCount: mem.reinforcementCount,
    }, now);

    // Very basic keyword matching for relevance
    const relevance = query.toLowerCase().split(' ').some(word => 
      mem.content.toLowerCase().includes(word)
    ) ? 1.2 : 1.0;

    return {
      ...mem,
      score: decayedStrength * relevance,
    };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(m => m.content);
}

export function reinforceMemory(userId: string, memoryContent: string) {
  const memories = memoryStore.get(userId) || [];
  const mem = memories.find(m => m.content === memoryContent);
  
  if (mem) {
    mem.strength = Math.min(1, mem.strength + 0.2);
    mem.lastReinforcedAt = Date.now();
    mem.reinforcementCount += 1;
    
    if (mem.reinforcementCount >= 4 && mem.state === 'LABILE') {
      mem.state = 'CONSOLIDATED';
    }
  }
}