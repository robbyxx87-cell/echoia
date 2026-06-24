import { db } from '@/db';
import { aiCostUsage } from '@/db/schema'; // assume this exists from earlier docs

// ============================================
// CENTRALIZED FORGE LLM CLIENT
// With safety: timeout, circuit breaker, logging, cost tracking
// ============================================

interface ForgeCallOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
  system?: string;
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
  userId?: string;
  module?: string; // for cost tracking
}

interface ForgeResponse {
  content: string;
  inputTokens: number;
  outputTokens: number;
  estimatedCostEuro: number;
}

const FORGE_URL = process.env.BUILT_IN_FORGE_API_URL!;
const FORGE_KEY = process.env.BUILT_IN_FORGE_API_KEY!;

let circuitOpen = false;
let lastFailureTime = 0;
const CIRCUIT_TIMEOUT = 30000; // 30 seconds

export async function callForge(options: ForgeCallOptions): Promise<ForgeResponse> {
  // Circuit breaker
  if (circuitOpen) {
    if (Date.now() - lastFailureTime > CIRCUIT_TIMEOUT) {
      circuitOpen = false;
    } else {
      throw new Error('Forge circuit breaker is open');
    }
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25000); // 25s timeout

  try {
    const response = await fetch(FORGE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${FORGE_KEY}`,
      },
      body: JSON.stringify({
        model: options.model || 'claude-sonnet-4-6',
        max_tokens: options.maxTokens || 800,
        temperature: options.temperature ?? 0.7,
        system: options.system,
        messages: options.messages,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      circuitOpen = true;
      lastFailureTime = Date.now();
      throw new Error(`Forge API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    
    // Rough token estimation (can be improved with tiktoken later)
    const inputTokens = Math.ceil(JSON.stringify(options.messages).length / 4);
    const outputTokens = Math.ceil(content.length / 4);
    
    // Very rough cost estimate (adjust based on real pricing)
    const estimatedCost = (inputTokens * 0.000003) + (outputTokens * 0.000015);

    // Log cost if userId and module provided
    if (options.userId && options.module) {
      await db.insert(aiCostUsage).values({
        id: crypto.randomUUID(),
        userId: options.userId,
        module: options.module,
        inputTokens,
        outputTokens,
        estimatedCostEuro: estimatedCost.toFixed(6),
        createdAt: Date.now(),
      }).catch(() => {}); // non-blocking
    }

    return {
      content,
      inputTokens,
      outputTokens,
      estimatedCostEuro: estimatedCost,
    };

  } catch (error) {
    clearTimeout(timeout);
    circuitOpen = true;
    lastFailureTime = Date.now();
    throw error;
  }
}