import { supabase } from "@/integrations/supabase/client";

export const triggerJobScraping = async () => {
  try {
    const { data, error } = await supabase.functions.invoke('scrape-jobs');
    
    if (error) throw error;
    
    console.log('Job scraping triggered successfully:', data);
    return data;
  } catch (error) {
    console.error('Error triggering job scraping:', error);
    throw error;
  }
};