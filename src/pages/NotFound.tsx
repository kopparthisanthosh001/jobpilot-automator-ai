import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Bot, Home, Search, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-6">
      <div className="w-full max-w-2xl text-center">
        <Card className="shadow-glow border-0 bg-background/95 backdrop-blur p-8">
          <CardContent className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-2 mb-6">
                <Bot className="h-12 w-12 text-primary" />
                <span className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  Jobpilot.ai
                </span>
              </div>
              
              <div className="relative">
                <h1 className="text-8xl font-bold text-primary/20">404</h1>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Search className="h-16 w-16 text-primary/40" />
                </div>
              </div>
              
              <div className="space-y-2">
                <h2 className="text-3xl font-bold">Oops, lost in the job hunt?</h2>
                <p className="text-xl text-muted-foreground max-w-md mx-auto">
                  The page you're looking for doesn't exist. Let's get you back on track 
                  to finding your dream job!
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/dashboard">
                <Button size="lg" className="bg-gradient-primary hover:opacity-90 shadow-soft">
                  <Home className="mr-2 h-5 w-5" />
                  Back to Dashboard
                </Button>
              </Link>
              
              <Link to="/">
                <Button variant="outline" size="lg">
                  <ArrowLeft className="mr-2 h-5 w-5" />
                  Back to Home
                </Button>
              </Link>
            </div>

            <div className="pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground">
                If you think this is a mistake, please{" "}
                <Button variant="link" className="p-0 h-auto text-primary">
                  contact support
                </Button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NotFound;
