import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Search, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const TriggerScraping = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleTriggerScraping = async () => {
    setIsLoading(true);
    
    try {
      // Get the current user to ensure they're authenticated
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please log in to trigger job scraping.",
          variant: "destructive"
        });
        return;
      }

      // Call the edge function to trigger job scraping
      const { data, error } = await supabase.functions.invoke('scrape-jobs', {
        body: { user_id: user.id }
      });

      if (error) {
        console.error('Error triggering job scraping:', error);
        toast({
          title: "Error",
          description: "Failed to trigger job scraping. Please try again later.",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Job scraping triggered!",
        description: "We're now searching for new job matches. Check back in a few minutes.",
      });

    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Job Scraping</h1>
        <p className="text-muted-foreground mt-2">
          Trigger manual job scraping to find new opportunities
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Manual Job Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Click the button below to manually trigger job scraping. This will search for new jobs
            based on your profile preferences and create matches for you.
          </p>
          
          <Button 
            onClick={handleTriggerScraping}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Searching for Jobs...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Start Job Search
              </>
            )}
          </Button>

          <div className="mt-4 p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium mb-2">How it works:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Searches multiple job platforms based on your preferences</li>
              <li>• Analyzes job requirements against your skills</li>
              <li>• Creates personalized job matches with scores</li>
              <li>• Results appear in your "All Matches" section</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TriggerScraping;