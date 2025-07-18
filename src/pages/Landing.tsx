import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { 
  Bot, 
  Upload, 
  Settings, 
  Zap, 
  Shield, 
  BarChart3, 
  Clock, 
  CheckCircle,
  Star,
  ArrowRight
} from "lucide-react";
// import heroImage from "@/assets/hero-automation.jpg";

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bot className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Jobpilot.ai
              </span>
            </div>
            
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#home" className="text-foreground hover:text-primary transition-colors">Home</a>
              <a href="#how-it-works" className="text-foreground hover:text-primary transition-colors">How it Works</a>
              <a href="#pricing" className="text-foreground hover:text-primary transition-colors">Pricing</a>
              <Link to="/auth" className="text-foreground hover:text-primary transition-colors">Login</Link>
            </nav>
            
            <Link to="/auth">
              <Button className="bg-gradient-primary hover:opacity-90 shadow-soft">
                Sign Up <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="home" className="py-20 bg-gradient-hero">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <Badge variant="outline" className="w-fit">
                <Zap className="h-4 w-4 mr-2" />
                Automated Job Applications
              </Badge>
              
              <div className="space-y-4">
                <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                  Let Your Resume Work{" "}
                  <span className="bg-gradient-primary bg-clip-text text-transparent">
                    While You Sleep
                  </span>
                </h1>
                
                <p className="text-xl text-muted-foreground max-w-lg">
                  Upload your resume once. We'll find relevant jobs and auto-apply every 2 hours.
                  Perfect for Product, Strategy, and Business roles in India.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/auth">
                  <Button size="lg" className="bg-gradient-primary hover:opacity-90 shadow-soft text-lg px-8">
                    Get Started for Free
                  </Button>
                </Link>
                <Button variant="outline" size="lg" className="text-lg px-8">
                  Watch Demo
                </Button>
              </div>
              
              <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2 text-success" />
                  No credit card required
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2 text-success" />
                  100% secure & private
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="w-full h-96 rounded-2xl shadow-glow bg-gradient-primary/20 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <Bot className="h-24 w-24 text-primary mx-auto" />
                  <p className="text-lg text-muted-foreground">Job Automation Dashboard</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How Jobpilot.ai Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Get started in 3 simple steps and let automation handle your job applications
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center p-8 shadow-card border-0 bg-gradient-card">
              <CardContent className="space-y-4">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <Upload className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold">1. Upload Resume</h3>
                <p className="text-muted-foreground">
                  Upload your resume once. Our AI analyzes your skills and experience to understand your profile.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center p-8 shadow-card border-0 bg-gradient-card">
              <CardContent className="space-y-4">
                <div className="mx-auto w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center">
                  <Settings className="h-8 w-8 text-secondary" />
                </div>
                <h3 className="text-2xl font-semibold">2. Set Preferences</h3>
                <p className="text-muted-foreground">
                  Choose your preferred roles, locations, and companies. Set your job search criteria once.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center p-8 shadow-card border-0 bg-gradient-card">
              <CardContent className="space-y-4">
                <div className="mx-auto w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center">
                  <Bot className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-2xl font-semibold">3. We Apply for You</h3>
                <p className="text-muted-foreground">
                  Our automation finds and applies to relevant jobs every 2 hours. Track everything in your dashboard.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Powerful Features</h2>
            <p className="text-xl text-muted-foreground">
              Everything you need to automate your job search effectively
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 shadow-card border-0">
              <CardContent className="space-y-3">
                <Zap className="h-10 w-10 text-primary" />
                <h3 className="text-xl font-semibold">Auto Apply Toggle</h3>
                <p className="text-muted-foreground text-sm">
                  Turn automation on/off anytime. Full control over your job applications.
                </p>
              </CardContent>
            </Card>
            
            <Card className="p-6 shadow-card border-0">
              <CardContent className="space-y-3">
                <Bot className="h-10 w-10 text-secondary" />
                <h3 className="text-xl font-semibold">Smart Job Matching</h3>
                <p className="text-muted-foreground text-sm">
                  AI-powered matching finds jobs that align with your skills and preferences.
                </p>
              </CardContent>
            </Card>
            
            <Card className="p-6 shadow-card border-0">
              <CardContent className="space-y-3">
                <BarChart3 className="h-10 w-10 text-accent" />
                <h3 className="text-xl font-semibold">Real-Time Dashboard</h3>
                <p className="text-muted-foreground text-sm">
                  Track applications, response rates, and manage your job search analytics.
                </p>
              </CardContent>
            </Card>
            
            <Card className="p-6 shadow-card border-0">
              <CardContent className="space-y-3">
                <Shield className="h-10 w-10 text-success" />
                <h3 className="text-xl font-semibold">Private & Secure</h3>
                <p className="text-muted-foreground text-sm">
                  Your data is encrypted and secure. We never share your information.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">What Our Users Say</h2>
            <p className="text-xl text-muted-foreground">
              Join thousands of professionals who automated their job search
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 shadow-card border-0">
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                  ))}
                </div>
                <p className="text-muted-foreground">
                  "Jobpilot.ai got me 3 interviews in the first week. The automation is incredible and saved me hours of manual applications."
                </p>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="font-semibold text-primary">RK</span>
                  </div>
                  <div>
                    <p className="font-semibold">Rahul Kumar</p>
                    <p className="text-sm text-muted-foreground">Product Manager at Flipkart</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="p-8 shadow-card border-0">
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                  ))}
                </div>
                <p className="text-muted-foreground">
                  "Finally landed my dream job at a startup! The smart matching found opportunities I would have never discovered myself."
                </p>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center">
                    <span className="font-semibold text-secondary">PS</span>
                  </div>
                  <div>
                    <p className="font-semibold">Priya Sharma</p>
                    <p className="text-sm text-muted-foreground">Strategy Consultant</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="p-8 shadow-card border-0">
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                  ))}
                </div>
                <p className="text-muted-foreground">
                  "The dashboard gives me complete visibility into my job search. I can see exactly what's working and optimize accordingly."
                </p>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                    <span className="font-semibold text-accent">AM</span>
                  </div>
                  <div>
                    <p className="font-semibold">Arjun Mehta</p>
                    <p className="text-sm text-muted-foreground">Business Analyst</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Bot className="h-6 w-6" />
                <span className="text-xl font-bold">Jobpilot.ai</span>
              </div>
              <p className="text-background/70">
                Automate your job search with AI-powered applications for Indian professionals.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <div className="space-y-2 text-background/70">
                <a href="#how-it-works" className="block hover:text-background transition-colors">How it Works</a>
                <a href="#pricing" className="block hover:text-background transition-colors">Pricing</a>
                <Link to="/auth" className="block hover:text-background transition-colors">Get Started</Link>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <div className="space-y-2 text-background/70">
                <a href="#" className="block hover:text-background transition-colors">About</a>
                <a href="#" className="block hover:text-background transition-colors">Contact</a>
                <a href="#" className="block hover:text-background transition-colors">Careers</a>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <div className="space-y-2 text-background/70">
                <a href="#" className="block hover:text-background transition-colors">Privacy Policy</a>
                <a href="#" className="block hover:text-background transition-colors">Terms of Service</a>
                <a href="#" className="block hover:text-background transition-colors">Data Security</a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-background/20 mt-8 pt-8 text-center text-background/70">
            <p>&copy; 2024 Jobpilot.ai. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;