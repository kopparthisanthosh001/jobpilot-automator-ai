import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  FileText, 
  TrendingUp, 
  Lightbulb, 
  CheckCircle2, 
  AlertCircle,
  PlusCircle,
  Target
} from "lucide-react";

interface ResumeOptimizationProps {
  currentScore: number;
  potentialScore: number;
  suggestions: {
    addSkills: string[];
    addKeywords: string[];
    improveSections: string[];
  };
  onOptimizeResume?: () => void;
  onUpdateProfile?: () => void;
}

export const ResumeOptimizationPanel = ({
  currentScore,
  potentialScore,
  suggestions,
  onOptimizeResume,
  onUpdateProfile
}: ResumeOptimizationProps) => {
  const scoreImprovement = potentialScore - currentScore;

  return (
    <Card className="shadow-card border-0">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Target className="h-5 w-5" />
          <span>Resume Optimization</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Score Comparison */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Current ATS Score</p>
              <p className="text-2xl font-bold">{currentScore}%</p>
            </div>
            <div className="space-y-1 text-right">
              <p className="text-sm text-muted-foreground">Potential Score</p>
              <p className="text-2xl font-bold text-success">{potentialScore}%</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Improvement Potential</span>
              <span className="font-medium text-success">+{scoreImprovement}%</span>
            </div>
            <Progress value={potentialScore} className="h-2" />
          </div>
        </div>

        <Separator />

        {/* Suggestions */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Lightbulb className="h-4 w-4 text-warning" />
            <h4 className="font-medium">Optimization Suggestions</h4>
          </div>

          {suggestions.addSkills.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <PlusCircle className="h-3 w-3 text-primary" />
                <p className="text-sm font-medium">Add High-Demand Skills</p>
              </div>
              <div className="flex flex-wrap gap-1 ml-5">
                {suggestions.addSkills.map((skill, index) => (
                  <Badge key={index} variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {suggestions.addKeywords.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <FileText className="h-3 w-3 text-secondary" />
                <p className="text-sm font-medium">Include Keywords</p>
              </div>
              <div className="flex flex-wrap gap-1 ml-5">
                {suggestions.addKeywords.map((keyword, index) => (
                  <Badge key={index} variant="outline" className="text-xs bg-secondary/10 text-secondary border-secondary/20">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {suggestions.improveSections.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-3 w-3 text-accent" />
                <p className="text-sm font-medium">Enhance Sections</p>
              </div>
              <div className="ml-5 space-y-1">
                {suggestions.improveSections.map((section, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <AlertCircle className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{section}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button 
            onClick={onOptimizeResume}
            className="w-full bg-gradient-primary hover:opacity-90"
          >
            <FileText className="mr-2 h-4 w-4" />
            Optimize Resume Now
          </Button>
          
          <Button 
            variant="outline" 
            onClick={onUpdateProfile}
            className="w-full"
          >
            Update Profile & Skills
          </Button>
        </div>

        {/* Success Prediction */}
        <div className="p-3 bg-success/5 border border-success/20 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <CheckCircle2 className="h-4 w-4 text-success" />
            <p className="text-sm font-medium text-success">Success Prediction</p>
          </div>
          <p className="text-xs text-muted-foreground ml-6">
            With these optimizations, your profile would match {Math.round((potentialScore / 100) * 7.2)} out of 10 recent job postings.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};