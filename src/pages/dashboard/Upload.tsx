import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { 
  Upload as UploadIcon, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  X
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Upload = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedResume, setUploadedResume] = useState<string | null>("Product_Manager_Resume.pdf"); // Mock existing resume
  const { toast } = useToast();

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

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Upload Resume</h1>
        <p className="text-muted-foreground text-lg">
          Upload your resume to start receiving automatic job applications
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Upload Section */}
        <Card className="shadow-card border-0">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <UploadIcon className="h-5 w-5" />
              <span>Resume Upload</span>
            </CardTitle>
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

        {/* Guidelines */}
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
  );
};

export default Upload;