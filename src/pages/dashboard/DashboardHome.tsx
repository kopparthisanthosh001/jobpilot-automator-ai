import { useUser } from "@supabase/auth-helpers-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import {
  Upload, Settings, CheckCircle, XCircle, Clock, Zap, Bell,
  ArrowRight, FileText, Target, TrendingUp, Calendar,
  PlusCircle, BarChart3, MessageSquare, ExternalLink,
  Filter, Search, MapPin, Briefcase, Star
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const DashboardHome = () => {
  const user = useUser();
  const [autoApplyEnabled, setAutoApplyEnabled] = useState(false);
  const [resumeUploaded] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [manualJobUrl, setManualJobUrl] = useState("");
  
  // Check if user is returning (has created account more than 24 hours ago)
  const isReturningUser = user?.created_at ? 
    new Date().getTime() - new Date(user.created_at).getTime() > 24 * 60 * 60 * 1000 : false;
  
  // Get user's first name from profile or fallback to email
  const userName = userProfile?.full_name?.split(' ')[0] || user?.user_metadata?.name || user?.email?.split('@')[0] || 'User';

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user?.id) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('full_name, email')
          .eq('user_id', user.id)
          .single();
        
        if (error) {
          console.error('Error fetching profile:', error);
          return;
        }
        
        setUserProfile(data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    fetchUserProfile();
  }, [user?.id]);

  const handleConfigureAutoApply = async () => {
    if (!user) {
      toast({
        title: "❌ User not found",
        description: "Please login again.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch("https://jobpilot-backend.onrender.com/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: user.email,
          job_role: user.user_metadata?.job_title || "Product Manager",
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

  const handleManualJobSubmit = () => {
    if (!manualJobUrl.trim()) {
      toast({
        title: "Please enter a job URL",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "✅ Job URL submitted",
      description: "We'll process this job and apply for you shortly.",
    });
    setManualJobUrl("");
  };

  const keyMetrics = [
    {
      title: "Applications Today",
      value: "42",
      subtitle: "Applied",
      icon: FileText,
      color: "text-primary",
      bgColor: "bg-primary/10",
      link: "/dashboard/applied"
    },
    {
      title: "Job Matches Found",
      value: "16",
      subtitle: "Matches",
      icon: Target,
      color: "text-secondary",
      bgColor: "bg-secondary/10",
      link: "/dashboard/matches"
    },
    {
      title: "Interviews Scheduled",
      value: "3",
      subtitle: "Interviews",
      icon: Calendar,
      color: "text-accent",
      bgColor: "bg-accent/10",
      link: "/dashboard/interviews"
    },
    {
      title: "Success Rate",
      value: "32%",
      subtitle: "Success",
      icon: TrendingUp,
      color: "text-success",
      bgColor: "bg-success/10",
      link: "/dashboard/analytics"
    },
  ];

  const recentApplications = [
    {
      date: "Jul 17",
      role: "Senior PM",
      company: "Flipkart",
      status: "applied",
      location: "Bangalore"
    },
    {
      date: "Jul 16",
      role: "Product Manager",
      company: "Xeno",
      status: "shortlisted",
      location: "Mumbai"
    },
    {
      date: "Jul 15",
      role: "Senior Product Manager",
      company: "Unacademy",
      status: "rejected",
      location: "Bangalore"
    },
    {
      date: "Jul 14",
      role: "PM - Growth",
      company: "Razorpay",
      status: "applied",
      location: "Bangalore"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'applied': return 'text-primary bg-primary/10';
      case 'shortlisted': return 'text-success bg-success/10';
      case 'rejected': return 'text-destructive bg-destructive/10';
      default: return 'text-muted-foreground bg-muted/10';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'applied': return <Clock className="h-3 w-3" />;
      case 'shortlisted': return <CheckCircle className="h-3 w-3" />;
      case 'rejected': return <XCircle className="h-3 w-3" />;
      default: return <Clock className="h-3 w-3" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="font-bold text-xl text-primary">JobPilot.ai</div>
              <div className="hidden md:flex items-center space-x-2 text-sm text-muted-foreground">
                <span>•</span>
                <span>AI-Powered Job Automation</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-accent rounded-full"></span>
              </Button>
              
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-primary">
                    {userName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium">{userName}</p>
                  <p className="text-xs text-muted-foreground">Premium Plan</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-8">
        {/* Welcome Section */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">
            {isReturningUser ? `Welcome back, ${userName}` : `Welcome, ${userName}`} 👋
          </h1>
          <p className="text-muted-foreground text-lg">
            Here's your job search automation dashboard
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {keyMetrics.map((metric, index) => (
            <Link key={index} to={metric.link} className="group">
              <Card className="shadow-card border-0 hover:shadow-glow transition-all duration-200 group-hover:scale-105">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                      <metric.icon className={`h-4 w-4 ${metric.color}`} />
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold">{metric.value}</p>
                    <p className="text-sm text-muted-foreground">{metric.title}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Resume & Auto Apply */}
          <div className="lg:col-span-2 space-y-6">
            {/* Resume Status */}
            <Card className="shadow-card border-0">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Upload className="h-5 w-5" />
                  <span>Resume & Preferences</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {resumeUploaded ? (
                      <CheckCircle className="h-5 w-5 text-success" />
                    ) : (
                      <XCircle className="h-5 w-5 text-destructive" />
                    )}
                    <div>
                      <p className="font-medium">
                        {resumeUploaded ? "Resume uploaded" : "No resume uploaded"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {resumeUploaded ? "Last updated 2 days ago" : "Upload your resume to get started"}
                      </p>
                    </div>
                  </div>
                  <Link to="/dashboard/profile-setup">
                    <Button variant="outline" size="sm">
                      {resumeUploaded ? "Update" : "Upload"}
                    </Button>
                  </Link>
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Zap className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Auto Apply</p>
                      <p className="text-sm text-muted-foreground">
                        {autoApplyEnabled ? "Active - Checking every 2 hours" : "Inactive"}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={autoApplyEnabled}
                    onCheckedChange={setAutoApplyEnabled}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Application History */}
            <Card className="shadow-card border-0">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5" />
                    <span>Recent Applications</span>
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      <Filter className="h-4 w-4" />
                    </Button>
                    <Link to="/dashboard/applied">
                      <Button variant="outline" size="sm">
                        View All
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentApplications.map((app, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="text-sm font-medium text-muted-foreground">
                          {app.date}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{app.role}</p>
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <Briefcase className="h-3 w-3" />
                            <span>{app.company}</span>
                            <span>•</span>
                            <MapPin className="h-3 w-3" />
                            <span>{app.location}</span>
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline" className={`${getStatusColor(app.status)} border-0`}>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(app.status)}
                          <span className="capitalize">{app.status}</span>
                        </div>
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Manual Upload & Insights */}
          <div className="space-y-6">
            {/* Manual Job Upload */}
            <Card className="shadow-card border-0">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <PlusCircle className="h-5 w-5" />
                  <span>Manual Job Upload</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Found a job we missed? Paste the link and we'll apply for you.
                </p>
                <div className="space-y-3">
                  <Input
                    placeholder="Paste job URL here..."
                    value={manualJobUrl}
                    onChange={(e) => setManualJobUrl(e.target.value)}
                  />
                  <Button 
                    onClick={handleManualJobSubmit}
                    className="w-full bg-gradient-primary hover:opacity-90"
                  >
                    Submit Job <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Insights */}
            <Card className="shadow-card border-0">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Quick Insights</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Top Company</span>
                    <span className="font-medium">Flipkart</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Best Response Day</span>
                    <span className="font-medium">Tuesday</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Most Matched Skill</span>
                    <span className="font-medium">Product Strategy</span>
                  </div>
                </div>
                <Link to="/dashboard/analytics">
                  <Button variant="outline" className="w-full">
                    View Full Analytics
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* AI Assistant */}
            <Card className="shadow-card border-0 bg-gradient-hero">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <MessageSquare className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">JobPilot AI Assistant</h3>
                    <p className="text-sm text-muted-foreground">Get personalized job advice</p>
                  </div>
                </div>
                <Button className="w-full bg-gradient-primary hover:opacity-90">
                  Ask JobPilot AI
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom CTA Bar - Sticky on Mobile */}
        <div className="sticky bottom-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t md:relative md:bg-transparent md:border-0">
          <div className="p-4 md:p-0">
            <div className="grid grid-cols-3 md:grid-cols-3 gap-3">
              <Link to="/dashboard/profile-setup">
                <Button variant="outline" className="w-full">
                  <Upload className="h-4 w-4 mr-2" />
                  <span className="hidden md:inline">Update Resume</span>
                  <span className="md:hidden">Resume</span>
                </Button>
              </Link>
              <Link to="/dashboard/matches">
                <Button variant="outline" className="w-full">
                  <Target className="h-4 w-4 mr-2" />
                  <span className="hidden md:inline">Check Matches</span>
                  <span className="md:hidden">Matches</span>
                </Button>
              </Link>
              <Button 
                onClick={handleConfigureAutoApply}
                className="w-full bg-gradient-primary hover:opacity-90"
              >
                <Zap className="h-4 w-4 mr-2" />
                <span className="hidden md:inline">Apply to All</span>
                <span className="md:hidden">Auto Apply</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t pt-8 mt-16">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <Link to="/about" className="hover:text-primary transition-colors">About</Link>
              <Link to="/contact" className="hover:text-primary transition-colors">Contact</Link>
              <Link to="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
              <Link to="/terms" className="hover:text-primary transition-colors">Terms</Link>
            </div>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <span>© 2024 JobPilot.ai</span>
              <span>•</span>
              <span>Powered by AI</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default DashboardHome;
