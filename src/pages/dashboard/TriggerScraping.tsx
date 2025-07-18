
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Search, RefreshCw, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const TriggerScraping = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication status on component mount
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth error:', error);
          toast({
            title: "Authentication Error",
            description: "Failed to check authentication status.",
            variant: "destructive"
          });
          return;
        }

        if (session?.user) {
          setUser(session.user);
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          toast({
            title: "Authentication Required",
            description: "Please log in to access job scraping features.",
            variant: "destructive"
          });
          // Redirect to auth page after a short delay
          setTimeout(() => {
            navigate('/auth');
          }, 2000);
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
        toast({
          title: "Error",
          description: "Failed to verify authentication status.",
          variant: "destructive"
        });
      }
    };

    checkAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
        if (event === 'SIGNED_OUT') {
          navigate('/auth');
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [toast, navigate]);

  const handleTriggerScraping = async () => {
    if (!isAuthenticated || !user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to trigger job scraping.",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('Triggering job scraping for user:', user.id);

      // Call the edge function to trigger job scraping
      const { data, error } = await supabase.functions.invoke('scrape-jobs', {
        body: { user_id: user.id }
      });

      if (error) {
        console.error('Error triggering job scraping:', error);
        
        // Provide more specific error messages
        if (error.message?.includes('unauthorized') || error.message?.includes('auth')) {
          toast({
            title: "Authorization Error",
            description: "Your session has expired. Please log in again.",
            variant: "destructive"
          });
          navigate('/auth');
        } else {
          toast({
            title: "Error",
            description: `Failed to trigger job scraping: ${error.message || 'Unknown error'}`,
            variant: "destructive"
          });
        }
        return;
      }

      console.log('Job scraping response:', data);

      toast({
        title: "Job scraping triggered!",
        description: "We're now searching for new job matches. Check back in a few minutes.",
      });

    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Error",
        description: `An unexpected error occurred: ${error.message || 'Please try again.'}`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </div>
    );
  }

  // Show authentication required message
  if (!isAuthenticated) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Job Scraping</h1>
          <p className="text-muted-foreground mt-2">
            Trigger manual job scraping to find new opportunities
          </p>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="w-12 h-12 text-destructive mb-4" />
            <h3 className="text-lg font-semibold mb-2">Authentication Required</h3>
            <p className="text-muted-foreground text-center mb-4">
              You need to be logged in to access job scraping features.
            </p>
            <Button onClick={() => navigate('/auth')}>
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
            disabled={isLoading || !isAuthenticated}
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

          {user && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                ✓ Authenticated as: {user.email}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TriggerScraping;
