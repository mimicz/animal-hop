CREATE TABLE `scores` (
	`id` text PRIMARY KEY NOT NULL,
	`nickname` text NOT NULL,
	`score` integer NOT NULL,
	`level` integer NOT NULL,
	`animal` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_scores_ranking` ON `scores` ("score" DESC,`created_at`,`id`);