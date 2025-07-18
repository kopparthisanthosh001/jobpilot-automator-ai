
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ExternalLink, MapPin, DollarSign, Calendar, Building } from "lucide-react";

interface JobMatch {
  id: string;
  title: string;
  company: string;
  location: string;
  platform: string;
  matched_at: string;
  job_url: string;
  description?: string;
  salary_range?: string;
}

interface JobDetailsModalProps {
  job: JobMatch | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const JobDetailsModal = ({ job, open, onOpenChange }: JobDetailsModalProps) => {
  if (!job) return null;

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInDays > 0) {
      return `${diffInDays}d ago`;
    } else if (diffInHours > 0) {
      return `${diffInHours}h ago`;
    } else {
      return "Just now";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{job.title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Job Header Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Building className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">{job.company}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <span className="text-muted-foreground">{job.location}</span>
              </div>
              
              {job.salary_range && (
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5 text-muted-foreground" />
                  <span className="text-muted-foreground">{job.salary_range}</span>
                </div>
              )}
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <span className="text-muted-foreground">Matched {getTimeAgo(job.matched_at)}</span>
              </div>
              
              <div>
                <Badge variant="outline" className="text-sm">
                  {job.platform}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Job Description */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Job Description</h3>
            <div className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
              {job.description || 'No description available for this job posting.'}
            </div>
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
            <Button
              onClick={() => window.open(job.job_url, '_blank', 'noopener,noreferrer')}
              className="bg-gradient-primary hover:opacity-90"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              View Original Job
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default JobDetailsModal;
