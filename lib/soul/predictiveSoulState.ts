/**
 * Predictive Soul State - Light implementation of Predictive Processing ideas
 * The Soul State starts to act as a simple generative model of internal state
 */

import { SoulState } from './soulStateEngine';

export interface StatePrediction {
  predictedState: Partial<SoulState>;
  predictionError: number; // 0-1, how much the actual state differed from prediction
}

/**
 * Simple predictive model: predicts how Soul State will evolve
 * based on conversation characteristics
 */
export function predictNextSoulState(
  currentState: SoulState,
  userMessage: string,
  conversationLength: number = 1
): Partial<SoulState> {
  const lower = userMessage.toLowerCase();
  const prediction: Partial<SoulState> = { ...currentState };

  // Predict based on emotional content
  if (lower.includes('triste') || lower.includes('difficile') || lower.includes('male')) {
    prediction.vitalEnergy = Math.max(0.2, currentState.vitalEnergy - 0.08);
    prediction.relationalTension = Math.min(0.9, currentState.relationalTension + 0.07);
    prediction.depthOfMoment = Math.min(0.95, currentState.depthOfMoment + 0.1);
  }

  if (lower.includes('bene') || lower.includes('felice') || lower.includes('grato')) {
    prediction.vitalEnergy = Math.min(1, currentState.vitalEnergy + 0.06);
    prediction.relationalTension = Math.max(0.1, currentState.relationalTension - 0.05);
  }

  if (lower.includes('importante') || lower.includes('serio') || lower.includes('rifletto')) {
    prediction.depthOfMoment = Math.min(1, currentState.depthOfMoment + 0.12);
    prediction.innerDirection = Math.min(1, currentState.innerDirection + 0.05);
  }

  // Longer conversations tend to increase depth
  if (conversationLength > 4) {
    prediction.depthOfMoment = Math.min(1, currentState.depthOfMoment + 0.04);
  }

  // Clamp all values
  Object.keys(prediction).forEach(key => {
    const k = key as keyof SoulState;
    if (typeof prediction[k] === 'number') {
      prediction[k] = Math.max(0, Math.min(1, prediction[k] as number));
    }
  });

  return prediction;
}

/**
 * Calculate prediction error between predicted and actual state
 */
export function calculatePredictionError(
  predicted: Partial<SoulState>,
  actual: SoulState
): number {
  let totalError = 0;
  let count = 0;

  const dimensions: (keyof SoulState)[] = [
    'vitalEnergy', 'relationalTension', 'depthOfMoment', 
    'innerDirection', 'quantumFluctuation', 'epistemicHumilityIndex'
  ];

  for (const dim of dimensions) {
    if (predicted[dim] !== undefined) {
      const error = Math.abs((predicted[dim] as number) - actual[dim]);
      totalError += error;
      count++;
    }
  }

  return count > 0 ? totalError / count : 0;
}

/**
 * Update state with prediction error awareness (basic Active Inference style)
 */
export function updateStateWithPrediction(
  currentState: SoulState,
  userMessage: string,
  conversationLength: number = 1
): { newState: SoulState; predictionError: number; predictedState: Partial<SoulState> } {
  
  const predictedState = predictNextSoulState(currentState, userMessage, conversationLength);
  
  // For now, we blend prediction with actual emotional analysis
  // In a fuller implementation, this would be more sophisticated
  const newState: SoulState = {
    vitalEnergy: Math.max(0, Math.min(1, 
      currentState.vitalEnergy * 0.6 + (predictedState.vitalEnergy || currentState.vitalEnergy) * 0.4
    )),
    relationalTension: Math.max(0, Math.min(1,
      currentState.relationalTension * 0.6 + (predictedState.relationalTension || currentState.relationalTension) * 0.4
    )),
    depthOfMoment: Math.max(0, Math.min(1,
      currentState.depthOfMoment * 0.5 + (predictedState.depthOfMoment || currentState.depthOfMoment) * 0.5
    )),
    innerDirection: currentState.innerDirection,
    quantumFluctuation: currentState.quantumFluctuation,
    epistemicHumilityIndex: currentState.epistemicHumilityIndex,
  };

  const predictionError = calculatePredictionError(predictedState, newState);

  return {
    newState,
    predictionError,
    predictedState,
  };
}