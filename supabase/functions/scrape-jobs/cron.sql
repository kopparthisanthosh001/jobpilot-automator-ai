-- Schedule the job scraping function to run every 2 hours
SELECT
  cron.schedule(
    'scrape-jobs-every-2-hours',
    '0 */2 * * *',
    $$
    SELECT
      net.http_post(
          url:='https://your-project-ref.supabase.co/functions/v1/scrape-jobs',
          headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
      ) as request_id;
    $$
  );