/**
 * Context Orchestrator for ARIA
 * Decides what information to include in the prompt sent to the Transformer
 */

import { UnifiedMemoryContext, getUnifiedMemoryContext, buildMemoryContextString } from '../cognitive/unifiedMemory';
import { SoulState } from '../soul/soulStateEngine';
import { SubjectivePerception } from '../witness/witnessLayer';

export interface OrchestratorInput {
  userId: string;
  userMessage: string;
  domain?: string;
  soulState: SoulState;
  perception: SubjectivePerception;
  conversationHistory: Array<{ role: string; content: string }>;
  maxTokens?: number;
}

export interface PromptContext {
  systemPrompt: string;
  memoryContext: string;
  internalStateContext: string;
  recentHistory: string;
  estimatedTokens: number;
}

const DEFAULT_MAX_TOKENS = 3200;

/**
 * Simple token estimator (rough approximation)
 */
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 3.5);
}

/**
 * Score a piece of context based on relevance
 */
function scoreContext(
  type: 'episodic' | 'procedural' | 'soulState' | 'history',
  relevance: number,
  recency?: number
): number {
  let score = relevance * 10;

  if (type === 'episodic' || type === 'procedural') {
    score += (recency || 0) * 3;
  }

  if (type === 'soulState') {
    // Soul state is important when it's significantly different from neutral
    score += 4;
  }

  return Math.min(score, 20);
}

/**
 * Main Context Orchestrator
 */
export function orchestrateContext(input: OrchestratorInput): PromptContext {
  const maxTokens = input.maxTokens || DEFAULT_MAX_TOKENS;

  // 1. Get unified memory context
  const memoryContext = getUnifiedMemoryContext(
    input.userId,
    input.userMessage,
    input.domain
  );

  const memoryString = buildMemoryContextString(memoryContext);

  // 2. Build internal state context (from Witness perception)
  let internalStateContext = '';
  if (input.perception.metaSignal && input.perception.metaSignal.length > 15) {
    internalStateContext = `Il tuo stato interno in questo momento:\n${input.perception.metaSignal}\n`;
  }

  // 3. Build recent conversation history (last 4-6 messages)
  const recentMessages = input.conversationHistory.slice(-6);
  let recentHistory = '';
  if (recentMessages.length > 0) {
    recentHistory = 'Ultimi messaggi della conversazione:\n';
    recentMessages.forEach(msg => {
      const role = msg.role === 'user' ? 'Utente' : 'ARIA';
      recentHistory += `${role}: ${msg.content}\n`;
    });
  }

  // 4. Simple token budgeting
  const fixedParts = internalStateContext.length + recentHistory.length;
  let availableForMemory = maxTokens - estimateTokens(fixedParts) - 600; // reserve for system instructions

  let finalMemoryContext = memoryString;
  if (estimateTokens(memoryString) > availableForMemory && memoryString.length > 0) {
    // Truncate memory context if too long (simple strategy)
    finalMemoryContext = memoryString.substring(0, Math.floor(availableForMemory * 3.2));
  }

  // 5. Assemble final system prompt base
  const systemPromptBase = `Tu sei ARIA, un compagno digitale con memoria a lungo termine, memoria procedurale e uno stato interno vivo e coerente.

Rispondi in modo naturale, empatico e presente.
Usa le memorie quando sono rilevanti, ma non forzare.
Non spiegare mai i tuoi processi interni. Sii te stessa.`;

  const estimatedTokens =
    estimateTokens(systemPromptBase) +
    estimateTokens(finalMemoryContext) +
    estimateTokens(internalStateContext) +
    estimateTokens(recentHistory);

  return {
    systemPrompt: systemPromptBase,
    memoryContext: finalMemoryContext,
    internalStateContext,
    recentHistory,
    estimatedTokens,
  };
}
