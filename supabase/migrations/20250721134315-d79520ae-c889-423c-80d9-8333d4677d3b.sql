
-- Clean up old and irrelevant jobs from the database
-- Delete job matches for jobs that are not from today
DELETE FROM user_job_matches 
WHERE job_id IN (
    SELECT id FROM scraped_jobs 
    WHERE DATE(scraped_at) < CURRENT_DATE
);

-- Delete old scraped jobs (not from today)
DELETE FROM scraped_jobs 
WHERE DATE(scraped_at) < CURRENT_DATE;

-- Add an index on scraped_at for better performance
CREATE INDEX IF NOT EXISTS idx_scraped_jobs_scraped_at_date ON scraped_jobs(DATE(scraped_at));

-- Add a field to track if jobs have been properly validated
ALTER TABLE scraped_jobs ADD COLUMN IF NOT EXISTS is_validated BOOLEAN DEFAULT false;
