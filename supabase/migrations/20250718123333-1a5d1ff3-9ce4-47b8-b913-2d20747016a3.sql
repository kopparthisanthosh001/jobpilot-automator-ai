-- Remove matched_at column and add date_posted column to user_job_matches table
ALTER TABLE user_job_matches 
DROP COLUMN matched_at,
ADD COLUMN date_posted TIMESTAMP WITH TIME ZONE;