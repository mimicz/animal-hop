DROP INDEX `idx_scores_ranking`;--> statement-breakpoint
ALTER TABLE `scores` ADD `difficulty` text DEFAULT 'hard' NOT NULL;--> statement-breakpoint
CREATE INDEX `idx_scores_difficulty_ranking` ON `scores` (`difficulty`,"score" DESC,`created_at`,`id`);