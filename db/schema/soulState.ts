import {
  mysqlTable,
  varchar,
  int,
  bigint,
  real,
  json
} from 'drizzle-orm/mysql-core';

// ============================================
// SOUL STATE ENGINE - Core Schema
// 5-6 dimensional internal state
// ============================================

export const soulStateVectors = mysqlTable('soul_state_vectors', {
  id: varchar('id', { length: 36 }).primaryKey(),
  userId: varchar('user_id', { length: 36 }).notNull().unique(),
  
  // Core dimensions (0.0 - 1.0)
  vitalEnergy: real('vital_energy').notNull().default(0.6),
  relationalTension: real('relational_tension').notNull().default(0.3),
  depthOfMoment: real('depth_of_moment').notNull().default(0.5),
  innerDirection: real('inner_direction').notNull().default(0.5),
  quantumFluctuation: real('quantum_fluctuation').notNull().default(0.4),
  
  // Optional 6th dimension from Self-Falsification
  epistemicHumilityIndex: real('epistemic_humility_index').notNull().default(0.4),
  
  lastUpdatedAt: bigint('last_updated_at', { mode: 'number' }).notNull(),
  createdAt: bigint('created_at', { mode: 'number' }).notNull(),
});

// Simple log of significant state changes
export const soulStateEvents = mysqlTable('soul_state_events', {
  id: varchar('id', { length: 36 }).primaryKey(),
  userId: varchar('user_id', { length: 36 }).notNull(),
  dimension: varchar('dimension', { length: 30 }).notNull(),
  oldValue: real('old_value').notNull(),
  newValue: real('new_value').notNull(),
  reason: varchar('reason', { length: 100 }),
  createdAt: bigint('created_at', { mode: 'number' }).notNull(),
});