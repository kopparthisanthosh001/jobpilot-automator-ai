-- Update old scraped jobs with 'company-website' platform to be LinkedIn or Naukri
-- This will randomly assign them to either platform to maintain data integrity
UPDATE scraped_jobs 
SET platform = CASE 
  WHEN random() < 0.5 THEN 'linkedin'
  ELSE 'naukri'
END
WHERE platform = 'company-website';