import React, { useState, useEffect } from "react";
import { useUser } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";
import {
  Target, Eye, MoreVertical, ExternalLink, Copy, Filter,
  CheckCircle2, Clock, AlertCircle, Search, Send, RefreshCw
} from "lucide-react";

interface JobMatch {
  id: string;
  title: string;
  company: string;
  location: string;
  status: "pending" | "applied" | "rejected" | "interview";
  platform: string;
  matched_at: string;
  job_url: string;
  description?: string;
  salary_range?: string;
}

const AllMatches = () => {
  const user = useUser();
  const [jobMatches, setJobMatches] = useState<JobMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedJobs, setSelectedJobs] = useState<Set<string>>(new Set());
  const [applying, setApplying] = useState(false);
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [platformFilter, setPlatformFilter] = useState<string>("all");
  const [companyFilter, setCompanyFilter] = useState<string>("");
  const [keywordFilter, setKeywordFilter] = useState<string>("");

  useEffect(() => {
    fetchJobMatches();
  }, []);

  const fetchJobMatches = async () => {
    try {
      setLoading(true);
      
      if (user?.id) {
        const { data: jobMatches, error } = await supabase
          .from('user_job_matches')
          .select(`
            *,
            scraped_jobs (
              id,
              title,
              company,
              location,
              description,
              salary_range,
              platform,
              job_url,
              requirements,
              benefits,
              scraped_at
            )
          `)
          .eq('user_id', user.id)
          .order('matched_at', { ascending: false });

        if (!error && jobMatches && jobMatches.length > 0) {
          const transformedMatches: JobMatch[] = jobMatches.map((match: any) => ({
            id: match.id,
            title: match.scraped_jobs?.title || 'Unknown Title',
            company: match.scraped_jobs?.company || 'Unknown Company',
            location: match.scraped_jobs?.location || 'Remote',
            status: (match.status as JobMatch["status"]) || 'pending',
            platform: match.scraped_jobs?.platform || 'indeed',
            matched_at: match.matched_at || new Date().toISOString(),  
            job_url: match.scraped_jobs?.job_url || '#',
            description: match.scraped_jobs?.description || 'No description available',
            salary_range: match.scraped_jobs?.salary_range
          }));
          
          setJobMatches(transformedMatches);
          return;
        }
      }

      setJobMatches([]);
      
    } catch (error) {
      console.error("Error fetching job matches:", error);
      toast({
        title: "❌ Failed to fetch job matches",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshJobs = async () => {
    if (!user?.id) return;
    
    try {
      setRefreshing(true);
      
      const { data, error } = await supabase.functions.invoke('scrape-jobs', {
        body: { 
          user_id: user.id,
          fetch_recent: true,
          limit: 10
        }
      });

      if (error) {
        console.error('Error refreshing jobs:', error);
        toast({
          title: "Job Refresh Started",
          description: "We're searching for new jobs. Check back in a moment!",
        });
      } else {
        toast({
          title: "🔄 Jobs Refreshed!",
          description: "Found new job matches. Refreshing the list now.",
        });
        
        // Refresh the matches list after a short delay
        setTimeout(() => {
          fetchJobMatches();
        }, 2000);
      }
    } catch (error) {
      console.error('Error refreshing jobs:', error);
      toast({
        title: "Refresh Started",
        description: "We're looking for new job matches in the background.",
      });
    } finally {
      setRefreshing(false);
    }
  };

  const getStatusBadge = (status: JobMatch["status"]) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="text-primary border-primary/20 bg-primary/10">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case "applied":
        return (
          <Badge variant="outline" className="text-success border-success/20 bg-success/10">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Applied
          </Badge>
        );
      case "interview":
        return (
          <Badge variant="outline" className="text-orange-600 border-orange-600/20 bg-orange-600/10">
            <AlertCircle className="w-3 h-3 mr-1" />
            Interview
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="outline" className="text-destructive border-destructive/20 bg-destructive/10">
            <AlertCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
    }
  };

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

  const handleSelectJob = (jobId: string, checked: boolean) => {
    const newSelected = new Set(selectedJobs);
    if (checked) {
      newSelected.add(jobId);
    } else {
      newSelected.delete(jobId);
    }
    setSelectedJobs(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedJobs(new Set(filteredJobs.map(job => job.id)));
    } else {
      setSelectedJobs(new Set());
    }
  };

  const handleApplySelected = async () => {
    if (selectedJobs.size === 0) return;

    try {
      setApplying(true);
      const selectedJobsArray = Array.from(selectedJobs);
      
      const response = await fetch("https://jobpilot-backend.onrender.com/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: user?.email,
          job_ids: selectedJobsArray,
        }),
      });

      if (response.ok) {
        toast({
          title: "🎉 Applications Sent!",
          description: `Successfully applied to ${selectedJobs.size} jobs.`,
        });
        
        setJobMatches(prev => prev.map(job => 
          selectedJobs.has(job.id) 
            ? { ...job, status: "applied" as const }
            : job
        ));
        
        setSelectedJobs(new Set());
      } else {
        throw new Error("Failed to apply to jobs");
      }
    } catch (error) {
      toast({
        title: "❌ Application failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setApplying(false);
    }
  };

  const copyJobLink = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({
      title: "✅ Link copied",
      description: "Job URL copied to clipboard.",
    });
  };

  const filteredJobs = jobMatches.filter(job => {
    const statusMatch = statusFilter === "all" || job.status === statusFilter;
    const platformMatch = platformFilter === "all" || job.platform.toLowerCase().includes(platformFilter.toLowerCase());
    const companyMatch = !companyFilter || job.company.toLowerCase().includes(companyFilter.toLowerCase());
    const keywordMatch = !keywordFilter || 
      job.title.toLowerCase().includes(keywordFilter.toLowerCase()) ||
      job.description?.toLowerCase().includes(keywordFilter.toLowerCase());
    
    return statusMatch && platformMatch && companyMatch && keywordMatch;
  });

  const isAllSelected = filteredJobs.length > 0 && filteredJobs.every(job => selectedJobs.has(job.id));
  const isIndeterminate = filteredJobs.some(job => selectedJobs.has(job.id)) && !isAllSelected;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <Card className="shadow-card border-0">
            <CardContent className="p-6">
              <div className="h-6 bg-muted rounded w-1/2 mb-4"></div>
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </CardContent>
          </Card>
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-muted rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="shadow-card border-0 bg-gradient-hero">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-full bg-primary/10">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">All Job Matches</h1>
                <p className="text-muted-foreground">
                  🎯 Showing recent job matches based on your profile
                </p>
              </div>
            </div>
            <Button
              onClick={refreshJobs}
              disabled={refreshing}
              variant="outline"
              className="bg-white/10 border-white/20 hover:bg-white/20"
            >
              {refreshing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Find New Jobs
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className="shadow-card border-0">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="all">All Statuses</SelectItem>
                   <SelectItem value="pending">Pending</SelectItem>
                   <SelectItem value="applied">Applied</SelectItem>
                   <SelectItem value="interview">Interview</SelectItem>
                   <SelectItem value="rejected">Rejected</SelectItem>
                 </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Platform</label>
              <Select value={platformFilter} onValueChange={setPlatformFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Platforms" />
                </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="all">All Platforms</SelectItem>
                   <SelectItem value="indeed">Indeed</SelectItem>
                   <SelectItem value="linkedin">LinkedIn</SelectItem>
                   <SelectItem value="naukri">Naukri</SelectItem>
                   <SelectItem value="company-website">Company Website</SelectItem>
                 </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Company</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search companies..."
                  value={companyFilter}
                  onChange={(e) => setCompanyFilter(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Keywords</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search job descriptions..."
                  value={keywordFilter}
                  onChange={(e) => setKeywordFilter(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Job Matches Table */}
      <Card className="shadow-card border-0">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle>
              Job Matches ({filteredJobs.length})
            </CardTitle>
            <div className="text-sm text-muted-foreground">
              {selectedJobs.size > 0 && `${selectedJobs.size} selected`}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={isAllSelected}
                      ref={(ref) => {
                        if (ref && 'indeterminate' in ref) {
                          (ref as any).indeterminate = isIndeterminate;
                        }
                      }}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Job Title</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Salary</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead>Matched At</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredJobs.map((job) => (
                  <TableRow 
                    key={job.id} 
                    className="hover:bg-muted/50 transition-colors"
                  >
                    <TableCell>
                      <Checkbox
                        checked={selectedJobs.has(job.id)}
                        onCheckedChange={(checked) => 
                          handleSelectJob(job.id, checked as boolean)
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <a 
                          href={job.job_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="font-medium hover:text-primary transition-colors"
                        >
                          {job.title}
                        </a>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{job.company}</TableCell>
                    <TableCell className="text-muted-foreground">{job.location}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {job.salary_range || 'Not disclosed'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{job.platform}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {getTimeAgo(job.matched_at)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <a href={job.job_url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="mr-2 h-4 w-4" />
                              Open Job
                            </a>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => copyJobLink(job.job_url)}>
                            <Copy className="mr-2 h-4 w-4" />
                            Copy Link
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredJobs.length === 0 && (
            <div className="text-center py-12">
              <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No matches found</h3>
              <p className="text-muted-foreground mb-4">
                Complete your profile setup to get personalized job matches.
              </p>
              <Button onClick={refreshJobs} disabled={refreshing}>
                {refreshing ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Find Jobs
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sticky Apply Button */}
      {selectedJobs.size > 0 && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            onClick={handleApplySelected}
            disabled={applying}
            className="bg-gradient-primary hover:opacity-90 shadow-glow px-6 py-3 text-lg"
          >
            {applying ? (
              <>
                <Clock className="mr-2 h-5 w-5 animate-spin" />
                Applying...
              </>
            ) : (
              <>
                <Send className="mr-2 h-5 w-5" />
                Apply to {selectedJobs.size} Job{selectedJobs.size !== 1 ? 's' : ''}
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default AllMatches;
