/**
 * Episodic Long-Term Memory System for ARIA
 * Inspired by Scenic Memory + Dual Emotional Snapshot + Consolidation
 */

export interface EpisodicMemory {
  id: string;
  userId: string;
  content: string;
  
  // Episodic context
  sceneContext: string;
  userEmotion: string;
  ariaSoulState: string;
  
  strength: number;
  state: 'LABILE' | 'CONSOLIDATED';
  reinforcementCount: number;
  lastReinforcedAt: number;
  createdAt: number;
}

const episodicStore = new Map<string, EpisodicMemory[]>();

export function storeEpisodicMemory(
  userId: string,
  content: string,
  sceneContext: string,
  userEmotion: string,
  ariaSoulState: string
): EpisodicMemory {
  if (!episodicStore.has(userId)) {
    episodicStore.set(userId, []);
  }

  const memory: EpisodicMemory = {
    id: crypto.randomUUID(),
    userId,
    content,
    sceneContext,
    userEmotion,
    ariaSoulState,
    strength: 1.0,
    state: 'LABILE',
    reinforcementCount: 1,
    lastReinforcedAt: Date.now(),
    createdAt: Date.now(),
  };

  episodicStore.get(userId)!.push(memory);
  return memory;
}

export function retrieveEpisodicMemories(
  userId: string,
  query: string,
  limit: number = 3
): EpisodicMemory[] {
  const memories = episodicStore.get(userId) || [];
  if (memories.length === 0) return [];

  const now = Date.now();
  const queryLower = query.toLowerCase();

  // Score based on strength, recency, and content match
  const scored = memories.map(mem => {
    const daysSince = (now - mem.lastReinforcedAt) / (1000 * 60 * 60 * 24);
    const timeDecay = mem.state === 'CONSOLIDATED' 
      ? Math.exp(-0.008 * daysSince) 
      : Math.exp(-0.15 * daysSince);

    const contentMatch = queryLower.split(' ').some(word => 
      mem.content.toLowerCase().includes(word) ||
      mem.sceneContext.toLowerCase().includes(word) ||
      mem.userEmotion.toLowerCase().includes(word)
    ) ? 1.4 : 1.0;

    const score = mem.strength * timeDecay * contentMatch;

    return { memory: mem, score };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.memory);
}

export function reinforceEpisodicMemory(userId: string, memoryId: string) {
  const memories = episodicStore.get(userId) || [];
  const mem = memories.find(m => m.id === memoryId);
  
  if (!mem) return;

  mem.strength = Math.min(1, mem.strength + 0.18);
  mem.lastReinforcedAt = Date.now();
  mem.reinforcementCount += 1;

  // Consolidation
  if (mem.reinforcementCount >= 4 && mem.state === 'LABILE') {
    mem.state = 'CONSOLIDATED';
  }
}