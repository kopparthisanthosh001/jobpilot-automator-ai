import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { 
  FileText, 
  Upload, 
  Search, 
  Settings, 
  AlertTriangle,
  Telescope
} from "lucide-react";

export const NoResumeUploaded = () => (
  <Card className="shadow-card border-0 max-w-md mx-auto">
    <CardContent className="p-8 text-center space-y-6">
      <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
        <div className="relative">
          <FileText className="h-8 w-8 text-muted-foreground" />
          <AlertTriangle className="h-5 w-5 text-destructive absolute -top-1 -right-1" />
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-xl font-semibold">We need your resume to get started</h3>
        <p className="text-muted-foreground">
          Upload your resume so we can start finding and applying to relevant jobs for you.
        </p>
      </div>
      
      <Link to="/dashboard/upload">
        <Button className="bg-gradient-primary hover:opacity-90 shadow-soft">
          <Upload className="mr-2 h-4 w-4" />
          Upload Now
        </Button>
      </Link>
    </CardContent>
  </Card>
);

export const NoJobsFound = () => (
  <Card className="shadow-card border-0 max-w-md mx-auto">
    <CardContent className="p-8 text-center space-y-6">
      <div className="mx-auto w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center">
        <Telescope className="h-8 w-8 text-accent" />
      </div>
      
      <div className="space-y-2">
        <h3 className="text-xl font-semibold">No matches found yet</h3>
        <p className="text-muted-foreground">
          We're still looking for jobs that match your criteria. Try updating your preferences for better results.
        </p>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link to="/dashboard/preferences">
          <Button className="bg-gradient-primary hover:opacity-90">
            <Settings className="mr-2 h-4 w-4" />
            Update Preferences
          </Button>
        </Link>
        <Button variant="outline">
          <Search className="mr-2 h-4 w-4" />
          Search Manually
        </Button>
      </div>
    </CardContent>
  </Card>
);

export const NoApplications = () => (
  <Card className="shadow-card border-0 max-w-md mx-auto">
    <CardContent className="p-8 text-center space-y-6">
      <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
        <FileText className="h-8 w-8 text-primary" />
      </div>
      
      <div className="space-y-2">
        <h3 className="text-xl font-semibold">No applications sent yet</h3>
        <p className="text-muted-foreground">
          Once we start applying to jobs for you, you'll see them here with detailed tracking information.
        </p>
      </div>
      
      <div className="text-sm text-muted-foreground space-y-1">
        <p>Make sure you have:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Uploaded your resume</li>
          <li>Set your job preferences</li>
          <li>Enabled auto-apply</li>
        </ul>
      </div>
    </CardContent>
  </Card>
);