import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  FileText, 
  Search, 
  Filter, 
  Calendar, 
  ExternalLink, 
  CheckCircle,
  Clock,
  XCircle
} from "lucide-react";
import { NoApplications } from "@/components/EmptyStates";

interface Application {
  id: string;
  company: string;
  role: string;
  jobLink: string;
  status: "applied" | "viewed" | "rejected" | "interview";
  appliedOn: string;
  salary?: string;
  location: string;
}

const mockApplications: Application[] = [
  {
    id: "1",
    company: "Flipkart",
    role: "Senior Product Manager",
    jobLink: "https://flipkart.com/jobs/123",
    status: "interview",
    appliedOn: "2024-01-15",
    salary: "25-30 LPA",
    location: "Bangalore"
  },
  {
    id: "2",
    company: "Zomato",
    role: "Strategy Manager",
    jobLink: "https://zomato.com/careers/456",
    status: "viewed",
    appliedOn: "2024-01-14",
    salary: "20-25 LPA",
    location: "Gurugram"
  },
  {
    id: "3",
    company: "Paytm",
    role: "Business Analyst",
    jobLink: "https://paytm.com/jobs/789",
    status: "applied",
    appliedOn: "2024-01-13",
    salary: "18-22 LPA",
    location: "Noida"
  },
  {
    id: "4",
    company: "Swiggy",
    role: "Product Manager",
    jobLink: "https://swiggy.com/careers/101",
    status: "rejected",
    appliedOn: "2024-01-12",
    salary: "22-28 LPA",
    location: "Bangalore"
  },
];

const AppliedJobs = () => {
  const [applications] = useState<Application[]>(mockApplications);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");

  const getStatusBadge = (status: Application['status']) => {
    switch (status) {
      case "applied":
        return <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">Applied</Badge>;
      case "viewed":
        return <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">Viewed</Badge>;
      case "interview":
        return <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">Interview</Badge>;
      case "rejected":
        return <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50">Rejected</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getStatusIcon = (status: Application['status']) => {
    switch (status) {
      case "applied":
        return <Clock className="h-4 w-4 text-blue-600" />;
      case "viewed":
        return <Clock className="h-4 w-4 text-amber-600" />;
      case "interview":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const sortedApplications = [...filteredApplications].sort((a, b) => {
    if (sortBy === "date") {
      return new Date(b.appliedOn).getTime() - new Date(a.appliedOn).getTime();
    } else if (sortBy === "company") {
      return a.company.localeCompare(b.company);
    } else if (sortBy === "status") {
      return a.status.localeCompare(b.status);
    }
    return 0;
  });

  if (applications.length === 0) {
    return (
      <div className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Applied Jobs</h1>
          <p className="text-muted-foreground text-lg">
            Track all your job applications in one place
          </p>
        </div>
        <NoApplications />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Applied Jobs</h1>
        <p className="text-muted-foreground text-lg">
          Track all your job applications and their current status
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="shadow-card border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Applied</p>
                <p className="text-2xl font-bold">{applications.length}</p>
              </div>
              <FileText className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Viewed</p>
                <p className="text-2xl font-bold text-amber-600">
                  {applications.filter(app => app.status === "viewed").length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Interviews</p>
                <p className="text-2xl font-bold text-green-600">
                  {applications.filter(app => app.status === "interview").length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Response Rate</p>
                <p className="text-2xl font-bold text-success">
                  {Math.round((applications.filter(app => app.status === "interview" || app.status === "viewed").length / applications.length) * 100)}%
                </p>
              </div>
              <div className="h-8 w-8 bg-success/10 rounded-full flex items-center justify-center">
                <span className="text-success font-bold">%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="shadow-card border-0">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filters & Search</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search company or role..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="applied">Applied</SelectItem>
                  <SelectItem value="viewed">Viewed</SelectItem>
                  <SelectItem value="interview">Interview</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Sort By</label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date Applied</SelectItem>
                  <SelectItem value="company">Company</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Applications Table */}
      <Card className="shadow-card border-0">
        <CardHeader>
          <CardTitle>Applications ({sortedApplications.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Salary</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Applied On</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedApplications.map((application) => (
                  <TableRow key={application.id}>
                    <TableCell className="font-medium">{application.company}</TableCell>
                    <TableCell>{application.role}</TableCell>
                    <TableCell>{application.location}</TableCell>
                    <TableCell>{application.salary || "Not specified"}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(application.status)}
                        {getStatusBadge(application.status)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{new Date(application.appliedOn).toLocaleDateString()}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                      >
                        <a
                          href={application.jobLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-1"
                        >
                          <ExternalLink className="h-4 w-4" />
                          <span>View Job</span>
                        </a>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AppliedJobs;