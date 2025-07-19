
import { useState, useRef } from "react";
import { useUser } from "@supabase/auth-helpers-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { useFileUpload } from "@/hooks/useFileUpload";
import { ATSAnalysisResults } from "@/components/ATSAnalysisResults";
import { useNavigate } from "react-router-dom";
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
  BarChart3,
  Copy,
  Save
} from "lucide-react";

type ViewMode = 'input' | 'results' | 'optimized';

const ATSOptimizer = () => {
  const user = useUser();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadFile, isUploading } = useFileUpload();
  
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [currentScore, setCurrentScore] = useState(73);
  const [optimizedScore, setOptimizedScore] = useState(89);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [optimizedResumeText, setOptimizedResumeText] = useState("");
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('input');

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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const extractedText = await uploadFile(file);
      setResumeText(extractedText);
    } catch (error) {
      console.error('File upload failed:', error);
    } finally {
      // Reset the input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
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
      setViewMode('results');
      toast({
        title: "Analysis Complete",
        description: "Your ATS score analysis is ready!",
      });
    }, 2000);
  };

  const handleOptimizeResume = () => {
    setLoading(true);
    
    // Simulate resume optimization
    setTimeout(() => {
      const optimizedResume = `${resumeText}

OPTIMIZED ADDITIONS:
• Enhanced with high-impact keywords: Machine Learning, Python, SQL, A/B Testing
• Added quantified achievements and metrics
• Improved action verbs and industry-specific terminology
• Optimized for ATS scanning with proper formatting`;
      
      setOptimizedResumeText(optimizedResume);
      setCurrentScore(optimizedScore);
      setLoading(false);
      setViewMode('optimized');
      
      toast({
        title: "Resume Optimized",
        description: `Your ATS score improved from ${currentScore}% to ${optimizedScore}%!`,
      });
    }, 2000);
  };

  const handleDownloadReport = () => {
    const reportContent = `ATS ANALYSIS REPORT
    
Current Score: ${currentScore}%
Optimized Score: ${optimizedScore}%

MATCHED SKILLS:
${mockAnalysisResults.matchedSkills.join(', ')}

MISSING SKILLS:
${mockAnalysisResults.missingSkills.join(', ')}

RECOMMENDATIONS:
${mockAnalysisResults.suggestions.map((s, i) => `${i + 1}. ${s}`).join('\n')}`;

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ats-analysis-report.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Report Downloaded",
      description: "Your ATS analysis report has been saved.",
    });
  };

  const handleSaveOptimizedResume = () => {
    navigator.clipboard.writeText(optimizedResumeText);
    toast({
      title: "Resume Copied",
      description: "Optimized resume has been copied to clipboard.",
    });
  };

  const handleGoBack = () => {
    setViewMode('input');
    setAnalysisResults(null);
  };

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-warning";
    return "text-destructive";
  };

  // Results View
  if (viewMode === 'results' && analysisResults) {
    return (
      <ATSAnalysisResults
        score={currentScore}
        optimizedScore={optimizedScore}
        analysisResults={analysisResults}
        onGoBack={handleGoBack}
        onOptimizeResume={handleOptimizeResume}
        onDownloadReport={handleDownloadReport}
      />
    );
  }

  // Optimized Resume View
  if (viewMode === 'optimized') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Optimized Resume</h2>
            <p className="text-muted-foreground">Your ATS-optimized resume is ready!</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleGoBack}>
              Back to Analyzer
            </Button>
            <Button onClick={handleGoToDashboard}>
              Go to Dashboard
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="shadow-card border-0">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-5 w-5" />
                    <span>Optimized Resume</span>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" onClick={handleSaveOptimizedResume}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                    <Button size="sm" onClick={handleDownloadReport}>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={optimizedResumeText}
                  readOnly
                  className="min-h-[500px] font-mono text-sm"
                />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="shadow-card border-0">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Score Improvement</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-success">
                    {optimizedScore}%
                  </div>
                  <Badge className="bg-success/10 text-success border-success/20 mt-2">
                    +{optimizedScore - 73}% Improvement
                  </Badge>
                </div>
                <Progress value={optimizedScore} className="h-3" />
              </CardContent>
            </Card>

            <Card className="shadow-card border-0">
              <CardHeader>
                <CardTitle>Next Steps</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    <span className="text-sm">Resume optimized</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Save className="h-4 w-4 text-primary" />
                    <span className="text-sm">Save to your profile</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Target className="h-4 w-4 text-primary" />
                    <span className="text-sm">Apply to matching jobs</span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Button 
                    onClick={() => navigate('/dashboard/matches')}
                    className="w-full bg-gradient-primary hover:opacity-90"
                  >
                    Find Matching Jobs
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/dashboard/profile-setup')}
                    className="w-full"
                  >
                    Update Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Input View (Default)
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
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.doc,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={handleUploadClick}
                  disabled={isUploading}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {isUploading ? "Uploading..." : "Upload PDF/DOCX"}
                </Button>
                <Button 
                  variant="outline"
                  onClick={handleDownloadReport}
                  disabled={!analysisResults}
                  title="Download sample resume template"
                >
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
            disabled={loading || !resumeText.trim()}
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

        {/* Right Column - Preview/Info */}
        <div className="space-y-6">
          {/* Current Score Preview */}
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
              <p className="text-sm text-muted-foreground">
                Potential improvement with our optimization suggestions
              </p>
            </CardContent>
          </Card>

          {/* Quick Tips */}
          <Card className="shadow-card border-0">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lightbulb className="h-5 w-5" />
                <span>Quick Tips</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start space-x-2">
                <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                <p className="text-sm">Use keywords from job descriptions</p>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                <p className="text-sm">Include quantified achievements</p>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                <p className="text-sm">Maintain clean, simple formatting</p>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                <p className="text-sm">Use standard section headings</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ATSOptimizer;
