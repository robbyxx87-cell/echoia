/**
 * Versione temporanea in memoria di SoulStateEngine
 * (per far partire il server senza database)
 */

export interface SoulState {
  vitalEnergy: number;
  relationalTension: number;
  depthOfMoment: number;
  innerDirection: number;
  quantumFluctuation: number;
  epistemicHumilityIndex: number;
}

const memoryStore = new Map<string, SoulState>();

const DEFAULT_STATE: SoulState = {
  vitalEnergy: 0.6,
  relationalTension: 0.3,
  depthOfMoment: 0.5,
  innerDirection: 0.5,
  quantumFluctuation: 0.4,
  epistemicHumilityIndex: 0.4,
};

export async function getSoulState(userId: string): Promise<SoulState> {
  if (!memoryStore.has(userId)) {
    memoryStore.set(userId, { ...DEFAULT_STATE });
  }
  return memoryStore.get(userId)!;
}

export async function updateSoulState(
  userId: string,
  updates: Partial<SoulState>,
  reason?: string
): Promise<SoulState> {
  const current = await getSoulState(userId);
  const newState = { ...current, ...updates };

  // Clamp values between 0 and 1
  Object.keys(newState).forEach(key => {
    const k = key as keyof SoulState;
    newState[k] = Math.max(0, Math.min(1, newState[k]));
  });

  memoryStore.set(userId, newState);
  return newState;
}

export function applyDopaminePriming(
  currentState: SoulState,
  dopamineSignal: number
): SoulState {
  return {
    ...currentState,
    vitalEnergy: Math.max(0, Math.min(1, currentState.vitalEnergy + dopamineSignal * 0.6)),
    depthOfMoment: Math.max(0, Math.min(1, currentState.depthOfMoment + dopamineSignal * 0.3)),
  };
}