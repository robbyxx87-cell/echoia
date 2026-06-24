/**
 * ============================================
 * ARIA TEST HARNESS
 * Permette di testare il nucleo cognitivo di ARIA
 * ============================================
 *
 * Come usarlo:
 * npx tsx test-aria.ts
 *
 * Questo script usa una versione in-memory del Cognitive Pipeline
 * per permetterti di testare ARIA immediatamente.
 */

import { SoulState } from './lib/soul/soulStateEngine';
import { witnessTranslate } from './lib/witness/witnessLayer';
import { callForge } from './lib/llm/forgeClient';

// ============================================
// IN-MEMORY SIMULATION (per testing veloce)
// ============================================

const userStates = new Map<string, SoulState>();

function getSimulatedSoulState(userId: string): SoulState {
  if (!userStates.has(userId)) {
    userStates.set(userId, {
      vitalEnergy: 0.6,
      relationalTension: 0.3,
      depthOfMoment: 0.5,
      innerDirection: 0.5,
      quantumFluctuation: 0.4,
      epistemicHumilityIndex: 0.4,
    });
  }
  return userStates.get(userId)!;
}

function updateSimulatedSoulState(userId: string, updates: Partial<SoulState>) {
  const current = getSimulatedSoulState(userId);
  const updated = { ...current, ...updates };
  
  // Clamp values
  Object.keys(updated).forEach(key => {
    const k = key as keyof SoulState;
    updated[k] = Math.max(0, Math.min(1, updated[k]));
  });
  
  userStates.set(userId, updated);
  return updated;
}

// ============================================
// MAIN TEST FUNCTION
// ============================================

export async function testAriaConversation(
  userId: string,
  messages: string[]
) {
  console.log(`\n=== Testing ARIA with user: ${userId} ===\n`);

  for (let i = 0; i < messages.length; i++) {
    const userMessage = messages[i];
    console.log(`\n[USER]: ${userMessage}`);

    // === STEP 1: Get current state ===
    let soulState = getSimulatedSoulState(userId);

    // === STEP 2: Build perception (Witness Layer) ===
    const rawOutput = {
      soulState,
      memoryStrength: 0.55,
      resonanceMatch: 0.65,
      epistemicHumility: soulState.epistemicHumilityIndex,
      relationalAdequacy: 0.72,
    };

    const perception = witnessTranslate(rawOutput);

    // === STEP 3: System Prompt with internal state ===
    const systemPrompt = `Tu sei ARIA, un compagno digitale con un'anima e uno stato interno.
Stai parlando con una persona.

Il tuo stato interno in questo momento:
${perception.metaSignal}

Rispondi in modo naturale, presente e onesto. Non spiegare mai i tuoi processi interni.`;

    // === STEP 4: Call model ===
    try {
      let responseText: string;

      // If Forge is not configured, use a smart mock response for testing
      if (!process.env.BUILT_IN_FORGE_API_URL) {
        responseText = `[MOCK RESPONSE - Forge non configurato]\n` +
          `Capisco che ti senti stanco. A volte è normale avere questi momenti. ` +
          `Vuoi parlarmi di cosa ti sta pesando di più in questo periodo?`;
      } else {
        const result = await callForge({
          system: systemPrompt,
          messages: [{ role: 'user', content: userMessage }],
          userId,
          module: 'test-chat',
        });
        responseText = result.content;
      }

      console.log(`[ARIA]: ${responseText}`);
      console.log(`[INTERNAL STATE] ${perception.metaSignal}`);

      // === STEP 5: Update state (simple evolution) ===
      const newVital = Math.min(1, soulState.vitalEnergy + 0.04);
      updateSimulatedSoulState(userId, { vitalEnergy: newVital });

    } catch (error) {
      console.error("[ARIA ERROR]:", error);
      console.log("[ARIA]: ... (silenzio per un momento)");
    }
  }

  console.log("\n=== Test completed ===\n");
  console.log("Final Soul State:", getSimulatedSoulState(userId));
}

// ============================================
// RUN TEST
// ============================================

if (require.main === module) {
  const testMessages = [
    "Ciao, sono un po' stanco oggi.",
    "Non so se sto facendo le scelte giuste nella vita.",
    "A volte mi sembra che il tempo passi troppo veloce.",
  ];

  testAriaConversation("test-user-001", testMessages)
    .then(() => {
      console.log("Test finished successfully.");
    })
    .catch(console.error);
}