
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  Download,
  Edit,
  ArrowLeft,
  Target,
  Lightbulb,
  FileText,
  BarChart3
} from "lucide-react";

interface ATSAnalysisResultsProps {
  score: number;
  optimizedScore: number;
  analysisResults: {
    matchedSkills: string[];
    missingSkills: string[];
    keywordDensity: Array<{ keyword: string; count: number; optimal: number; }>;
    suggestions: string[];
    sectionScores: {
      contact: number;
      summary: number;
      experience: number;
      skills: number;
      education: number;
      keywords: number;
    };
  };
  onGoBack: () => void;
  onOptimizeResume: () => void;
  onDownloadReport: () => void;
}

export const ATSAnalysisResults = ({
  score,
  optimizedScore,
  analysisResults,
  onGoBack,
  onOptimizeResume,
  onDownloadReport
}: ATSAnalysisResultsProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-warning";
    return "text-destructive";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    return "Needs Improvement";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={onGoBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Analyzer
          </Button>
          <div>
            <h2 className="text-2xl font-bold">ATS Analysis Results</h2>
            <p className="text-muted-foreground">Detailed breakdown of your resume performance</p>
          </div>
        </div>
        <Button onClick={onDownloadReport} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Download Report
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Score Overview */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="shadow-card border-0">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5" />
                <span>ATS Score</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className={`text-4xl font-bold ${getScoreColor(score)}`}>
                  {score}%
                </div>
                <Badge className={`${getScoreColor(score)} bg-transparent border mt-2`}>
                  {getScoreLabel(score)}
                </Badge>
              </div>
              <Progress value={score} className="h-3" />
              <p className="text-sm text-center text-muted-foreground">
                Your resume has a {score}% chance of passing ATS screening
              </p>
            </CardContent>
          </Card>

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
                  <p className="text-2xl font-bold text-success">+{optimizedScore - score}%</p>
                </div>
              </div>
              <Progress value={optimizedScore} className="h-3" />
              <Button onClick={onOptimizeResume} className="w-full bg-gradient-primary hover:opacity-90">
                <Edit className="h-4 w-4 mr-2" />
                Optimize Resume
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analysis */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section Scores */}
          <Card className="shadow-card border-0">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Section Breakdown</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(analysisResults.sectionScores).map(([section, sectionScore]) => (
                <div key={section} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="capitalize font-medium">{section}</span>
                    <span className={`font-medium ${getScoreColor(Number(sectionScore))}`}>
                      {Number(sectionScore)}%
                    </span>
                  </div>
                  <Progress value={Number(sectionScore)} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Skills Analysis */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="shadow-card border-0">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-success">
                  <CheckCircle2 className="h-5 w-5" />
                  <span>Matched Skills</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {analysisResults.matchedSkills.map((skill, index) => (
                    <Badge key={index} className="bg-success/10 text-success border-success/20">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card border-0">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-warning">
                  <AlertTriangle className="h-5 w-5" />
                  <span>Missing Skills</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {analysisResults.missingSkills.map((skill, index) => (
                    <Badge key={index} className="bg-warning/10 text-warning border-warning/20">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recommendations */}
          <Card className="shadow-card border-0">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lightbulb className="h-5 w-5" />
                <span>Optimization Recommendations</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {analysisResults.suggestions.map((suggestion, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-xs font-medium text-primary">{index + 1}</span>
                  </div>
                  <p className="text-sm">{suggestion}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Keyword Density */}
          <Card className="shadow-card border-0">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Keyword Analysis</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {analysisResults.keywordDensity.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{item.keyword}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-muted-foreground">
                        {item.count}/{item.optimal}
                      </span>
                      {item.count >= item.optimal ? (
                        <CheckCircle2 className="h-4 w-4 text-success" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-warning" />
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <div className="flex-1">
                      <Progress 
                        value={(item.count / item.optimal) * 100} 
                        className="h-2" 
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
