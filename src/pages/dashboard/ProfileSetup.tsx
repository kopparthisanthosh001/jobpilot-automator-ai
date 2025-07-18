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
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { 
  Upload as UploadIcon, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  X,
  ArrowRight,
  User,
  MapPin, 
  DollarSign, 
  Brain,
  Building,
  Target,
  Info,
  Check,
  Plus,
  ChevronRight,
  Settings,
  Briefcase
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ProfileSetup = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formCompleted, setFormCompleted] = useState(false);
  const { toast } = useToast();

  // Resume upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedResume, setUploadedResume] = useState<string | null>(null);
  const [extractSkills, setExtractSkills] = useState(false);
  
  // Job preferences state
  const [preferences, setPreferences] = useState({
    desiredRole: "",
    locations: [] as string[],
    salaryRange: [15],
    keywords: "",
    industries: [] as string[],
  });
  
  const [newLocation, setNewLocation] = useState("");
  const [saving, setSaving] = useState(false);

  // Popular cities for suggestions
  const popularCities = [
    "Bangalore", "Mumbai", "Delhi", "Hyderabad", "Chennai", "Pune", 
    "Kolkata", "Ahmedabad", "Gurgaon", "Noida", "Remote"
  ];

  // Industry options with icons
  const industryOptions = [
    { id: "technology", label: "Technology", icon: "💻" },
    { id: "fintech", label: "Fintech", icon: "💰" },
    { id: "healthcare", label: "Healthcare", icon: "🏥" },
    { id: "ecommerce", label: "E-commerce", icon: "🛒" },
    { id: "education", label: "Education", icon: "📚" },
    { id: "consulting", label: "Consulting", icon: "💼" },
    { id: "startup", label: "Startup", icon: "🚀" },
    { id: "enterprise", label: "Enterprise", icon: "🏢" },
  ];

  // Resume upload handlers
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        toast({
          title: "Invalid file type",
          description: "Please select a PDF file only.",
          variant: "destructive",
        });
        return;
      }
      
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast({
          title: "File too large",
          description: "Please select a file smaller than 2MB.",
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
            title: "✅ Resume uploaded and parsed!",
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
  const addLocation = (location: string) => {
    if (location.trim() && !preferences.locations.includes(location.trim())) {
      setPreferences(prev => ({
        ...prev,
        locations: [...prev.locations, location.trim()]
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

  const toggleIndustry = (industryId: string) => {
    setPreferences(prev => ({
      ...prev,
      industries: prev.industries.includes(industryId)
        ? prev.industries.filter(i => i !== industryId)
        : [...prev.industries, industryId]
    }));
  };

  const handleContinueToResume = () => {
    if (!preferences.desiredRole.trim()) {
      toast({
        title: "Required field missing",
        description: "Please enter your desired role to continue.",
        variant: "destructive",
      });
      return;
    }
    
    setCurrentStep(2);
    // Auto-scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCompleteSetup = async () => {
    setSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      setSaving(false);
      setFormCompleted(true);
      toast({
        title: "🎉 Setup Complete!",
        description: "Your profile is ready. We'll start finding matching jobs for you.",
      });
      
      // Auto-scroll to top to show completion message
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 1000);
  };

  const isStep1Valid = preferences.desiredRole.trim().length > 0;

  if (formCompleted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md mx-auto shadow-elegant border-0">
          <CardContent className="p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-8 h-8 text-success" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold">Setup Complete!</h1>
              <p className="text-muted-foreground">
                Your profile is ready. We'll start finding matching jobs for you every 2 hours.
              </p>
            </div>
            <Button 
              onClick={() => window.location.href = '/dashboard'} 
              className="w-full bg-gradient-primary hover:opacity-90"
            >
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Complete Your Profile</h1>
          <p className="text-muted-foreground text-lg">
            Let's set up your job preferences and resume for better matching
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
              currentStep >= 1 ? 'bg-primary border-primary text-primary-foreground' : 'border-muted-foreground text-muted-foreground'
            }`}>
              {currentStep > 1 ? <Check className="w-5 h-5" /> : <span className="font-semibold">1</span>}
            </div>
            <span className={`text-sm font-medium ${currentStep >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
              Job Preferences
            </span>
            
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
            
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
              currentStep >= 2 ? 'bg-primary border-primary text-primary-foreground' : 'border-muted-foreground text-muted-foreground'
            }`}>
              <span className="font-semibold">2</span>
            </div>
            <span className={`text-sm font-medium ${currentStep >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
              Resume Upload
            </span>
          </div>
        </div>

        {/* Step 1: Job Preferences */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-fade-in">
            <Card className="shadow-elegant border-0">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-primary" />
                  <span>Step 1 of 2 – Job Preferences</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Desired Role */}
                <div className="space-y-2">
                  <Label htmlFor="desired-role" className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>Desired Role *</span>
                  </Label>
                  <Input
                    id="desired-role"
                    value={preferences.desiredRole}
                    onChange={(e) => setPreferences(prev => ({ ...prev, desiredRole: e.target.value }))}
                    placeholder="e.g., Product Manager"
                    className="text-base"
                  />
                  <p className="text-sm text-muted-foreground">
                    This helps us find the most relevant job opportunities for you
                  </p>
                </div>

                <Separator />

                {/* Preferred Locations */}
                <div className="space-y-4">
                  <Label className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4" />
                    <span>Preferred Locations</span>
                  </Label>
                  
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {popularCities.map((city) => (
                        <Button
                          key={city}
                          variant={preferences.locations.includes(city) ? "default" : "outline"}
                          size="sm"
                          onClick={() => preferences.locations.includes(city) ? removeLocation(city) : addLocation(city)}
                          className="text-sm"
                        >
                          {city}
                        </Button>
                      ))}
                    </div>
                    
                    <div className="flex space-x-2">
                      <Input
                        value={newLocation}
                        onChange={(e) => setNewLocation(e.target.value)}
                        placeholder="Add custom location"
                        onKeyPress={(e) => e.key === 'Enter' && addLocation(newLocation)}
                        className="flex-1"
                      />
                      <Button 
                        onClick={() => addLocation(newLocation)} 
                        variant="outline" 
                        size="sm"
                        disabled={!newLocation.trim()}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {preferences.locations.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
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
                  )}
                </div>

                <Separator />

                {/* Expected Salary */}
                <div className="space-y-4">
                  <Label className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4" />
                    <span>Expected Salary (LPA)</span>
                  </Label>
                  
                  <div className="space-y-3">
                    <div className="px-4">
                      <Slider
                        value={preferences.salaryRange}
                        onValueChange={(value) => setPreferences(prev => ({ ...prev, salaryRange: value }))}
                        max={100}
                        min={0}
                        step={1}
                        className="w-full"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>₹0 LPA</span>
                      <div className="font-semibold text-primary text-base">
                        ₹{preferences.salaryRange[0]} LPA
                      </div>
                      <span>₹100+ LPA</span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Skills & Keywords */}
                <div className="space-y-2">
                  <Label htmlFor="keywords" className="flex items-center space-x-2">
                    <Brain className="h-4 w-4" />
                    <span>Skills & Keywords</span>
                  </Label>
                  <Textarea
                    id="keywords"
                    value={preferences.keywords}
                    onChange={(e) => setPreferences(prev => ({ ...prev, keywords: e.target.value }))}
                    placeholder="e.g., JavaScript, React, Product Management, Data Analysis"
                    rows={3}
                    className="text-base"
                  />
                  <p className="text-sm text-muted-foreground">
                    Add at least 3 keywords to improve job matching accuracy
                  </p>
                </div>

                <Separator />

                {/* Preferred Industries */}
                <div className="space-y-4">
                  <Label className="flex items-center space-x-2">
                    <Building className="h-4 w-4" />
                    <span>Preferred Industries</span>
                  </Label>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {industryOptions.map((industry) => (
                      <div
                        key={industry.id}
                        onClick={() => toggleIndustry(industry.id)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md ${
                          preferences.industries.includes(industry.id)
                            ? 'border-primary bg-primary/5 shadow-sm'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{industry.icon}</span>
                          <span className="font-medium">{industry.label}</span>
                          {preferences.industries.includes(industry.id) && (
                            <Check className="h-4 w-4 text-primary ml-auto" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Continue Button - Sticky on Mobile */}
            <div className="sticky bottom-0 bg-background/80 backdrop-blur-md border-t p-4 -mx-4 md:relative md:bg-transparent md:border-0 md:p-0 md:mx-0">
              <Button
                onClick={handleContinueToResume}
                disabled={!isStep1Valid}
                className="w-full bg-gradient-primary hover:opacity-90 shadow-elegant h-12 text-base font-semibold"
              >
                Continue to Resume Upload
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Resume Upload */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-fade-in">
            <Card className="shadow-elegant border-0">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2">
                  <UploadIcon className="h-5 w-5 text-primary" />
                  <span>Step 2 of 2 – Resume Upload</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {!uploadedResume ? (
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-border rounded-lg p-8 text-center space-y-4 hover:border-primary/50 transition-colors">
                      <UploadIcon className="h-12 w-12 text-muted-foreground mx-auto" />
                      <div className="space-y-2">
                        <p className="text-lg font-medium">Upload your resume</p>
                        <p className="text-sm text-muted-foreground">
                          PDF format only, max size 2MB, ATS-friendly preferred
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
                          className="max-w-xs mx-auto border-2 border-primary border-dashed bg-primary/5 hover:bg-primary/10 hover:border-primary/80 transition-all duration-200 p-4 rounded-lg cursor-pointer focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                    </div>

                    {selectedFile && (
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3 p-4 bg-muted/30 rounded-lg">
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

                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="extract-skills"
                            checked={extractSkills}
                            onCheckedChange={(checked) => setExtractSkills(checked === true)}
                          />
                          <Label htmlFor="extract-skills" className="text-sm">
                            Extract skills from resume automatically
                          </Label>
                        </div>

                        {uploading && (
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Uploading...</span>
                              <span>{uploadProgress}%</span>
                            </div>
                            <Progress value={uploadProgress} className="h-2" />
                          </div>
                        )}

                        <Button
                          onClick={handleUpload}
                          disabled={uploading}
                          className="w-full bg-gradient-primary hover:opacity-90 h-12 text-base font-semibold"
                        >
                          {uploading ? "Uploading..." : "Upload Resume"}
                          <UploadIcon className="ml-2 h-5 w-5" />
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Alert className="border-success/20 bg-success/5">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <AlertDescription className="text-success">
                        ✅ Resume Uploaded Successfully
                      </AlertDescription>
                    </Alert>

                    <div className="flex items-center space-x-3 p-4 bg-success/10 border border-success/20 rounded-lg">
                      <FileText className="h-6 w-6 text-success" />
                      <div className="flex-1">
                        <p className="font-medium text-success">{uploadedResume}</p>
                        <p className="text-sm text-muted-foreground">
                          Uploaded on {new Date().toLocaleDateString()} • {(2.1).toFixed(1)} MB
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

            {/* Complete Setup Button - Sticky on Mobile */}
            <div className="sticky bottom-0 bg-background/80 backdrop-blur-md border-t p-4 -mx-4 md:relative md:bg-transparent md:border-0 md:p-0 md:mx-0">
              <div className="flex space-x-3">
                <Button
                  onClick={() => setCurrentStep(1)}
                  variant="outline"
                  className="flex-1 md:flex-none md:w-auto"
                >
                  Back
                </Button>
                <Button
                  onClick={handleCompleteSetup}
                  disabled={saving}
                  className="flex-1 bg-gradient-primary hover:opacity-90 shadow-elegant h-12 text-base font-semibold"
                >
                  {saving ? "Saving..." : "Complete Setup"}
                  <Check className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileSetup;