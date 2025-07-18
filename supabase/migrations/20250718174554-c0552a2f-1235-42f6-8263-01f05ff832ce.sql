-- Remove all dummy data from the database
-- This will clean up scraped jobs and job matches, keeping user profiles intact

-- Delete all user job matches first (due to foreign key constraints)
DELETE FROM user_job_matches;

-- Delete all scraped jobs
DELETE FROM scraped_jobs;

-- Reset any sequences if needed
-- Note: UUIDs don't use sequences, so no need to reset