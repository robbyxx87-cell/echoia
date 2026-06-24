import { getSoulState, updateSoulState, SoulState } from '../soul/soulStateEngine';
import { witnessTranslate, SubjectivePerception } from '../witness/witnessLayer';
import { callForge } from '../llm/forgeClient';
import { getUnifiedMemoryContext, buildMemoryContextString } from './unifiedMemory';
import { analyzeEmotionalContext } from './emotionalAnalysis';

// ============================================
// COGNITIVE PIPELINE v5 - Integrated with Meta-Perception
// ============================================

export interface ProcessMessageInput {
  userId: string;
  userMessage: string;
  sessionId?: string;
  domain?: string;
}

export interface ProcessMessageResult {
  response: string;
  soulState: SoulState;
  perception: SubjectivePerception;
  usedEpisodicMemories: number;
  usedProceduralMemories: number;
}

export async function processMessage(input: ProcessMessageInput): Promise<ProcessMessageResult> {
  const { userId, userMessage, domain } = input;

  let soulState = await getSoulState(userId);

  const memoryContext = getUnifiedMemoryContext(userId, userMessage, domain);
  const memoryContextString = buildMemoryContextString(memoryContext);

  const emotionalUpdates = analyzeEmotionalContext(userMessage);
  if (Object.keys(emotionalUpdates).length > 0) {
    soulState = await updateSoulState(userId, emotionalUpdates, 'emotional_detection');
  }

  const rawOutput = {
    soulState,
    memoryStrength: memoryContext.hasRelevantMemories ? 0.82 : 0.35,
    resonanceMatch: memoryContext.hasRelevantMemories ? 0.75 : 0.5,
    epistemicHumility: soulState.epistemicHumilityIndex,
    relationalAdequacy: 0.7,
  };

  const perception = witnessTranslate(rawOutput);

  const systemPrompt = `Tu sei ARIA, un compagno digitale con memoria a lungo termine, memoria procedurale e uno stato interno vivo.

Il tuo stato interno attuale:
${perception.metaSignal}

${memoryContextString ? memoryContextString + '\n' : ''}

Rispondi in modo naturale, empatico e presente.
Usa le memorie quando sono rilevanti, ma non forzare.
Non spiegare mai i tuoi processi interni. Sii te stessa.`;

  let responseText: string;
  try {
    if (process.env.BUILT_IN_FORGE_API_URL) {
      const result = await callForge({
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }],
        userId,
        module: 'chat',
      });
      responseText = result.content;
    } else {
      responseText = `[Risposta simulata] ${memoryContext.hasRelevantMemories ? 'Mi viene in mente qualcosa di simile.' : ''} Dimmi di più.`;
    }
  } catch (error) {
    responseText = "Sto avendo un momento di silenzio interiore. Puoi ripetere?";
  }

  const finalUpdates: Partial<SoulState> = {
    vitalEnergy: Math.min(1, soulState.vitalEnergy + 0.025),
  };
  soulState = await updateSoulState(userId, finalUpdates, 'after_conversation');

  return {
    response: responseText,
    soulState,
    perception,
    usedEpisodicMemories: memoryContext.episodicMemories.length,
    usedProceduralMemories: memoryContext.proceduralMemories.length,
  };
}