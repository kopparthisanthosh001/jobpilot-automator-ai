import { useState, useEffect } from "react";
import { useUser } from "@supabase/auth-helpers-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { 
  Target, 
  Upload, 
  FileText, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle,
  Lightbulb,
  PlusCircle,
  Download,
  BarChart3
} from "lucide-react";

const ATSOptimizer = () => {
  const user = useUser();
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [currentScore, setCurrentScore] = useState(73);
  const [optimizedScore, setOptimizedScore] = useState(89);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Mock ATS analysis results
  const mockAnalysisResults = {
    matchedSkills: ["Product Management", "Data Analysis", "Agile", "Leadership", "Strategy"],
    missingSkills: ["Machine Learning", "Python", "SQL", "A/B Testing"],
    keywordDensity: [
      { keyword: "Product Manager", count: 5, optimal: 3 },
      { keyword: "Leadership", count: 2, optimal: 4 },
      { keyword: "Analytics", count: 6, optimal: 5 },
    ],
    suggestions: [
      "Add quantified achievements (e.g., 'Increased user engagement by 40%')",
      "Include relevant technical skills like SQL and Python",
      "Use more action verbs like 'spearheaded', 'optimized', 'scaled'",
      "Add specific industry keywords from the job description"
    ],
    sectionScores: {
      contact: 95,
      summary: 75,
      experience: 80,
      skills: 65,
      education: 90,
      keywords: 70
    }
  };

  const handleAnalyzeResume = async () => {
    if (!resumeText.trim()) {
      toast({
        title: "Please enter your resume",
        description: "We need your resume text to perform ATS analysis.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setAnalysisResults(mockAnalysisResults);
      setLoading(false);
      toast({
        title: "Analysis Complete",
        description: "Your ATS score analysis is ready!",
      });
    }, 2000);
  };

  const handleOptimizeResume = () => {
    toast({
      title: "Resume Optimization",
      description: "Your optimized resume is being generated...",
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-warning";
    return "text-destructive";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold flex items-center space-x-2">
          <Target className="h-8 w-8" />
          <span>ATS Resume Optimizer</span>
        </h1>
        <p className="text-muted-foreground text-lg">
          Optimize your resume to beat Applicant Tracking Systems and increase interview chances
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left Column - Input */}
        <div className="space-y-6">
          {/* Resume Input */}
          <Card className="shadow-card border-0">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Your Resume</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Paste your resume text or upload file
                </label>
                <Textarea
                  placeholder="Paste your resume content here..."
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  className="min-h-[200px]"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Button variant="outline" className="flex-1">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload PDF/DOCX
                </Button>
                <Button variant="outline">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Job Description Input */}
          <Card className="shadow-card border-0">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5" />
                <span>Target Job Description (Optional)</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Paste job description for targeted optimization
                </label>
                <Textarea
                  placeholder="Paste the job description you're targeting..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="min-h-[150px]"
                />
              </div>
            </CardContent>
          </Card>

          {/* Analyze Button */}
          <Button
            onClick={handleAnalyzeResume}
            disabled={loading}
            className="w-full bg-gradient-primary hover:opacity-90"
            size="lg"
          >
            {loading ? (
              <>
                <TrendingUp className="mr-2 h-5 w-5 animate-spin" />
                Analyzing Resume...
              </>
            ) : (
              <>
                <BarChart3 className="mr-2 h-5 w-5" />
                Analyze ATS Score
              </>
            )}
          </Button>
        </div>

        {/* Right Column - Results */}
        <div className="space-y-6">
          {/* Current Score */}
          <Card className="shadow-card border-0">
            <CardHeader>
              <CardTitle>Current ATS Score</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold">{currentScore}%</span>
                <Badge className={`${getScoreColor(currentScore)} bg-transparent border`}>
                  {currentScore >= 80 ? "Excellent" : currentScore >= 60 ? "Good" : "Needs Work"}
                </Badge>
              </div>
              <Progress value={currentScore} className="h-3" />
              <p className="text-sm text-muted-foreground">
                Your resume has a {currentScore}% chance of passing ATS screening
              </p>
            </CardContent>
          </Card>

          {/* Optimization Potential */}
          <Card className="shadow-card border-0">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Optimization Potential</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Potential Score</p>
                  <p className="text-2xl font-bold text-success">{optimizedScore}%</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Improvement</p>
                  <p className="text-2xl font-bold text-success">+{optimizedScore - currentScore}%</p>
                </div>
              </div>
              <Progress value={optimizedScore} className="h-3" />
            </CardContent>
          </Card>

          {/* Analysis Results */}
          {analysisResults && (
            <>
              {/* Section Scores */}
              <Card className="shadow-card border-0">
                <CardHeader>
                  <CardTitle>Section Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {Object.entries(analysisResults.sectionScores).map(([section, score]) => (
                    <div key={section} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="capitalize">{section}</span>
                        <span className={`font-medium ${getScoreColor(Number(score))}`}>
                          {Number(score)}%
                        </span>
                      </div>
                      <Progress value={Number(score)} className="h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Recommendations */}
              <Card className="shadow-card border-0">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Lightbulb className="h-5 w-5" />
                    <span>Optimization Tips</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {analysisResults.suggestions.map((suggestion: string, index: number) => (
                      <div key={index} className="flex items-start space-x-2">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <p className="text-sm">{suggestion}</p>
                      </div>
                    ))}
                  </div>
                  
                  <Separator />
                  
                  <Button 
                    onClick={handleOptimizeResume}
                    className="w-full bg-gradient-primary hover:opacity-90"
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Generate Optimized Resume
                  </Button>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ATSOptimizer;