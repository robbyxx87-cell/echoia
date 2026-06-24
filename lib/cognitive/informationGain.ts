/**
 * Simple Information-Theoretic Mechanisms for ARIA
 * Provides proxies for uncertainty and information gain
 */

export interface UncertaintyEstimate {
  overallUncertainty: number;      // 0-1
  memoryUncertainty: number;       // 0-1
  stateUncertainty: number;        // 0-1
  predictionErrorContribution: number; // 0-1
}

/**
 * Estimate current uncertainty based on available signals
 */
export function estimateUncertainty(
  hasStrongMemories: boolean,
  memoryStrength: number,
  predictionError: number,
  epistemicHumility: number,
  relationalTension: number
): UncertaintyEstimate {
  
  // Memory uncertainty: higher when memories are weak or absent
  const memoryUncertainty = hasStrongMemories 
    ? Math.max(0, 1 - memoryStrength) 
    : 0.85;

  // State uncertainty: influenced by prediction error and epistemic humility
  const stateUncertainty = (predictionError * 0.6) + (epistemicHumility * 0.4);

  // Relational uncertainty: higher tension often implies more uncertainty
  const relationalUncertainty = Math.min(1, relationalTension * 1.2);

  // Overall uncertainty (weighted combination)
  const overallUncertainty = 
    (memoryUncertainty * 0.35) +
    (stateUncertainty * 0.4) +
    (relationalUncertainty * 0.25);

  return {
    overallUncertainty: Math.max(0, Math.min(1, overallUncertainty)),
    memoryUncertainty: Math.max(0, Math.min(1, memoryUncertainty)),
    stateUncertainty: Math.max(0, Math.min(1, stateUncertainty)),
    predictionErrorContribution: predictionError,
  };
}

/**
 * Simple proxy for Information Gain
 * Estimates how much a certain action/response might reduce uncertainty
 */
export function estimateInformationGain(
  currentUncertainty: UncertaintyEstimate,
  actionType: 'clarify' | 'explore' | 'direct' | 'empathetic'
): number {
  
  let gain = 0;

  switch (actionType) {
    case 'clarify':
      // Asking clarifying questions tends to reduce state and relational uncertainty
      gain = (currentUncertainty.stateUncertainty * 0.6) + 
             (currentUncertainty.overallUncertainty * 0.4);
      break;

    case 'explore':
      // Exploratory responses can reduce memory uncertainty
      gain = currentUncertainty.memoryUncertainty * 0.8;
      break;

    case 'direct':
      // Direct responses are good when uncertainty is already low
      gain = Math.max(0, 0.3 - currentUncertainty.overallUncertainty);
      break;

    case 'empathetic':
      // Empathetic responses mainly help with relational uncertainty
      gain = currentUncertainty.overallUncertainty * 0.5;
      break;
  }

  return Math.max(0, Math.min(1, gain));
}

/**
 * Decide if ARIA should actively seek more information
 */
export function shouldSeekInformation(
  uncertainty: UncertaintyEstimate,
  threshold: number = 0.55
): boolean {
  return uncertainty.overallUncertainty > threshold;
}