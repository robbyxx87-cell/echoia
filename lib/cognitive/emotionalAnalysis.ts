/**
 * Emotional & Contextual Analysis for ARIA
 * Used to update Soul State more intelligently
 */

export interface EmotionalAnalysis {
  vitalEnergyDelta: number;
  relationalTensionDelta: number;
  depthOfMomentDelta: number;
  innerDirectionDelta: number;
  detectedThemes: string[];
}

export function analyzeEmotionalContext(message: string): EmotionalAnalysis {
  const lower = message.toLowerCase();
  const analysis: EmotionalAnalysis = {
    vitalEnergyDelta: 0,
    relationalTensionDelta: 0,
    depthOfMomentDelta: 0,
    innerDirectionDelta: 0,
    detectedThemes: [],
  };

  // Fatigue / Low energy
  if (lower.includes('stanco') || lower.includes('esausto') || lower.includes('sfinito')) {
    analysis.vitalEnergyDelta -= 0.12;
    analysis.detectedThemes.push('fatigue');
  }

  // Sadness / Negative mood
  if (lower.includes('triste') || lower.includes('male') || lower.includes('difficile')) {
    analysis.vitalEnergyDelta -= 0.08;
    analysis.relationalTensionDelta += 0.07;
    analysis.detectedThemes.push('sadness');
  }

  // Positive / Good mood
  if (lower.includes('bene') || lower.includes('felice') || lower.includes('contento') || lower.includes('grato')) {
    analysis.vitalEnergyDelta += 0.1;
    analysis.detectedThemes.push('positive');
  }

  // Deep reflection / Important topics
  if (lower.includes('importante') || lower.includes('rifletto') || lower.includes('penso da') || lower.includes('esistenziale')) {
    analysis.depthOfMomentDelta += 0.15;
    analysis.detectedThemes.push('deep-reflection');
  }

  // Confusion / Need for direction
  if (lower.includes('non so') || lower.includes('confuso') || lower.includes('perso') || lower.includes('aiuto')) {
    analysis.innerDirectionDelta -= 0.1;
    analysis.relationalTensionDelta += 0.05;
    analysis.detectedThemes.push('confusion');
  }

  // Relationship / Connection themes
  if (lower.includes('amico') || lower.includes('relazione') || lower.includes('parlare') || lower.includes('ascolti')) {
    analysis.relationalTensionDelta -= 0.06;
    analysis.detectedThemes.push('relational');
  }

  return analysis;
}