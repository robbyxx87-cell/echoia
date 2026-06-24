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
// SCENIC MEMORY + DUAL EMOTIONAL SNAPSHOT
// Extends Memory Decay System
// ============================================

export const scenicImprints = mysqlTable('scenic_imprints', {
  id: varchar('id', { length: 36 }).primaryKey(),
  memoryId: varchar('memory_id', { length: 36 }).notNull()
    .references(() => memoryTraces.id, { onDelete: 'cascade' }),
  userId: varchar('user_id', { length: 36 }).notNull(),

  // Compressed scene vector (JSON array of floats)
  sceneVector: json('scene_vector').notNull(),
  
  // Dual Emotional Snapshot
  userEmotionSnapshot: json('user_emotion_snapshot').notNull(),
  ariaSoulSnapshot: json('aria_soul_snapshot').notNull(),
  
  hasDualSnapshot: boolean('has_dual_snapshot').notNull().default(false),
  relevanceScore: real('relevance_score').notNull(),
  
  sceneTimestamp: bigint('scene_timestamp', { mode: 'number' }).notNull(),
  createdAt: bigint('created_at', { mode: 'number' }).notNull(),
});