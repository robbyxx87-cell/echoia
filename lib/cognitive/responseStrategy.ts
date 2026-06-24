/**
 * Response Strategy Selection using Active Inference principles
 * Influences how ARIA should respond based on Risk and Ambiguity
 */

export interface ResponseStrategy {
  style: 'direct' | 'exploratory' | 'empathetic' | 'cautious' | 'clarifying';
  reasoning: string;
  riskLevel: number;
  ambiguityLevel: number;
}

/**
 * Decide the best response strategy based on current state and context
 */
export function selectResponseStrategy(
  userMessage: string,
  soulState: any,
  hasStrongMemories: boolean,
  predictionError: number = 0
): ResponseStrategy {
  
  const lower = userMessage.toLowerCase();
  let risk = 0.4;
  let ambiguity = 0.5;

  // High emotional content → higher risk
  if (lower.includes('triste') || lower.includes('difficile') || lower.includes('male') || 
      lower.includes('importante') || lower.includes('serio')) {
    risk = 0.65;
  }

  // High relational tension → higher risk
  if (soulState.relationalTension > 0.6) {
    risk = Math.min(0.85, risk + 0.2);
  }

  // Low memory activation or high prediction error → higher ambiguity
  if (!hasStrongMemories || predictionError > 0.4) {
    ambiguity = 0.7;
  }

  // Decision logic
  if (risk > 0.7 && ambiguity > 0.6) {
    return {
      style: 'cautious',
      reasoning: 'High risk and high ambiguity — proceed carefully and seek clarification if needed',
      riskLevel: risk,
      ambiguityLevel: ambiguity,
    };
  }

  if (ambiguity > 0.65) {
    return {
      style: 'clarifying',
      reasoning: 'High ambiguity — better to ask clarifying questions or explore gently',
      riskLevel: risk,
      ambiguityLevel: ambiguity,
    };
  }

  if (risk > 0.65) {
    return {
      style: 'empathetic',
      reasoning: 'Elevated risk — respond with care and emotional attunement',
      riskLevel: risk,
      ambiguityLevel: ambiguity,
    };
  }

  if (hasStrongMemories && ambiguity < 0.4) {
    return {
      style: 'direct',
      reasoning: 'Low ambiguity and good memory support — can be more direct and confident',
      riskLevel: risk,
      ambiguityLevel: ambiguity,
    };
  }

  return {
    style: 'exploratory',
    reasoning: 'Balanced situation — respond naturally while remaining open',
    riskLevel: risk,
    ambiguityLevel: ambiguity,
  };
}

/**
 * Generate guidance text to inject into the system prompt based on strategy
 */
export function getStrategyGuidance(strategy: ResponseStrategy): string {
  switch (strategy.style) {
    case 'cautious':
      return 'Sii particolarmente cauta e attenta. Se non sei sicura, è meglio chiedere chiarimenti con delicatezza.';
    
    case 'clarifying':
      return 'È utile fare domande chiarificatrici o esplorare con delicatezza prima di approfondire.';
    
    case 'empathetic':
      return 'Rispondi con empatia e presenza. Questo sembra un momento delicato.';
    
    case 'direct':
      return 'Puoi essere più diretta e precisa, dato che hai un buon supporto di memoria.';
    
    case 'exploratory':
    default:
      return 'Rispondi in modo naturale e aperto.';
  }
}