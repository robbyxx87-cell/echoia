import {
  mysqlTable,
  varchar,
  text,
  int,
  bigint,
  real,
  boolean,
  json
} from 'drizzle-orm/mysql-core';
import { memoryTraces } from './memoryDecay';

// ============================================
// MEMORY SUPERPOSITION & CONFIDENCE LAYER
// Multiple weighted interpretations + Provenance
// ============================================

export const memoryInterpretations = mysqlTable('memory_interpretations', {
  id: varchar('id', { length: 36 }).primaryKey(),
  traceId: varchar('trace_id', { length: 36 }).notNull()
    .references(() => memoryTraces.id, { onDelete: 'cascade' }),
  
  meaning: text('meaning').notNull(),
  weight: real('weight').notNull(), // 0..1, sum should be ~1.0 per trace
  
  supportingEventIds: json('supporting_event_ids'),
  createdAt: bigint('created_at', { mode: 'number' }).notNull(),
  updatedAt: bigint('updated_at', { mode: 'number' }).notNull(),
});

export const interferenceEvents = mysqlTable('interference_events', {
  id: varchar('id', { length: 36 }).primaryKey(),
  affectedTraceId: varchar('affected_trace_id', { length: 36 }).notNull()
    .references(() => memoryTraces.id, { onDelete: 'cascade' }),
  triggerTraceId: varchar('trigger_trace_id', { length: 36 }),
  
  triggerContent: text('trigger_content'),
  weightsBefore: json('weights_before').notNull(),
  weightsAfter: json('weights_after').notNull(),
  
  occurredAt: bigint('occurred_at', { mode: 'number' }).notNull(),
});

export const inferenceProvenance = mysqlTable('inference_provenance', {
  id: varchar('id', { length: 36 }).primaryKey(),
  recordType: varchar('record_type', { length: 30 }).notNull(),
  // 'memory_trace' | 'echo_of_message' | 'temporal_perspective'
  
  recordId: varchar('record_id', { length: 36 }).notNull(),
  outputText: text('output_text').notNull(),
  
  isFactual: boolean('is_factual').notNull(),
  confidence: real('confidence').notNull(),
  source: varchar('source', { length: 50 }).notNull(),
  
  alternativeInterpretations: json('alternative_interpretations'),
  createdAt: bigint('created_at', { mode: 'number' }).notNull(),
});