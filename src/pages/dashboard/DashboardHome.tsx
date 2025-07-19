
import { useUser } from "@supabase/auth-helpers-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import {
  Upload, Settings, CheckCircle, XCircle, Clock, Zap, Bell,
  ArrowRight, FileText, Target, TrendingUp, Calendar,
  PlusCircle, BarChart3, MessageSquare, ExternalLink,
  Filter, Search, MapPin, Briefcase, Star, Lightbulb
} from "lucide-react";
import { ATSScoreCard } from "@/components/ATSScoreCard";
import { ResumeOptimizationPanel } from "@/components/ResumeOptimizationPanel";
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const DashboardHome = () => {
  const user = useUser();
  const navigate = useNavigate();
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
      title: "New Jobs Today",
      value: "16",
      subtitle: "Fresh Matches",
      icon: Target,
      color: "text-primary",
      bgColor: "bg-primary/10",
      link: "/dashboard/matches"
    },
    {
      title: "High ATS Score",
      value: "12",
      subtitle: "80%+ Match",
      icon: TrendingUp,
      color: "text-success",
      bgColor: "bg-success/10",
      link: "/dashboard/matches"
    },
    {
      title: "Profile Score",
      value: "73%",
      subtitle: "ATS Ready",
      icon: FileText,
      color: "text-secondary",
      bgColor: "bg-secondary/10",
      link: "/dashboard/profile-setup"
    },
    {
      title: "Skill Matches",
      value: "8/10",
      subtitle: "Top Skills",
      icon: Star,
      color: "text-accent",
      bgColor: "bg-accent/10",
      link: "/dashboard/profile-setup"
    },
  ];

  const recentJobMatches = [
    {
      date: "Jul 17",
      role: "Senior PM",
      company: "Flipkart",
      atsScore: 87,
      location: "Bangalore",
      matchedSkills: ["Product Strategy", "Analytics", "Leadership"],
      missingSkills: ["Machine Learning"]
    },
    {
      date: "Jul 16", 
      role: "Product Manager",
      company: "Xeno",
      atsScore: 92,
      location: "Mumbai",
      matchedSkills: ["Product Management", "Data Analysis", "Agile"],
      missingSkills: []
    },
    {
      date: "Jul 15",
      role: "Senior Product Manager", 
      company: "Unacademy",
      atsScore: 65,
      location: "Bangalore",
      matchedSkills: ["Product Strategy", "Team Management"],
      missingSkills: ["EdTech Experience", "Mobile Apps"]
    },
    {
      date: "Jul 14",
      role: "PM - Growth",
      company: "Razorpay",
      atsScore: 78,
      location: "Bangalore",
      matchedSkills: ["Growth Hacking", "Analytics", "Product Strategy"],
      missingSkills: ["FinTech Experience"]
    }
  ];

  const getATSScoreColor = (score: number) => {
    if (score >= 80) return 'text-success bg-success/10';
    if (score >= 60) return 'text-warning bg-warning/10';
    return 'text-destructive bg-destructive/10';
  };

  const getATSScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="h-3 w-3" />;
    if (score >= 60) return <TrendingUp className="h-3 w-3" />;
    return <XCircle className="h-3 w-3" />;
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
          {/* Left Column - Resume Optimization & Job Matches */}
          <div className="lg:col-span-2 space-y-6">
            {/* HIGHLIGHTED Resume Optimization Panel */}
            <div className="relative">
              {/* Glow Effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/50 to-secondary/50 rounded-lg blur opacity-75"></div>
              <div className="relative">
                <ResumeOptimizationPanel
                  currentScore={73}
                  potentialScore={89}
                  suggestions={{
                    addSkills: ["Machine Learning", "Data Science", "Python"],
                    addKeywords: ["Product Analytics", "User Research", "A/B Testing"],
                    improveSections: ["Add quantified achievements", "Include relevant certifications", "Optimize job titles"]
                  }}
                  onOptimizeResume={() => {
                    navigate('/dashboard/ats-optimizer');
                  }}
                  onUpdateProfile={() => {
                    navigate('/dashboard/profile-setup');
                  }}
                />
              </div>
            </div>

            {/* Recent Job Matches with ATS Scores */}
            <Card className="shadow-card border-0">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="h-5 w-5" />
                    <span>Recent Job Matches</span>
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      <Filter className="h-4 w-4" />
                    </Button>
                    <Link to="/dashboard/matches">
                      <Button variant="outline" size="sm">
                        View All
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentJobMatches.map((job, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="text-sm font-medium text-muted-foreground">
                          {job.date}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{job.role}</p>
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <Briefcase className="h-3 w-3" />
                            <span>{job.company}</span>
                            <span>•</span>
                            <MapPin className="h-3 w-3" />
                            <span>{job.location}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className={`${getATSScoreColor(job.atsScore)} border-0`}>
                          <div className="flex items-center space-x-1">
                            {getATSScoreIcon(job.atsScore)}
                            <span>{job.atsScore}% ATS</span>
                          </div>
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Other Features */}
          <div className="space-y-6">

            {/* Manual Job Upload */}
            <Card className="shadow-card border-0">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <PlusCircle className="h-5 w-5" />
                  <span>Manual Job Analysis</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Found an interesting job? Get instant ATS score analysis.
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
                    Analyze Job <Target className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* AI Assistant */}
            <Card className="shadow-card border-0 bg-gradient-hero">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Lightbulb className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">JobPilot AI Assistant</h3>
                    <p className="text-sm text-muted-foreground">Get ATS optimization tips</p>
                  </div>
                </div>
                <Button className="w-full bg-gradient-primary hover:opacity-90">
                  Get ATS Tips
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
                  <Target className="mr-2 h-4 w-4" />
                  Optimize ATS
                </Button>
              </Link>
              
              <Link to="/dashboard/matches">
                <Button className="w-full bg-gradient-primary hover:opacity-90">
                  <Search className="mr-2 h-4 w-4" />
                  Browse Jobs
                </Button>
              </Link>
              
              <Button 
                variant="outline" 
                onClick={handleConfigureAutoApply}
                className="w-full"
              >
                <Lightbulb className="mr-2 h-4 w-4" />
                Get Tips
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
