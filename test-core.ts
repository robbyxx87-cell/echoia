/**
 * Automatic Core Tests for EchoIA / ARIA
 */

import { computeDecayedStrength } from './lib/memory/memoryDecay';
import { witnessTranslate } from './lib/witness/witnessLayer';
import { addMemory, retrieveRelevantMemories } from './lib/cognitive/simpleMemoryStore';
import { processMessage } from './lib/cognitive/cognitivePipeline';

console.log("=== Starting EchoIA Core Tests ===\n");

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void) {
  try {
    fn();
    console.log(`✅ ${name}`);
    passed++;
  } catch (e: any) {
    console.log(`❌ ${name}`);
    console.log(`   Error: ${e.message}`);
    failed++;
  }
}

// Test 1: Memory Decay
test("Memory Decay - Labile decay", () => {
  const result = computeDecayedStrength({
    strength: 0.9,
    state: 'LABILE',
    lastReinforcedAt: Date.now() - 1000 * 60 * 60 * 24, // 1 day ago
    reinforcementCount: 2,
  });
  if (result >= 0.7) throw new Error("Decay too slow for LABILE");
});

// Test 2: Soul State
test("Soul State - Create and update", async () => {
  const userId = 'test-user-' + Date.now();
  const state = await getSoulState(userId);
  if (!state) throw new Error("Failed to create soul state");

  await updateSoulState(userId, { vitalEnergy: 0.85 });
  const updated = await getSoulState(userId);
  if (updated.vitalEnergy < 0.8) throw new Error("Soul state update failed");
});

// Test 3: Witness Layer
test("Witness Layer - Translation", () => {
  const perception = witnessTranslate({
    soulState: {
      vitalEnergy: 0.8,
      relationalTension: 0.3,
      depthOfMoment: 0.6,
      innerDirection: 0.5,
      quantumFluctuation: 0.4,
      epistemicHumilityIndex: 0.5,
    },
    memoryStrength: 0.7,
  });
  if (!perception.metaSignal || perception.metaSignal.length < 10) {
    throw new Error("Witness translation failed");
  }
});

// Test 4: Simple Memory Store
test("Memory Store - Add and retrieve", () => {
  const userId = 'mem-test-' + Date.now();
  addMemory(userId, "I feel tired today");
  addMemory(userId, "I had a good conversation yesterday");

  const results = retrieveRelevantMemories(userId, "tired", 2);
  if (results.length === 0) throw new Error("Memory retrieval failed");
});

// Test 5: Cognitive Pipeline (basic run)
test("Cognitive Pipeline - Basic message processing", async () => {
  const userId = 'pipeline-test-' + Date.now();
  const result = await processMessage({
    userId,
    userMessage: "Hello, I'm feeling a bit lost today.",
  });

  if (!result.response || result.response.length < 5) {
    throw new Error("Pipeline did not return a response");
  }
  if (!result.perception) {
    throw new Error("Pipeline did not return perception");
  }
});

console.log(`\n=== Test Results ===`);
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);

if (failed > 0) {
  console.log("\n⚠️ Some tests failed. Please review the errors above.");
  process.exit(1);
} else {
  console.log("\n✅ All core tests passed!");
}