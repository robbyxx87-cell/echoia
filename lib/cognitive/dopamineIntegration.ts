import { SoulState, applyDopaminePriming } from '../soul/soulStateEngine';

// ============================================
// DOPAMINE INTEGRATION (placeholder for full Dopamine Engine)
// This will later be replaced by the full computeMotivationalPriming logic
// ============================================

export function calculateSimpleDopamineSignal(
  perceivedChallenge: number, // 0-1
  perceivedCompetence: number // 0-1
): { signal: number; zone: string } {
  const flowDelta = Math.abs(perceivedChallenge - perceivedCompetence);

  let signal: number;
  let zone: string;

  if (flowDelta < 0.15) {
    signal = 0.45;
    zone = 'FLOW';
  } else if (flowDelta < 0.35) {
    signal = 0.25;
    zone = 'STRETCH';
  } else if (flowDelta < 0.55) {
    signal = -0.1;
    zone = 'ANXIETY';
  } else {
    signal = -0.3;
    zone = perceivedChallenge > perceivedCompetence ? 'OVERWHELM' : 'BOREDOM';
  }

  return { signal, zone };
}

// Apply dopamine priming to soul state for the current turn only
export function primeSoulStateForResponse(
  currentState: SoulState,
  userMessage: string
): { primedState: SoulState; zone: string } {
  // Very simple heuristic for now (will be replaced by real challenge/competence assessment)
  const messageLength = userMessage.length;
  const perceivedChallenge = Math.min(0.9, messageLength / 200);
  const perceivedCompetence = 0.65; // placeholder - later will come from skill system

  const { signal, zone } = calculateSimpleDopamineSignal(perceivedChallenge, perceivedCompetence);
  const primedState = applyDopaminePriming(currentState, signal);

  return { primedState, zone };
}