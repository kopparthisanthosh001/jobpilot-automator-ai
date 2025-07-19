import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Target, TrendingUp, AlertTriangle, CheckCircle2 } from "lucide-react";

interface ATSScoreProps {
  jobTitle: string;
  company: string;
  atsScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  onViewDetails?: () => void;
}

export const ATSScoreCard = ({ 
  jobTitle, 
  company, 
  atsScore, 
  matchedSkills, 
  missingSkills,
  onViewDetails 
}: ATSScoreProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-warning";
    return "text-destructive";
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle2 className="h-4 w-4 text-success" />;
    if (score >= 60) return <TrendingUp className="h-4 w-4 text-warning" />;
    return <AlertTriangle className="h-4 w-4 text-destructive" />;
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent Match";
    if (score >= 60) return "Good Match";
    return "Fair Match";
  };

  return (
    <Card className="shadow-card border-0 hover:shadow-glow transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">ATS Score</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            {getScoreIcon(atsScore)}
            <span className={`text-2xl font-bold ${getScoreColor(atsScore)}`}>
              {atsScore}%
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Match Quality</span>
            <span className={`font-medium ${getScoreColor(atsScore)}`}>
              {getScoreLabel(atsScore)}
            </span>
          </div>
          <Progress value={atsScore} className="h-2" />
        </div>

        {matchedSkills.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-success">
              Matched Skills ({matchedSkills.length})
            </p>
            <div className="flex flex-wrap gap-1">
              {matchedSkills.slice(0, 3).map((skill, index) => (
                <Badge key={index} variant="outline" className="text-xs bg-success/10 text-success border-success/20">
                  {skill}
                </Badge>
              ))}
              {matchedSkills.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{matchedSkills.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {missingSkills.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-warning">
              Missing Skills ({missingSkills.length})
            </p>
            <div className="flex flex-wrap gap-1">
              {missingSkills.slice(0, 2).map((skill, index) => (
                <Badge key={index} variant="outline" className="text-xs bg-warning/10 text-warning border-warning/20">
                  {skill}
                </Badge>
              ))}
              {missingSkills.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{missingSkills.length - 2} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {onViewDetails && (
          <Button variant="outline" size="sm" onClick={onViewDetails} className="w-full">
            View Analysis Details
          </Button>
        )}
      </CardContent>
    </Card>
  );
};