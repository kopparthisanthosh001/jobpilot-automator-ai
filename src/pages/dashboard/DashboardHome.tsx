
import { useState } from "react";
import { useUser, SessionContextProvider } from "@supabase/auth-helpers-react";
import { createClient } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { Upload, Settings, CheckCircle, XCircle, Clock, Zap, ArrowRight, FileText, Target } from "lucide-react";
import { Link } from "react-router-dom";

// Initialize Supabase
const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL || '',
  process.env.REACT_APP_SUPABASE_ANON_KEY || ''
);

const DashboardHome = () => {
  const user = useUser();
  const [autoApplyEnabled, setAutoApplyEnabled] = useState(false);
  const [resumeUploaded] = useState(false);

  const handleConfigureAutoApply = async () => {
    try {
      const response = await fetch("https://jobpilot-backend.onrender.com/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: user?.email,
          user_id: user?.id,
        }),
      });

      if (response.ok) {
        toast({
          title: "✅ Jobs fetched successfully",
          description: "Auto apply has been configured for your profile.",
        });
      } else {
        throw new Error("Failed to configure auto apply");
      }
    } catch (error) {
      toast({
        title: "❌ Configuration failed",
        description: "Please try again later.",
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
    <SessionContextProvider supabaseClient={supabase}>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Welcome back! 👋</h1>
          <p className="text-muted-foreground text-lg">
            Here's what's happening with your job search automation
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6">
          {stats.map((stat, index) => (
            <Card key={index}>
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

        {/* Resume Status */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
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
              <Link to="/dashboard/upload">
                <Button className="bg-gradient-primary hover:opacity-90">
                  {resumeUploaded ? "Update Resume" : "Upload Resume"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Auto Apply */}
          <Card>
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
                  <Badge variant="outline" className="text-muted-foreground">Inactive</Badge>
                )}
              </div>
              <Button variant="outline" size="sm" onClick={handleConfigureAutoApply}>
                Configure Auto Apply
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </SessionContextProvider>
  );
};

export default DashboardHome;
