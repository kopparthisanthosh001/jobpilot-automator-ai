import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot, Zap, Target, Shield, ArrowRight, CheckCircle, Users, TrendingUp, Clock } from "lucide-react";
import { useAuthSession } from "@/hooks/useAuthSession";

const Landing = () => {
  const { isAuthenticated, clearSessionAndSignUp } = useAuthSession();

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <header className="border-b border-border/5 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bot className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Jobpilot.ai
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard">
                    <Button variant="ghost">Dashboard</Button>
                  </Link>
                  <Button 
                    onClick={clearSessionAndSignUp}
                    variant="outline"
                  >
                    Sign Up New Account
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/auth">
                    <Button variant="ghost">Login</Button>
                  </Link>
                  <Link to="/auth">
                    <Button className="bg-gradient-primary hover:opacity-90 shadow-soft">
                      Start Free
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center space-y-8 max-w-4xl mx-auto">
          <Badge variant="secondary" className="text-sm px-4 py-2">
            🚀 Automate Your Job Search with AI
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-bold leading-tight">
            Get Your Dream Job on{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Autopilot
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Upload your resume once. Set your preferences. Let our AI apply to hundreds of relevant jobs every day while you sleep.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard">
                  <Button size="lg" className="bg-gradient-primary hover:opacity-90 shadow-soft text-lg px-8 py-6">
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Button 
                  size="lg" 
                  variant="outline" 
                  onClick={clearSessionAndSignUp}
                  className="text-lg px-8 py-6"
                >
                  Create New Account
                </Button>
              </>
            ) : (
              <>
                <Link to="/auth">
                  <Button size="lg" className="bg-gradient-primary hover:opacity-90 shadow-soft text-lg px-8 py-6">
                    Start Free Trial
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                    Login
                  </Button>
                </Link>
              </>
            )}
          </div>
          
          <div className="flex items-center justify-center space-x-6 text-sm text-muted-foreground pt-4">
            <div className="flex items-center space-x-1">
              <CheckCircle className="h-4 w-4 text-primary" />
              <span>Free 7-day trial</span>
            </div>
            <div className="flex items-center space-x-1">
              <CheckCircle className="h-4 w-4 text-primary" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center space-x-1">
              <CheckCircle className="h-4 w-4 text-primary" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <Card className="shadow-glow border-0 bg-background/95 backdrop-blur">
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <Zap className="h-6 w-6 text-primary" />
                <h3 className="text-lg font-semibold">AI-Powered Applications</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Our AI automatically fills out job applications with optimized details from your resume.
              </p>
            </CardContent>
          </Card>

          {/* Feature 2 */}
          <Card className="shadow-glow border-0 bg-background/95 backdrop-blur">
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <Target className="h-6 w-6 text-secondary" />
                <h3 className="text-lg font-semibold">Targeted Job Matching</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                We match you with jobs that fit your skills and preferences, increasing your chances of success.
              </p>
            </CardContent>
          </Card>

          {/* Feature 3 */}
          <Card className="shadow-glow border-0 bg-background/95 backdrop-blur">
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <Shield className="h-6 w-6 text-accent" />
                <h3 className="text-lg font-semibold">ATS Optimization</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                We ensure your resume is ATS-friendly, so you never get filtered out by automated systems.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-secondary/10 py-16">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-8">Jobpilot.ai in Numbers</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Stat 1 */}
            <div>
              <span className="text-5xl font-bold text-primary">500+</span>
              <p className="text-muted-foreground">Jobs Applied Daily</p>
            </div>

            {/* Stat 2 */}
            <div>
              <span className="text-5xl font-bold text-secondary">200+</span>
              <p className="text-muted-foreground">Happy Users</p>
            </div>

            {/* Stat 3 */}
            <div>
              <span className="text-5xl font-bold text-accent">4x</span>
              <p className="text-muted-foreground">Faster Applications</p>
            </div>

            {/* Stat 4 */}
            <div>
              <span className="text-5xl font-bold text-primary">95%</span>
              <p className="text-muted-foreground">ATS Pass Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="container mx-auto px-6 py-16">
        <div className="text-center space-y-8 max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold">How It Works</h2>
          <p className="text-xl text-muted-foreground">
            Automate your job search in 3 simple steps.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <Card className="shadow-glow border-0 bg-background/95 backdrop-blur">
              <CardContent className="space-y-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mx-auto">
                  <span className="text-2xl font-bold">1</span>
                </div>
                <h3 className="text-lg font-semibold text-center">Upload Your Resume</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Upload your resume and let our AI analyze it.
                </p>
              </CardContent>
            </Card>

            {/* Step 2 */}
            <Card className="shadow-glow border-0 bg-background/95 backdrop-blur">
              <CardContent className="space-y-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-secondary/10 text-secondary mx-auto">
                  <span className="text-2xl font-bold">2</span>
                </div>
                <h3 className="text-lg font-semibold text-center">Set Your Preferences</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Define your ideal job roles, locations, and companies.
                </p>
              </CardContent>
            </Card>

            {/* Step 3 */}
            <Card className="shadow-glow border-0 bg-background/95 backdrop-blur">
              <CardContent className="space-y-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-accent/10 text-accent mx-auto">
                  <span className="text-2xl font-bold">3</span>
                </div>
                <h3 className="text-lg font-semibold text-center">AI Auto-Applies</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Our AI applies to jobs for you every 2 hours, 24/7.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="bg-gradient-to-br from-gray-100 to-gray-200 py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-12">Pricing</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <Card className="shadow-glow border-0 bg-background/95 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-2xl font-semibold">Free</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Get started with basic automation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-5xl font-bold">$0<span className="text-sm text-muted-foreground">/month</span></div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center space-x-2"><CheckCircle className="h-4 w-4 text-primary" /><span>5 Applications Daily</span></li>
                  <li className="flex items-center space-x-2"><CheckCircle className="h-4 w-4 text-primary" /><span>Basic Resume Analysis</span></li>
                  <li className="flex items-center space-x-2"><Clock className="h-4 w-4 text-muted-foreground" /><span>Limited Support</span></li>
                </ul>
                <Button className="w-full bg-gradient-primary hover:opacity-90 shadow-soft">Get Started</Button>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="shadow-glow border-0 bg-background/95 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-2xl font-semibold">Pro</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Unlock full automation and optimization
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-5xl font-bold">$49<span className="text-sm text-muted-foreground">/month</span></div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center space-x-2"><CheckCircle className="h-4 w-4 text-primary" /><span>Unlimited Applications</span></li>
                  <li className="flex items-center space-x-2"><CheckCircle className="h-4 w-4 text-primary" /><span>Advanced Resume Analysis</span></li>
                  <li className="flex items-center space-x-2"><CheckCircle className="h-4 w-4 text-primary" /><span>ATS Optimization</span></li>
                  <li className="flex items-center space-x-2"><CheckCircle className="h-4 w-4 text-primary" /><span>Priority Support</span></li>
                </ul>
                <Button className="w-full bg-gradient-primary hover:opacity-90 shadow-soft">Get Started</Button>
              </CardContent>
            </Card>

            {/* Enterprise Plan */}
            <Card className="shadow-glow border-0 bg-background/95 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-2xl font-semibold">Enterprise</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Custom solutions for large teams
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-5xl font-bold">Contact Us</div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center space-x-2"><Users className="h-4 w-4 text-primary" /><span>Dedicated Account Manager</span></li>
                  <li className="flex items-center space-x-2"><TrendingUp className="h-4 w-4 text-primary" /><span>Custom Integrations</span></li>
                  <li className="flex items-center space-x-2"><Shield className="h-4 w-4 text-primary" /><span>Enhanced Security</span></li>
                </ul>
                <Button variant="outline" className="w-full">Contact Us</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background py-12 border-t border-border">
        <div className="container mx-auto px-6 text-center">
          <div className="flex items-center justify-center space-x-2">
            <Bot className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold bg-gradient-primary bg-clip-text text-transparent">
              Jobpilot.ai
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            © {new Date().getFullYear()} Jobpilot.ai. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;

