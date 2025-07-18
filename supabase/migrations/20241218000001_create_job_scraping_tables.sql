-- Create scraped_jobs table
CREATE TABLE scraped_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT,
  description TEXT,
  salary_range TEXT,
  platform TEXT NOT NULL DEFAULT 'indeed',
  job_url TEXT NOT NULL,
  scraped_at TIMESTAMP DEFAULT NOW(),
  requirements TEXT[],
  benefits TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create user_job_matches table
CREATE TABLE user_job_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  job_id UUID REFERENCES scraped_jobs(id),
  match_score FLOAT DEFAULT 0,
  status TEXT DEFAULT 'pending',
  matched_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_scraped_jobs_platform ON scraped_jobs(platform);
CREATE INDEX idx_scraped_jobs_scraped_at ON scraped_jobs(scraped_at);
CREATE INDEX idx_user_job_matches_user_id ON user_job_matches(user_id);
CREATE INDEX idx_user_job_matches_status ON user_job_matches(status);

-- Enable RLS
ALTER TABLE scraped_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_job_matches ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Anyone can read scraped jobs" ON scraped_jobs FOR SELECT USING (true);
CREATE POLICY "Users can read their job matches" ON user_job_matches FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their job matches" ON user_job_matches FOR UPDATE USING (auth.uid() = user_id);