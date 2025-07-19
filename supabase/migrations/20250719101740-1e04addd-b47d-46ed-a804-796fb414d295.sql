-- Enable RLS on tables that don't have it enabled
ALTER TABLE public.preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for preferences table
CREATE POLICY "Users can view their own preferences" 
ON public.preferences 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences" 
ON public.preferences 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" 
ON public.preferences 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own preferences" 
ON public.preferences 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for resumes table
CREATE POLICY "Users can view their own resumes" 
ON public.resumes 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own resumes" 
ON public.resumes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own resumes" 
ON public.resumes 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own resumes" 
ON public.resumes 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for users table (this appears to be a custom users table, not auth.users)
-- Since this seems to be a legacy table that might conflict with auth.users, 
-- we'll add basic policies but recommend migrating to profiles table
CREATE POLICY "Users can view their own user record" 
ON public.users 
FOR SELECT 
USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update their own user record" 
ON public.users 
FOR UPDATE 
USING (auth.uid()::text = id::text);