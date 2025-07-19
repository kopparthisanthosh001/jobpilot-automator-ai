-- Enable RLS on applied_jobs table that was missed
ALTER TABLE public.applied_jobs ENABLE ROW LEVEL SECURITY;

-- Add missing policies for applied_jobs table
CREATE POLICY "Users can insert their own job applications" 
ON public.applied_jobs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own job applications" 
ON public.applied_jobs 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own job applications" 
ON public.applied_jobs 
FOR DELETE 
USING (auth.uid() = user_id);