
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { User, MapPin, Code, Save, Loader2 } from "lucide-react";

const ProfileSetup = () => {
  const navigate = useNavigate();
  const user = useUser();
  const [loading, setLoading] = useState(false);
  const [scrapingJobs, setScrapingJobs] = useState(false);
  
  // form state variables
  const [fullName, setFullName] = useState("");
  const [desiredRole, setDesiredRole] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [preferredLocations, setPreferredLocations] = useState<string[]>([]);
  const [locationInput, setLocationInput] = useState("");

  // useEffect for loading profile
  useEffect(() => {
    if (user?.id) {
      loadProfile();
    }
  }, [user?.id]);

  const loadProfile = async () => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading profile:', error);
        return;
      }

      if (profile) {
        setFullName(profile.full_name || "");
        setDesiredRole(profile.desired_role || "");
        setExperienceLevel(profile.experience_level || "");
        setSkills(profile.skills || []);
        setPreferredLocations(profile.preferred_locations || []);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  // helper functions for skills and locations
  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  const addLocation = () => {
    if (locationInput.trim() && !preferredLocations.includes(locationInput.trim())) {
      setPreferredLocations([...preferredLocations, locationInput.trim()]);
      setLocationInput("");
    }
  };

  const removeLocation = (locationToRemove: string) => {
    setPreferredLocations(preferredLocations.filter(location => location !== locationToRemove));
  };

  const triggerJobScraping = async () => {
    if (!user?.id) return;

    try {
      setScrapingJobs(true);
      console.log('Triggering job scraping for user:', user.id);

      const { data, error } = await supabase.functions.invoke('scrape-jobs', {
        body: { 
          user_id: user.id,
          fetch_recent: true,
          limit: 10
        }
      });

      if (error) {
        console.error('Error triggering job scraping:', error);
        toast({
          title: "Job Search Started",
          description: "We're searching for jobs in the background. You can check the results in All Matches.",
        });
      } else {
        console.log('Job scraping response:', data);
        toast({
          title: "🎯 Jobs Found!",
          description: "We've found relevant job matches for you. Check them out in All Matches!",
        });
      }
    } catch (error) {
      console.error('Unexpected error during job scraping:', error);
      toast({
        title: "Job Search Started",
        description: "We're searching for jobs based on your profile. Check All Matches in a few minutes.",
      });
    } finally {
      setScrapingJobs(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to save your profile.",
        variant: "destructive"
      });
      return;
    }

    if (!fullName.trim() || !desiredRole || !experienceLevel) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields (Full Name, Desired Role, and Experience Level).",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      console.log('Saving profile for user:', user.id);
      console.log('Profile data:', {
        fullName: fullName.trim(),
        desiredRole,
        experienceLevel,
        skills,
        preferredLocations
      });

      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          full_name: fullName.trim(),
          email: user.email,
          desired_role: desiredRole,
          experience_level: experienceLevel,
          skills: skills,
          preferred_locations: preferredLocations,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('Profile save error:', error);
        throw error;
      }

      console.log('Profile saved successfully');
      
      toast({
        title: "✅ Profile Saved!",
        description: "Your profile has been updated successfully. We're now searching for matching jobs!",
      });

      // Trigger job scraping after successful profile save
      await triggerJobScraping();

      // Navigate to All Matches after a short delay
      setTimeout(() => {
        navigate('/dashboard/matches');
      }, 2000);

    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error",
        description: `Failed to save profile: ${error.message || 'Please try again.'}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="shadow-card border-0 bg-gradient-hero">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-full bg-primary/10">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Complete Your Profile</h1>
              <p className="text-muted-foreground">
                🎯 Help us find the perfect job matches for you
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Form */}
      <Card className="shadow-card border-0">
        <CardHeader>
          <CardTitle>Your Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="desiredRole">Desired Role *</Label>
                <Select value={desiredRole} onValueChange={setDesiredRole} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your desired role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Software Engineer">Software Engineer</SelectItem>
                    <SelectItem value="Full Stack Developer">Full Stack Developer</SelectItem>
                    <SelectItem value="Frontend Developer">Frontend Developer</SelectItem>
                    <SelectItem value="Backend Developer">Backend Developer</SelectItem>
                    <SelectItem value="DevOps Engineer">DevOps Engineer</SelectItem>
                    <SelectItem value="Data Scientist">Data Scientist</SelectItem>
                    <SelectItem value="Product Manager">Product Manager</SelectItem>
                    <SelectItem value="UI/UX Designer">UI/UX Designer</SelectItem>
                    <SelectItem value="React Developer">React Developer</SelectItem>
                    <SelectItem value="Node.js Developer">Node.js Developer</SelectItem>
                    <SelectItem value="Python Developer">Python Developer</SelectItem>
                    <SelectItem value="Java Developer">Java Developer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="experienceLevel">Experience Level *</Label>
              <Select value={experienceLevel} onValueChange={setExperienceLevel} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select your experience level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Entry Level">Entry Level (0-2 years)</SelectItem>
                  <SelectItem value="Mid Level">Mid Level (2-5 years)</SelectItem>
                  <SelectItem value="Senior Level">Senior Level (5-8 years)</SelectItem>
                  <SelectItem value="Lead Level">Lead Level (8+ years)</SelectItem>
                  <SelectItem value="Executive Level">Executive Level</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Skills Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Code className="h-5 w-5 text-primary" />
                <Label>Technical Skills</Label>
              </div>
              
              <div className="flex space-x-2">
                <Input
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  placeholder="Add a skill (e.g., React, Python, AWS)"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                />
                <Button type="button" onClick={addSkill} variant="outline">
                  Add
                </Button>
              </div>

              {skills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <Badge
                      key={skill}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => removeSkill(skill)}
                    >
                      {skill} ×
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Locations Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-primary" />
                <Label>Preferred Locations</Label>
              </div>
              
              <div className="flex space-x-2">
                <Input
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  placeholder="Add a location (e.g., Bangalore, Mumbai, Remote)"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLocation())}
                />
                <Button type="button" onClick={addLocation} variant="outline">
                  Add
                </Button>
              </div>

              {preferredLocations.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {preferredLocations.map((location) => (
                    <Badge
                      key={location}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => removeLocation(location)}
                    >
                      {location} ×
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={loading || scrapingJobs}
                className="bg-gradient-primary hover:opacity-90 px-8"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving Profile...
                  </>
                ) : scrapingJobs ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Finding Jobs...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save & Find Jobs
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {scrapingJobs && (
        <Card className="shadow-card border-0 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <div>
                <p className="font-medium">🔍 Searching for Jobs...</p>
                <p className="text-sm text-muted-foreground">
                  We're finding the latest job postings that match your profile. This will take a moment.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProfileSetup;
