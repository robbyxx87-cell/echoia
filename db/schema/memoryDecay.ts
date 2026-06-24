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

// ============================================
// MEMORY DECAY SYSTEM - Core Schema
// Following all Absolute Laws: MySQL/TiDB, varchar(36) UUID, bigint timestamps
// ============================================

export const memoryTraces = mysqlTable('memory_traces', {
  id: varchar('id', { length: 36 }).primaryKey(),
  userId: varchar('user_id', { length: 36 }).notNull(),
  content: text('content').notNull(),
  
  // Biological memory state
  state: varchar('state', { length: 20 }).notNull().default('LABILE'),
  // 'LABILE' | 'CONSOLIDATED' | 'PRUNED'
  
  strength: real('strength').notNull().default(1.0), // 0.0 - 1.0
  reinforcementCount: int('reinforcement_count').notNull().default(1),
  
  // Timestamps as bigint (Unix ms)
  createdAt: bigint('created_at', { mode: 'number' }).notNull(),
  lastReinforcedAt: bigint('last_reinforced_at', { mode: 'number' }).notNull(),
  consolidatedAt: bigint('consolidated_at', { mode: 'number' }),
  prunedAt: bigint('pruned_at', { mode: 'number' }),
  
  // Metadata
  source: varchar('source', { length: 50 }), // 'chat', 'narrative', 'echo_of', etc.
  metadata: json('metadata'),
});

export const reinforcementEvents = mysqlTable('reinforcement_events', {
  id: varchar('id', { length: 36 }).primaryKey(),
  traceId: varchar('trace_id', { length: 36 }).notNull()
    .references(() => memoryTraces.id, { onDelete: 'cascade' }),
  userId: varchar('user_id', { length: 36 }).notNull(),
  
  // What caused the reinforcement
  triggerType: varchar('trigger_type', { length: 50 }).notNull(),
  // 'explicit_feedback', 'revisit', 'emotional_salience', 'spreading_activation', etc.
  
  strengthDelta: real('strength_delta').notNull(),
  newStrength: real('new_strength').notNull(),
  
  createdAt: bigint('created_at', { mode: 'number' }).notNull(),
});

// Daily decay job log (for monitoring)
export const memoryDecayJobs = mysqlTable('memory_decay_jobs', {
  id: varchar('id', { length: 36 }).primaryKey(),
  executedAt: bigint('executed_at', { mode: 'number' }).notNull(),
  tracesProcessed: int('traces_processed').notNull(),
  tracesConsolidated: int('traces_consolidated').notNull(),
  tracesPruned: int('traces_pruned').notNull(),
  durationMs: int('duration_ms').notNull(),
});