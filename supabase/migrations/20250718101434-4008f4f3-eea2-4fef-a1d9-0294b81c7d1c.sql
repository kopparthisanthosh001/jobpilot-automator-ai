
-- Create profiles table to store user preferences for job matching
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  desired_role TEXT,
  experience_level TEXT,
  preferred_locations TEXT[],
  skills TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create scraped_jobs table (this should already exist from migration, but ensuring it's correct)
CREATE TABLE IF NOT EXISTS public.scraped_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT,
  description TEXT,
  salary_range TEXT,
  platform TEXT NOT NULL DEFAULT 'indeed',
  job_url TEXT NOT NULL,
  scraped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  requirements TEXT[],
  benefits TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_job_matches table (this should already exist from migration, but ensuring it's correct)
CREATE TABLE IF NOT EXISTS public.user_job_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id UUID REFERENCES public.scraped_jobs(id) ON DELETE CASCADE,
  match_score FLOAT DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'applied', 'rejected', 'interview')),
  matched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scraped_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_job_matches ENABLE ROW LEVEL SECURITY;

-- RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS policies for scraped_jobs (public read access)
CREATE POLICY "Anyone can view scraped jobs" ON public.scraped_jobs
  FOR SELECT USING (true);

-- RLS policies for user_job_matches
CREATE POLICY "Users can view their own job matches" ON public.user_job_matches
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own job matches" ON public.user_job_matches
  FOR UPDATE USING (auth.uid() = user_id);

-- Service role can insert job matches (for the scraping function)
CREATE POLICY "Service role can insert job matches" ON public.user_job_matches
  FOR INSERT WITH CHECK (true);

-- Service role can insert scraped jobs
CREATE POLICY "Service role can insert scraped jobs" ON public.scraped_jobs
  FOR INSERT WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_scraped_jobs_platform ON public.scraped_jobs(platform);
CREATE INDEX IF NOT EXISTS idx_scraped_jobs_scraped_at ON public.scraped_jobs(scraped_at);
CREATE INDEX IF NOT EXISTS idx_user_job_matches_user_id ON public.user_job_matches(user_id);
CREATE INDEX IF NOT EXISTS idx_user_job_matches_status ON public.user_job_matches(status);
CREATE INDEX IF NOT EXISTS idx_user_job_matches_job_id ON public.user_job_matches(job_id);

-- Function to automatically create user profile when auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.email
  );
  RETURN NEW;
END;
$$;

-- Trigger to automatically create profile for new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
