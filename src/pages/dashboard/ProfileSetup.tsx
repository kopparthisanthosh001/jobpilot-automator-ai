import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  Upload as UploadIcon, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  X,
  Settings, 
  MapPin, 
  Briefcase, 
  Target,
  Clock,
  Info
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ProfileSetup = () => {
  // Resume upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedResume, setUploadedResume] = useState<string | null>("Product_Manager_Resume.pdf");
  
  // Job preferences state
  const [preferences, setPreferences] = useState({
    desiredRoles: ["Product Manager", "Strategy Manager"],
    locations: ["Bangalore", "Mumbai", "Delhi"],
    experienceLevel: "mid",
    keywords: "product management, strategy, analytics, user experience",
    salaryRange: { min: "15", max: "30" },
    jobTypes: ["full-time", "remote"],
    industries: ["technology", "fintech"],
  });
  
  const [newRole, setNewRole] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  // Resume upload handlers
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        toast({
          title: "Invalid file type",
          description: "Please select a PDF file.",
          variant: "destructive",
        });
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "File too large",
          description: "Please select a file smaller than 5MB.",
          variant: "destructive",
        });
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    setUploading(true);
    setUploadProgress(0);
    
    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploading(false);
          setUploadedResume(selectedFile.name);
          setSelectedFile(null);
          toast({
            title: "Resume uploaded successfully!",
            description: "Your resume has been analyzed and is ready for job matching.",
          });
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleRemoveResume = () => {
    setUploadedResume(null);
    toast({
      title: "Resume removed",
      description: "Your resume has been removed from the system.",
    });
  };

  // Job preferences handlers
  const addRole = () => {
    if (newRole.trim() && !preferences.desiredRoles.includes(newRole.trim())) {
      setPreferences(prev => ({
        ...prev,
        desiredRoles: [...prev.desiredRoles, newRole.trim()]
      }));
      setNewRole("");
    }
  };

  const removeRole = (role: string) => {
    setPreferences(prev => ({
      ...prev,
      desiredRoles: prev.desiredRoles.filter(r => r !== role)
    }));
  };

  const addLocation = () => {
    if (newLocation.trim() && !preferences.locations.includes(newLocation.trim())) {
      setPreferences(prev => ({
        ...prev,
        locations: [...prev.locations, newLocation.trim()]
      }));
      setNewLocation("");
    }
  };

  const removeLocation = (location: string) => {
    setPreferences(prev => ({
      ...prev,
      locations: prev.locations.filter(l => l !== location)
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      setSaving(false);
      toast({
        title: "Profile updated successfully!",
        description: "Your resume and job preferences have been saved. We'll find matching jobs every 2 hours.",
      });
    }, 1000);
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Profile Setup</h1>
        <p className="text-muted-foreground text-lg">
          Upload your resume and configure your job preferences for better matching
        </p>
      </div>

      {/* Resume Upload Section */}
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <UploadIcon className="h-5 w-5" />
          <h2 className="text-xl font-semibold">Resume Upload</h2>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="shadow-card border-0">
            <CardHeader>
              <CardTitle>Upload Resume</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {!uploadedResume ? (
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center space-y-4">
                    <UploadIcon className="h-12 w-12 text-muted-foreground mx-auto" />
                    <div className="space-y-2">
                      <p className="text-lg font-medium">Upload your resume</p>
                      <p className="text-sm text-muted-foreground">
                        PDF files only, max 5MB
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="resume-upload" className="sr-only">
                        Resume file
                      </Label>
                      <Input
                        id="resume-upload"
                        type="file"
                        accept=".pdf"
                        onChange={handleFileSelect}
                        className="max-w-xs mx-auto"
                      />
                    </div>
                  </div>

                  {selectedFile && (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg">
                        <FileText className="h-5 w-5 text-primary" />
                        <div className="flex-1">
                          <p className="font-medium">{selectedFile.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedFile(null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      {uploading && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Uploading...</span>
                            <span>{uploadProgress}%</span>
                          </div>
                          <Progress value={uploadProgress} />
                        </div>
                      )}

                      <Button
                        onClick={handleUpload}
                        disabled={uploading}
                        className="w-full bg-gradient-primary hover:opacity-90"
                      >
                        {uploading ? "Uploading..." : "Save Resume"}
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Resume successfully uploaded and analyzed!
                    </AlertDescription>
                  </Alert>

                  <div className="flex items-center space-x-3 p-4 bg-success/10 border border-success/20 rounded-lg">
                    <FileText className="h-6 w-6 text-success" />
                    <div className="flex-1">
                      <p className="font-medium text-success">{uploadedResume}</p>
                      <p className="text-sm text-muted-foreground">
                        Uploaded on {new Date().toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <Label htmlFor="resume-replace" className="sr-only">
                      Replace resume
                    </Label>
                    <Input
                      id="resume-replace"
                      type="file"
                      accept=".pdf"
                      onChange={handleFileSelect}
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      onClick={handleRemoveResume}
                      className="text-destructive hover:text-destructive"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-card border-0">
            <CardHeader>
              <CardTitle>Resume Guidelines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-success mt-0.5" />
                  <div>
                    <p className="font-medium">Use a professional format</p>
                    <p className="text-sm text-muted-foreground">
                      Clean, ATS-friendly layout with clear sections
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-success mt-0.5" />
                  <div>
                    <p className="font-medium">Include relevant keywords</p>
                    <p className="text-sm text-muted-foreground">
                      Skills and technologies related to your target roles
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-success mt-0.5" />
                  <div>
                    <p className="font-medium">Quantify achievements</p>
                    <p className="text-sm text-muted-foreground">
                      Use numbers and metrics to showcase impact
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-accent mt-0.5" />
                  <div>
                    <p className="font-medium">Keep it updated</p>
                    <p className="text-sm text-muted-foreground">
                      Regular updates improve job matching accuracy
                    </p>
                  </div>
                </div>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Privacy:</strong> Your resume is encrypted and only used for job matching. 
                  We never share your personal information with third parties.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </div>

      <Separator className="my-8" />

      {/* Job Preferences Section */}
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Settings className="h-5 w-5" />
          <h2 className="text-xl font-semibold">Job Preferences</h2>
        </div>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Smart Matching:</strong> We'll find jobs every 2 hours based on these preferences. 
            The more specific you are, the better the matches!
          </AlertDescription>
        </Alert>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Role Preferences */}
          <Card className="shadow-card border-0">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5" />
                <span>Desired Roles</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-role">Add Role</Label>
                <div className="flex space-x-2">
                  <Input
                    id="new-role"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    placeholder="e.g., Product Manager"
                    onKeyPress={(e) => e.key === 'Enter' && addRole()}
                  />
                  <Button onClick={addRole} variant="outline">
                    Add
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Current Roles</Label>
                <div className="flex flex-wrap gap-2">
                  {preferences.desiredRoles.map((role) => (
                    <Badge key={role} variant="secondary" className="flex items-center space-x-1">
                      <span>{role}</span>
                      <button
                        onClick={() => removeRole(role)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience">Experience Level</Label>
                <Select 
                  value={preferences.experienceLevel}
                  onValueChange={(value) => setPreferences(prev => ({ ...prev, experienceLevel: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entry">Entry Level (0-2 years)</SelectItem>
                    <SelectItem value="mid">Mid Level (3-7 years)</SelectItem>
                    <SelectItem value="senior">Senior Level (8+ years)</SelectItem>
                    <SelectItem value="executive">Executive Level</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Location Preferences */}
          <Card className="shadow-card border-0">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>Preferred Locations</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-location">Add Location</Label>
                <div className="flex space-x-2">
                  <Input
                    id="new-location"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    placeholder="e.g., Bangalore"
                    onKeyPress={(e) => e.key === 'Enter' && addLocation()}
                  />
                  <Button onClick={addLocation} variant="outline">
                    Add
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Current Locations</Label>
                <div className="flex flex-wrap gap-2">
                  {preferences.locations.map((location) => (
                    <Badge key={location} variant="secondary" className="flex items-center space-x-1">
                      <span>{location}</span>
                      <button
                        onClick={() => removeLocation(location)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Job Types</Label>
                <div className="space-y-2">
                  {[
                    { id: "full-time", label: "Full-time" },
                    { id: "remote", label: "Remote" },
                    { id: "hybrid", label: "Hybrid" },
                    { id: "contract", label: "Contract" },
                  ].map((type) => (
                    <div key={type.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={type.id}
                        checked={preferences.jobTypes.includes(type.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setPreferences(prev => ({
                              ...prev,
                              jobTypes: [...prev.jobTypes, type.id]
                            }));
                          } else {
                            setPreferences(prev => ({
                              ...prev,
                              jobTypes: prev.jobTypes.filter(t => t !== type.id)
                            }));
                          }
                        }}
                      />
                      <Label htmlFor={type.id}>{type.label}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Salary & Keywords */}
          <Card className="shadow-card border-0">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Briefcase className="h-5 w-5" />
                <span>Salary & Keywords</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Salary Range (LPA)</Label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="salary-min" className="text-sm text-muted-foreground">
                      Min
                    </Label>
                    <Input
                      id="salary-min"
                      type="number"
                      value={preferences.salaryRange.min}
                      onChange={(e) => setPreferences(prev => ({
                        ...prev,
                        salaryRange: { ...prev.salaryRange, min: e.target.value }
                      }))}
                      placeholder="15"
                    />
                  </div>
                  <div>
                    <Label htmlFor="salary-max" className="text-sm text-muted-foreground">
                      Max
                    </Label>
                    <Input
                      id="salary-max"
                      type="number"
                      value={preferences.salaryRange.max}
                      onChange={(e) => setPreferences(prev => ({
                        ...prev,
                        salaryRange: { ...prev.salaryRange, max: e.target.value }
                      }))}
                      placeholder="30"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="keywords">Skills & Keywords</Label>
                <Textarea
                  id="keywords"
                  value={preferences.keywords}
                  onChange={(e) => setPreferences(prev => ({ ...prev, keywords: e.target.value }))}
                  placeholder="Enter skills, technologies, and keywords separated by commas"
                  rows={4}
                />
                <p className="text-sm text-muted-foreground">
                  Help us find better matches by including relevant skills and technologies
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Industries */}
          <Card className="shadow-card border-0">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Industries</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Preferred Industries</Label>
                <div className="space-y-2">
                  {[
                    { id: "technology", label: "Technology" },
                    { id: "fintech", label: "Fintech" },
                    { id: "ecommerce", label: "E-commerce" },
                    { id: "healthcare", label: "Healthcare" },
                    { id: "education", label: "Education" },
                    { id: "consulting", label: "Consulting" },
                  ].map((industry) => (
                    <div key={industry.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={industry.id}
                        checked={preferences.industries.includes(industry.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setPreferences(prev => ({
                              ...prev,
                              industries: [...prev.industries, industry.id]
                            }));
                          } else {
                            setPreferences(prev => ({
                              ...prev,
                              industries: prev.industries.filter(i => i !== industry.id)
                            }));
                          }
                        }}
                      />
                      <Label htmlFor={industry.id}>{industry.label}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <Alert>
                <Clock className="h-4 w-4" />
                <AlertDescription>
                  <strong>Auto-matching frequency:</strong> We'll search for jobs matching your 
                  criteria every 2 hours and automatically apply to the best matches.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-gradient-primary hover:opacity-90 shadow-soft px-8"
        >
          {saving ? "Saving..." : "Save Profile"}
        </Button>
      </div>
    </div>
  );
};

export default ProfileSetup;