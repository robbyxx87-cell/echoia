/**
 * Active Learning Module for ARIA
 * Enables ARIA to actively seek information when uncertainty is high
 */

import { estimateUncertainty, shouldSeekInformation, UncertaintyEstimate } from './informationGain';

export interface ActiveLearningDecision {
  shouldAskQuestion: boolean;
  questionType: 'clarifying' | 'exploratory' | 'emotional' | 'none';
  reasoning: string;
  uncertaintyLevel: number;
}

/**
 * Decide whether ARIA should actively seek more information
 */
export function decideActiveLearning(
  userMessage: string,
  soulState: any,
  hasStrongMemories: boolean,
  predictionError: number,
  memoryStrength: number = 0.5
): ActiveLearningDecision {
  
  const uncertainty = estimateUncertainty(
    hasStrongMemories,
    memoryStrength,
    predictionError,
    soulState.epistemicHumilityIndex,
    soulState.relationalTension
  );

  const shouldAsk = shouldSeekInformation(uncertainty, 0.52);

  if (!shouldAsk) {
    return {
      shouldAskQuestion: false,
      questionType: 'none',
      reasoning: 'Uncertainty is low enough to respond directly',
      uncertaintyLevel: uncertainty.overallUncertainty,
    };
  }

  // Determine what kind of question would be most useful
  let questionType: 'clarifying' | 'exploratory' | 'emotional' = 'clarifying';

  const lower = userMessage.toLowerCase();

  if (soulState.relationalTension > 0.55 || lower.includes('triste') || lower.includes('difficile')) {
    questionType = 'emotional';
  } 
  else if (predictionError > 0.5 || !hasStrongMemories) {
    questionType = 'clarifying';
  } 
  else {
    questionType = 'exploratory';
  }

  return {
    shouldAskQuestion: true,
    questionType,
    reasoning: `High uncertainty (${(uncertainty.overallUncertainty * 100).toFixed(0)}%) — asking a ${questionType} question would help reduce it`,
    uncertaintyLevel: uncertainty.overallUncertainty,
  };
}

/**
 * Generate guidance for the system prompt when ARIA should ask questions
 */
export function getActiveLearningGuidance(decision: ActiveLearningDecision): string {
  if (!decision.shouldAskQuestion) {
    return '';
  }

  switch (decision.questionType) {
    case 'emotional':
      return 'Questo sembra un momento emotivamente delicato. È utile fare una domanda empatica per capire meglio come si sente l\'utente prima di approfondire.';
    
    case 'clarifying':
      return 'C\'è una certa incertezza. È meglio fare una domanda chiarificatrice per capire meglio il contesto o ciò che l\'utente intende.';
    
    case 'exploratory':
      return 'Potrebbe essere utile esplorare con una domanda aperta per raccogliere più informazioni rilevanti.';
    
    default:
      return '';
  }
}