import { sql } from 'drizzle-orm';
import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
export const scores = sqliteTable('scores', {
 id: text('id').primaryKey(),
 nickname: text('nickname').notNull(),
 score: integer('score').notNull(),
 level: integer('level').notNull(),
 animal: text('animal').notNull(),
 difficulty: text('difficulty').notNull().default('hard'),
 createdAt: integer('created_at').notNull(),
}, table => [index('idx_scores_difficulty_ranking').on(table.difficulty, sql`${table.score} DESC`, table.createdAt, table.id)]);
