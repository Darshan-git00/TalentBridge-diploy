import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import StudentLayout from "@/components/layouts/StudentLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Mail, Phone, Edit, X, Plus, Brain, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { ResumeUpload } from "@/components/ResumeUpload";
import { ParsedResume } from "@/lib/resumeParser";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useStudentProfile, useUpdateStudentProfile } from "@/hooks/useStudents";
import { Student } from "@/services/types";

const StudentProfile = () => {
  const location = useLocation();
  const isEditMode = location.pathname.includes("/edit");
  const { user } = useAuth();
  
  // Real API hooks
  const { data: studentProfile, isLoading, error } = useStudentProfile(user?.id);
  const updateProfileMutation = useUpdateStudentProfile();
  
  const [isEditing, setIsEditing] = useState(isEditMode);
  const [editedProfile, setEditedProfile] = useState<Partial<Student>>({});
  const [newSkill, setNewSkill] = useState("");
  const [newCertification, setNewCertification] = useState({ name: "", issuer: "", year: "" });
  const [showResumeUpload, setShowResumeUpload] = useState(false);

  // Update edit mode when route changes
  useEffect(() => {
    setIsEditing(isEditMode);
  }, [isEditMode]);

  // Initialize edited profile when data loads
  useEffect(() => {
    if (studentProfile) {
      // Convert backend data to frontend format
      const frontendProfile = {
        ...studentProfile,
        skills: studentProfile.skills ? (tryParseJSON(studentProfile.skills as unknown as string) || []) : [],
        certifications: studentProfile.certifications ? (tryParseJSON(studentProfile.certifications as unknown as string) || []) : [],
      };
      setEditedProfile(frontendProfile);
    }
  }, [studentProfile]);

  // Helper function to safely parse JSON
  const tryParseJSON = (jsonString: string) => {
    try {
      return JSON.parse(jsonString);
    } catch {
      return null;
    }
  };

  const handleSave = async () => {
    if (!user?.id) return;
    
    try {
      // Filter only allowed fields that exist in the backend schema
      const allowedFields = [
        'name', 'email', 'course', 'branch', 'year', 'cgpa',
        'skills', 'certifications', 'resume', 'portfolio', 'linkedinProfile', 'githubProfile'
      ];
      
      const filteredData: any = {};
      allowedFields.forEach(field => {
        if (editedProfile[field] !== undefined) {
          filteredData[field] = editedProfile[field];
        }
      });
      
      // Convert frontend data structure to backend format
      const backendData = {
        ...filteredData,
        skills: editedProfile.skills ? JSON.stringify(editedProfile.skills) : undefined,
        certifications: editedProfile.certifications ? JSON.stringify(editedProfile.certifications) : undefined,
      };
      
      const response = await updateProfileMutation.mutateAsync({
        data: backendData
      });
      
      // Update local state with fresh data from backend (immediate update)
      if (response.data) {
        const frontendProfile = {
          ...response.data,
          skills: response.data.skills ? (tryParseJSON(response.data.skills as unknown as string) || []) : [],
          certifications: response.data.certifications ? (tryParseJSON(response.data.certifications as unknown as string) || []) : [],
        };
        setEditedProfile(frontendProfile);
      }
      
      setIsEditing(false);
      toast.success("Profile updated successfully!");
      if (isEditMode) {
        window.history.pushState({}, "", "/student/profile");
      }
    } catch (error) {
      console.error("Full profile update error:", error);
      toast.error("Failed to update profile");
    }
  };

  const handleCancel = () => {
    setEditedProfile(studentProfile || {});
    setIsEditing(false);
    if (isEditMode) {
      window.history.pushState({}, "", "/student/profile");
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !editedProfile.skills?.includes(newSkill.trim())) {
      setEditedProfile({
        ...editedProfile,
        skills: [...(editedProfile.skills || []), newSkill.trim()],
      });
      setNewSkill("");
    }
  };

  const removeSkill = (skill: string) => {
    setEditedProfile({
      ...editedProfile,
      skills: editedProfile.skills?.filter((s) => s !== skill) || [],
    });
  };

  const addCertification = () => {
    if (newCertification.name.trim() && newCertification.issuer.trim() && newCertification.year.trim()) {
      const newCert = {
        id: Date.now().toString(), // Temporary ID, backend will generate real one
        name: newCertification.name.trim(),
        issuer: newCertification.issuer.trim(),
        year: newCertification.year.trim()
      };
      
      setEditedProfile({
        ...editedProfile,
        certifications: [...(editedProfile.certifications || []), newCert],
      });
      setNewCertification({ name: "", issuer: "", year: "" });
    }
  };

  const removeCertification = (index: number) => {
    setEditedProfile({
      ...editedProfile,
      certifications: editedProfile.certifications?.filter((_, i) => i !== index) || [],
    });
  };

  const handleResumeParsed = (parsedResume: ParsedResume) => {
    // Auto-fill profile information from parsed resume
    const updatedProfile = { ...editedProfile };
    
    // Update personal info if empty
    if (!updatedProfile.name) {
      updatedProfile.name = parsedResume.personalInfo.name;
    }
    if (!updatedProfile.email) {
      updatedProfile.email = parsedResume.personalInfo.email;
    }
    if (!updatedProfile.phone) {
      updatedProfile.phone = parsedResume.personalInfo.phone;
    }
    
    // Add technical skills
    const existingSkills = new Set(updatedProfile.skills || []);
    parsedResume.skills.technical.forEach(skill => {
      if (!existingSkills.has(skill)) {
        updatedProfile.skills = [...(updatedProfile.skills || []), skill];
        existingSkills.add(skill);
      }
    });
    
    // Add certifications
    parsedResume.certifications.forEach(cert => {
      const yearMatch = cert.date.match(/\d{4}/);
      const year = yearMatch ? yearMatch[0] : new Date().getFullYear().toString();
      updatedProfile.certifications = [...(updatedProfile.certifications || []), {
        id: Date.now().toString() + Math.random(), // Temporary unique ID
        name: cert.name,
        issuer: cert.issuer,
        year
      }];
    });
    
    setEditedProfile(updatedProfile);
    toast.success("Profile updated with resume data!");
  };

  // Loading state
  if (isLoading) {
    return (
      <StudentLayout>
        <div className="container mx-auto px-8 py-12 max-w-4xl">
          <Card className="p-8 rounded-2xl shadow-xl">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading profile...</p>
            </div>
          </Card>
        </div>
      </StudentLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <StudentLayout>
        <div className="container mx-auto px-8 py-12 max-w-4xl">
          <Card className="p-8 rounded-2xl shadow-xl">
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-semibold">Failed to load profile</h3>
              <p className="text-muted-foreground mt-2">Please try refreshing the page</p>
            </div>
          </Card>
        </div>
      </StudentLayout>
    );
  }

  const displayProfile = isEditing ? editedProfile : (studentProfile ? {
  ...studentProfile,
  skills: studentProfile.skills ? (tryParseJSON(studentProfile.skills as unknown as string) || []) : [],
  certifications: studentProfile.certifications ? (tryParseJSON(studentProfile.certifications as unknown as string) || []) : [],
} : editedProfile); // Fallback to editedProfile if studentProfile is undefined

  return (
    <StudentLayout>
      <div className="container mx-auto px-8 py-12 max-w-4xl">
        <Card className="p-8 rounded-2xl shadow-xl bg-card/80 dark:bg-card backdrop-blur">
          <div className="flex items-start justify-between mb-10">
            <div className="flex items-center gap-6">
              <Avatar className="w-28 h-28 ring-4 ring-primary/20">
                <AvatarFallback className="bg-gradient-to-br from-primary via-secondary to-muted text-white text-3xl font-bold">
                  {(displayProfile.name || user?.name || 'Student').split(" ").map(n => n[0]).join("").toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={editedProfile.name || ''}
                        onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value })}
                        className="max-w-md"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={editedProfile.email || ''}
                        onChange={(e) => setEditedProfile({ ...editedProfile, email: e.target.value })}
                        className="max-w-md"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={editedProfile.phone || ''}
                        onChange={(e) => setEditedProfile({ ...editedProfile, phone: e.target.value })}
                        className="max-w-md"
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <h1 className="text-4xl font-extrabold mb-2">{displayProfile.name || user?.name || 'Student'}</h1>
                    <p className="text-lg text-muted-foreground mb-4 font-medium">
                      {displayProfile.course} {displayProfile.branch} • {displayProfile.year}
                    </p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Mail className="w-4 h-4" />
                        {displayProfile.email}
                      </span>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Phone className="w-4 h-4" />
                        {displayProfile.phone}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
            {!isEditing && (
              <div className="flex gap-2">
                <Link to="/student/profile/edit">
                  <Button variant="outline" className="rounded-xl">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  className="rounded-xl"
                  onClick={() => setShowResumeUpload(true)}
                >
                  Upload Resume
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-8">
            <div>
              <h3 className="font-bold text-xl mb-6">Academic Information</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-5 rounded-xl bg-gradient-to-br from-muted/60 to-muted/30 shadow-md">
                  <p className="text-sm text-muted-foreground mb-2 font-medium">Course</p>
                  {isEditing ? (
                    <Input
                      value={editedProfile.course || ''}
                      onChange={(e) => setEditedProfile({ ...editedProfile, course: e.target.value })}
                    />
                  ) : (
                    <p className="font-bold text-lg">{displayProfile.course}</p>
                  )}
                </div>
                <div className="p-5 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 shadow-md">
                  <p className="text-sm text-muted-foreground mb-2 font-medium">Current CGPA</p>
                  {isEditing ? (
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      value={editedProfile.cgpa}
                      onChange={(e) => setEditedProfile({ ...editedProfile, cgpa: parseFloat(e.target.value) || 0 })}
                    />
                  ) : (
                    <p className="font-extrabold text-primary text-2xl">{displayProfile.cgpa}</p>
                  )}
                </div>
                <div className="p-5 rounded-xl bg-gradient-to-br from-muted/60 to-muted/30 shadow-md">
                  <p className="text-sm text-muted-foreground mb-2 font-medium">Year</p>
                  {isEditing ? (
                    <Input
                      value={editedProfile.year || ''}
                      onChange={(e) => setEditedProfile({ ...editedProfile, year: e.target.value })}
                    />
                  ) : (
                    <p className="font-bold text-lg">{displayProfile.year}</p>
                  )}
                </div>
                <div className="p-5 rounded-xl bg-gradient-to-br from-muted/60 to-muted/30 shadow-md">
                  <p className="text-sm text-muted-foreground mb-2 font-medium">Branch</p>
                  {isEditing ? (
                    <Input
                      value={editedProfile.branch || ''}
                      onChange={(e) => setEditedProfile({ ...editedProfile, branch: e.target.value })}
                    />
                  ) : (
                    <p className="font-bold text-lg">{displayProfile.branch}</p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-xl mb-4">Skills</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {(displayProfile.skills || []).map((skill, idx) => (
                  <Badge key={idx} variant="secondary" className="text-sm px-3 py-1 rounded-lg flex items-center gap-2">
                    {skill}
                    {isEditing && (
                      <button
                        onClick={() => removeSkill(skill)}
                        className="hover:bg-destructive/20 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </Badge>
                ))}
              </div>
              {isEditing && (
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a skill"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addSkill()}
                    className="max-w-xs"
                  />
                  <Button onClick={addSkill} size="sm" variant="outline">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>

            <div>
              <h3 className="font-bold text-xl mb-4">Certifications</h3>
              <div className="space-y-3 mb-4">
                {(displayProfile.certifications || []).map((cert, idx) => (
                  <div key={idx} className="p-5 rounded-xl border border-border/60 bg-gradient-to-r from-white to-muted/20 shadow-md flex items-center justify-between">
                    <div>
                      <h4 className="font-bold mb-1">{cert.name}</h4>
                      <p className="text-sm text-muted-foreground">{cert.issuer} • {cert.year}</p>
                    </div>
                    {isEditing && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCertification(idx)}
                        className="text-destructive"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              {isEditing && (
                <div className="space-y-2 p-4 border border-border rounded-xl bg-muted/30">
                  <div className="grid md:grid-cols-3 gap-2">
                    <Input
                      placeholder="Certification name"
                      value={newCertification.name}
                      onChange={(e) => setNewCertification({ ...newCertification, name: e.target.value })}
                    />
                    <Input
                      placeholder="Issuer"
                      value={newCertification.issuer}
                      onChange={(e) => setNewCertification({ ...newCertification, issuer: e.target.value })}
                    />
                    <Input
                      placeholder="Year"
                      value={newCertification.year}
                      onChange={(e) => setNewCertification({ ...newCertification, year: e.target.value })}
                    />
                  </div>
                  <Button onClick={addCertification} size="sm" variant="outline" className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Certification
                  </Button>
                </div>
              )}
            </div>

            {/* AI Interview Results */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-xl flex items-center gap-2">
                  <Brain className="w-5 h-5 text-primary" />
                  AI Interview Results
                </h3>
                <Link to="/student/ai-interview">
                  <Button size="sm" variant="outline" className="rounded-xl">
                    Take New Interview
                  </Button>
                </Link>
              </div>
              
              {(displayProfile as any).aiInterviewResults && (displayProfile as any).aiInterviewResults.length > 0 ? (
                <div className="space-y-4">
                  {(displayProfile as any).aiInterviewResults.map((result, idx) => (
                    <Card key={idx} className="p-6 rounded-xl border border-border/60 bg-gradient-to-r from-primary/5 to-secondary/5 shadow-md">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-bold text-lg">Interview #{idx + 1}</h4>
                            <Badge variant="outline" className="text-xs">
                              {new Date(result.date).toLocaleDateString()}
                            </Badge>
                            {result.verified && (
                              <Badge className="bg-green-100 text-green-800 text-xs">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Verified
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            Duration: {result.duration} minutes • Type: {result.type}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-bold text-primary mb-1">{result.overallScore}%</div>
                          <p className="text-xs text-muted-foreground">Overall Score</p>
                        </div>
                      </div>
                      
                      <div className="grid md:grid-cols-3 gap-4 mb-4">
                        <div className="text-center p-3 bg-blue-50 rounded-xl">
                          <p className="text-2xl font-bold text-blue-600 mb-1">{result.scores.communication}%</p>
                          <p className="text-xs text-blue-700">Communication</p>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded-xl">
                          <p className="text-2xl font-bold text-green-600 mb-1">{result.scores.problemSolving}%</p>
                          <p className="text-xs text-green-700">Problem Solving</p>
                        </div>
                        <div className="text-center p-3 bg-purple-50 rounded-xl">
                          <p className="text-2xl font-bold text-purple-600 mb-1">{result.scores.technical}%</p>
                          <p className="text-xs text-purple-700">Technical Skills</p>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-semibold">Overall Progress</span>
                          <span className="text-xs text-muted-foreground">({result.overallScore}%)</span>
                        </div>
                        <Progress value={result.overallScore} className="h-2" />
                      </div>
                      
                      {result.feedback && (
                        <div className="space-y-3">
                          <div className="p-3 bg-green-50 rounded-xl">
                            <h5 className="font-semibold text-green-900 mb-2 text-sm">Strengths</h5>
                            <ul className="text-sm text-green-700 space-y-1">
                              {result.feedback.strengths.map((strength, sIdx) => (
                                <li key={sIdx}>• {strength}</li>
                              ))}
                            </ul>
                          </div>
                          <div className="p-3 bg-yellow-50 rounded-xl">
                            <h5 className="font-semibold text-yellow-900 mb-2 text-sm">Areas to Improve</h5>
                            <ul className="text-sm text-yellow-700 space-y-1">
                              {result.feedback.improvements.map((improvement, iIdx) => (
                                <li key={iIdx}>• {improvement}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border/60">
                        <AlertCircle className="w-4 h-4 text-blue-500" />
                        <p className="text-xs text-blue-600">
                          This interview is verified by AI and visible to recruiters and colleges
                        </p>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="p-8 rounded-xl border-2 border-dashed border-border/60 bg-muted/30 text-center">
                  <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h4 className="font-bold text-lg mb-2">No AI Interviews Yet</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Take an AI interview to verify your skills and build credibility with recruiters
                  </p>
                  <Link to="/student/ai-interview">
                    <Button variant="glowPrimary" className="rounded-xl">
                      <Brain className="w-4 h-4 mr-2" />
                      Start Your First Interview
                    </Button>
                  </Link>
                </Card>
              )}
            </div>

            {isEditing && (
              <div className="flex gap-4 pt-4">
                <Button onClick={handleSave} variant="glowPrimary" className="rounded-xl">
                  Save Changes
                </Button>
                <Button onClick={handleCancel} variant="outline" className="rounded-xl">
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </Card>
        
        {/* Resume Upload Modal */}
        {showResumeUpload && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 z-50">
            <div className="bg-background rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold">Resume Analysis</h2>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowResumeUpload(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <ResumeUpload onResumeParsed={handleResumeParsed} />
              </div>
            </div>
          </div>
        )}
      </div>
    </StudentLayout>
  );
};

export default StudentProfile;
