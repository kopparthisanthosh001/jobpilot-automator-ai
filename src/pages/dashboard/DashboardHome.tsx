import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Link } from "react-router-dom";
import { 
  Upload, 
  Settings, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Zap,
  ArrowRight,
  FileText,
  Target
} from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

const DashboardHome = () => {
  const [autoApplyEnabled, setAutoApplyEnabled] = useState(false);
  const [resumeUploaded] = useState(false); // This would come from your app state
  
  // Mock user data - replace with actual user state/context
  const user = {
    email: "user@example.com",
    job_title: "Product Manager"
  };

  const handleConfigureAutoApply = async () => {
    try {
      console.log("Sending request to:", "https://jobpilot-backend.onrender.com/start");
      console.log("Request body:", { email: user.email, job_role: user.job_title });
      
      const response = await fetch("https://jobpilot-backend.onrender.com/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: user.email,
          job_role: user.job_title,
        }),
      });

      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log("Response data:", data);
        toast({
          title: "✅ Jobs fetched successfully",
          description: "Auto apply has been configured for your profile.",
        });
      } else {
        const errorText = await response.text();
        console.error("Response error:", errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      toast({
        title: "❌ Configuration failed",
        description: `Error: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const stats = [
    {
      title: "Applications Sent",
      value: "12",
      change: "+3 today",
      icon: FileText,
      color: "text-primary"
    },
    {
      title: "Jobs Matched",
      value: "45",
      change: "+8 new",
      icon: Target,
      color: "text-secondary"
    },
    {
      title: "Response Rate",
      value: "23%",
      change: "+5% this week",
      icon: CheckCircle,
      color: "text-success"
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Welcome back! 👋</h1>
        <p className="text-muted-foreground text-lg">
          Here's what's happening with your job search automation
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="shadow-card border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                  <p className="text-sm text-success">{stat.change}</p>
                </div>
                <div className={`p-3 rounded-full bg-muted/30`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Status Cards */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Resume Status */}
        <Card className="shadow-card border-0">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Upload className="h-5 w-5" />
              <span>Resume Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3">
              {resumeUploaded ? (
                <>
                  <CheckCircle className="h-5 w-5 text-success" />
                  <span className="text-success font-medium">Resume uploaded successfully</span>
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-destructive" />
                  <span className="text-destructive font-medium">No resume uploaded</span>
                </>
              )}
            </div>
            
            {resumeUploaded ? (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Last updated: 2 days ago
                </p>
                <Link to="/dashboard/upload">
                  <Button variant="outline" size="sm">
                    Update Resume
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-muted-foreground">
                  Upload your resume to start receiving automatic job applications.
                </p>
                <Link to="/dashboard/upload">
                  <Button className="bg-gradient-primary hover:opacity-90">
                    Upload Resume <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Auto Apply Status */}
        <Card className="shadow-card border-0">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="h-5 w-5" />
              <span>Auto Apply Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">Automatic Applications</span>
              <Switch 
                checked={autoApplyEnabled}
                onCheckedChange={setAutoApplyEnabled}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Last job scrape: 2 hours ago
                </span>
              </div>
              
              {autoApplyEnabled ? (
                <Badge variant="outline" className="text-success border-success/20 bg-success/10">
                  <div className="w-2 h-2 bg-success rounded-full mr-2"></div>
                  Active - Checking every 2 hours
                </Badge>
              ) : (
                <Badge variant="outline" className="text-muted-foreground">
                  Inactive
                </Badge>
              )}
            </div>

            <Button variant="outline" size="sm" onClick={handleConfigureAutoApply}>
              Configure Auto Apply
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="shadow-card border-0">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <Link to="/dashboard/preferences">
              <Button variant="outline" className="w-full justify-start h-auto p-4">
                <div className="flex items-center space-x-3">
                  <Settings className="h-5 w-5" />
                  <div className="text-left">
                    <p className="font-medium">Set Job Preferences</p>
                    <p className="text-sm text-muted-foreground">
                      Configure your ideal job criteria
                    </p>
                  </div>
                </div>
              </Button>
            </Link>
            
            <Link to="/dashboard/applied">
              <Button variant="outline" className="w-full justify-start h-auto p-4">
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5" />
                  <div className="text-left">
                    <p className="font-medium">View Applied Jobs</p>
                    <p className="text-sm text-muted-foreground">
                      Track your application history
                    </p>
                  </div>
                </div>
              </Button>
            </Link>
            
            <Link to="/dashboard/analytics">
              <Button variant="outline" className="w-full justify-start h-auto p-4">
                <div className="flex items-center space-x-3">
                  <Target className="h-5 w-5" />
                  <div className="text-left">
                    <p className="font-medium">View Analytics</p>
                    <p className="text-sm text-muted-foreground">
                      See your job search performance
                    </p>
                  </div>
                </div>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardHome;