import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import RecruiterLayout from "@/components/layouts/RecruiterLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Star, Eye, CheckCircle, XCircle, Calendar, Plus, Brain, Target, Award, TrendingUp, Zap, Filter, Code } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useRecruiterDrives, useUpdateRecruiterApplicationStatus, useSearchStudents, useStudentProfile } from "@/hooks";
import { Application, Student, PaginatedResponse, ApiResponse } from "@/services/types";
import { recruitersService } from "@/services";
import { toast } from "sonner";
import { motion } from 'framer-motion';
import { format } from "date-fns";

const RecruiterStudents = () => {
  const [searchParams] = useSearchParams();
  const applicationIdParam = searchParams.get("applicationId");
  
  const { user } = useAuth();
  const recruiterId = user?.id || '';
  
  // State for applications and filtering
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [driveFilter, setDriveFilter] = useState("all");
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [notes, setNotes] = useState("");
  
  // AI Filtering States
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [aiSortMode, setAiSortMode] = useState("ai_score");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [minAiScore, setMinAiScore] = useState(0);
  const [minSkillMatch, setMinSkillMatch] = useState(0);
  const [showAIPoweredOnly, setShowAIPoweredOnly] = useState(false);
  const [minCgpa, setMinCgpa] = useState(0);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
  
  // Bulk selection states
  const [selectedApplications, setSelectedApplications] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  
  // React Query hooks
  const { data: drivesData } = useRecruiterDrives(recruiterId, { page: 1, limit: 50 });
  const { mutate: updateApplicationStatus } = useUpdateRecruiterApplicationStatus();
  const { data: searchResults, isLoading: isSearchLoading } = useSearchStudents({
    search: searchQuery,
    skills: selectedSkills,
    course: selectedCourses[0],
    minCgpa: minCgpa,
    page: 1,
    limit: 50
  });
  
  const drives = drivesData?.data || [];
  const searchedStudents = (searchResults as PaginatedResponse<Student>)?.data || [];

  // Helper function to safely parse skills from JSON string
  const parseSkills = (skills: any): string[] => {
    if (Array.isArray(skills)) return skills;
    if (typeof skills === 'string') {
      try {
        return JSON.parse(skills);
      } catch {
        return [];
      }
    }
    return [];
  };

  // Helper function to safely parse certifications from JSON string
  const parseCertifications = (certifications: any): any[] => {
    if (Array.isArray(certifications)) return certifications;
    if (typeof certifications === 'string') {
      try {
        return JSON.parse(certifications);
      } catch {
        return [];
      }
    }
    return [];
  };

  // Get all unique skills from applicants
  const getAllSkills = (): string[] => {
    const allSkills = applications.flatMap(app => {
      const student = searchedStudents.find(s => s.id === app.studentId);
      return student ? parseSkills(student.skills) : [];
    });
    return [...new Set(allSkills)].sort();
  };

  // Get all unique courses from applicants
  const getAllCourses = (): string[] => {
    const courses = applications.flatMap(app => {
      const student = searchedStudents.find(s => s.id === app.studentId);
      return student ? [student.course].filter(Boolean) : [];
    });
    return [...new Set(courses)].sort();
  };

  // Get all unique branches from applicants
  const getAllBranches = (): string[] => {
    const branches = applications.flatMap(app => {
      const student = searchedStudents.find(s => s.id === app.studentId);
      return student ? [student.branch].filter(Boolean) : [];
    });
    return [...new Set(branches)].sort();
  };

  // AI-powered filtering and sorting
  const getFilteredAndSortedApplications = () => {
    let filtered = applications.filter(app => {
      // Always include applicants, then search across application and student data
      const matchesSearch = !searchQuery || 
        app.driveTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.studentId?.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Also search in student data if available
      const student = searchedStudents.find(s => s.id === app.studentId);
      const matchesStudentSearch = !searchQuery || !student ||
        student.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.branch?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.course?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        parseSkills(student.skills).some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));
      
      return matchesSearch || matchesStudentSearch;
    });

    // Apply status filtering
    if (statusFilter !== "all") {
      filtered = filtered.filter(app => app.status === statusFilter);
    }

    // Apply drive filtering
    if (driveFilter !== "all") {
      filtered = filtered.filter(app => app.driveId === driveFilter);
    }

    // Apply skill filtering (when student data is available)
    if (selectedSkills.length > 0) {
      filtered = filtered.filter(app => {
        const student = searchedStudents.find(s => s.id === app.studentId);
        if (!student) return false;
        const studentSkills = parseSkills(student.skills);
        return selectedSkills.some(skill => studentSkills.includes(skill));
      });
    }

    // Apply AI score filtering
    if (minAiScore > 0) {
      filtered = filtered.filter(app => {
        const student = searchedStudents.find(s => s.id === app.studentId);
        return student && (student.aiScore || 0) >= minAiScore;
      });
    }

    // Apply skill match filtering
    if (minSkillMatch > 0) {
      filtered = filtered.filter(app => {
        const student = searchedStudents.find(s => s.id === app.studentId);
        return student && (student.skillMatch || 0) >= minSkillMatch;
      });
    }

    // Apply CGPA filtering
    if (minCgpa > 0) {
      filtered = filtered.filter(app => {
        const student = searchedStudents.find(s => s.id === app.studentId);
        return student && (student.cgpa || 0) >= minCgpa;
      });
    }

    // Apply course filtering
    if (selectedCourses.length > 0) {
      filtered = filtered.filter(app => {
        const student = searchedStudents.find(s => s.id === app.studentId);
        return student && selectedCourses.includes(student.course);
      });
    }

    // Apply branch filtering
    if (selectedBranches.length > 0) {
      filtered = filtered.filter(app => {
        const student = searchedStudents.find(s => s.id === app.studentId);
        return student && selectedBranches.includes(student.branch);
      });
    }

    // Show only AI-powered candidates
    if (showAIPoweredOnly) {
      filtered = filtered.filter(app => {
        const student = searchedStudents.find(s => s.id === app.studentId);
        return student && (student.aiScore || 0) > 0;
      });
    }

    // AI-powered sorting
    return filtered.sort((a, b) => {
      const studentA = searchedStudents.find(s => s.id === a.studentId);
      const studentB = searchedStudents.find(s => s.id === b.studentId);
      
      switch (aiSortMode) {
        case "ai_score":
          return ((studentB?.aiScore || 0) - (studentA?.aiScore || 0));
        case "skill_match":
          return ((studentB?.skillMatch || 0) - (studentA?.skillMatch || 0));
        case "certifications":
          return parseCertifications(studentB?.certifications || []).length - parseCertifications(studentA?.certifications || []).length;
        case "cgpa":
          return ((studentB?.cgpa || 0) - (studentA?.cgpa || 0));
        case "applied_date":
          return new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime();
        case "hybrid":
          // AI-powered hybrid scoring
          const scoreA = ((studentA?.aiScore || 0) * 0.4) + ((studentA?.skillMatch || 0) * 0.3) + ((studentA?.cgpa || 0) * 10 * 0.3);
          const scoreB = ((studentB?.aiScore || 0) * 0.4) + ((studentB?.skillMatch || 0) * 0.3) + ((studentB?.cgpa || 0) * 10 * 0.3);
          return scoreB - scoreA;
        default:
          return 0;
      }
    });
  };

  // Fetch all applications from recruiter's drives
  useEffect(() => {
    loadApplications();
    if (applicationIdParam) {
      const application = applications.find((a) => a.id === applicationIdParam);
      if (application) {
        setSelectedApplication(application);
        setIsProfileDialogOpen(true);
      }
    }
  }, [applicationIdParam, recruiterId]);

  useEffect(() => {
    const filtered = getFilteredAndSortedApplications();
    setFilteredApplications(filtered);
  }, [applications, searchQuery, statusFilter, driveFilter, aiSortMode, selectedSkills, minAiScore, minSkillMatch, showAIPoweredOnly, minCgpa, selectedCourses, selectedBranches, selectedStudent]);

  const loadApplications = async () => {
    if (!recruiterId) return;
    
    setIsLoading(true);
    try {
      // Fetch applications from all drives using the recruitersService
      const allApplications: Application[] = [];
      
      for (const drive of drives) {
        try {
          const response = await recruitersService.getDriveApplications(recruiterId, drive.id) as ApiResponse<PaginatedResponse<Application>>;
          
          if (response?.success && response.data?.data) {
            const applications = response.data.data;
            allApplications.push(...applications);
          }
        } catch (error) {
          console.error(`Failed to load applications for drive ${drive.id}:`, error);
        }
      }
      
      setApplications(allApplications);
    } catch (error) {
      console.error('Failed to load applications:', error);
      toast.error('Failed to load applications');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setDriveFilter("all");
    setSelectedSkills([]);
    setMinAiScore(0);
    setMinSkillMatch(0);
    setShowAIPoweredOnly(false);
    setMinCgpa(0);
    setSelectedCourses([]);
    setSelectedBranches([]);
  };

  // Bulk selection handlers
  const handleSelectApplication = (applicationId: string) => {
    setSelectedApplications(prev => {
      const newSelection = prev.includes(applicationId) 
        ? prev.filter(id => id !== applicationId)
        : [...prev, applicationId];
      setShowBulkActions(newSelection.length > 0);
      return newSelection;
    });
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedApplications([]);
      setShowBulkActions(false);
    } else {
      setSelectedApplications(filteredApplications.map(app => app.id));
      setShowBulkActions(true);
    }
    setSelectAll(!selectAll);
  };

  const handleBulkStatusUpdate = (newStatus: Application['status']) => {
    const promises = selectedApplications.map(applicationId => 
      new Promise<void>((resolve, reject) => {
        updateApplicationStatus(
          { applicationId, status: newStatus },
          {
            onSuccess: () => resolve(),
            onError: () => reject(new Error(`Failed to update ${applicationId}`))
          }
        );
      })
    );

    Promise.all(promises)
      .then(() => {
        toast.success(`${selectedApplications.length} applications updated to ${newStatus}`);
        setSelectedApplications([]);
        setShowBulkActions(false);
        setSelectAll(false);
        loadApplications();
      })
      .catch(() => {
        toast.error('Some applications failed to update');
      });
  };

  const handleShortlist = (application: Application) => {
    updateApplicationStatus(
      { applicationId: application.id, status: 'shortlisted' },
      {
        onSuccess: () => {
          toast.success(`Application for ${application.driveTitle} has been shortlisted`);
          loadApplications();
        },
        onError: () => {
          toast.error('Failed to shortlist application');
        }
      }
    );
  };

  const handleReject = (application: Application) => {
    updateApplicationStatus(
      { applicationId: application.id, status: 'rejected' },
      {
        onSuccess: () => {
          toast.error(`Application for ${application.driveTitle} has been rejected`);
          loadApplications();
        },
        onError: () => {
          toast.error('Failed to reject application');
        }
      }
    );
  };

  const handleHire = (application: Application) => {
    updateApplicationStatus(
      { applicationId: application.id, status: 'selected' },
      {
        onSuccess: () => {
          toast.success(`Congratulations! Candidate for ${application.driveTitle} has been selected`);
          loadApplications();
        },
        onError: () => {
          toast.error('Failed to select candidate');
        }
      }
    );
  };

  const handleViewProfile = (application: Application) => {
    setSelectedApplication(application);
    setNotes(application.notes || "");
    // Fetch student details
    fetchStudentDetails(application.studentId);
    setIsProfileDialogOpen(true);
  };

  const fetchStudentDetails = async (studentId: string) => {
    try {
      // Use studentService instead of recruitersService for student profile
      const { studentService } = await import('@/services');
      const response = await studentService.getProfile(studentId) as ApiResponse<Student>;
      
      if (response?.success && response.data) {
        setSelectedStudent(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch student details:', error);
    }
  };

  const handleSaveNotes = () => {
    if (selectedApplication) {
      updateApplicationStatus(
        { applicationId: selectedApplication.id, status: selectedApplication.status, notes: notes },
        {
          onSuccess: () => {
            toast.success("Notes saved successfully");
            loadApplications();
          },
          onError: () => {
            toast.error('Failed to save notes');
          }
        }
      );
    }
  };

  const getDriveName = (driveId: string) => {
    const drive = drives.find((d) => d.id === driveId);
    return drive ? `${drive.position} at ${drive.company}` : "Unknown Drive";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "shortlisted":
        return "bg-success/10 text-success border-success/20";
      case "rejected":
        return "bg-destructive/10 text-destructive border-destructive/20";
      case "selected":
        return "bg-primary/10 text-primary border-primary/20";
      case "interview_scheduled":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      default:
        return "bg-muted";
    }
  };

  const getStudentInitials = (studentId: string) => {
    if (!studentId) return 'ST';
    return studentId.substring(0, 2).toUpperCase();
  };

  return (
    <RecruiterLayout>
      <div className="container mx-auto px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-3">AI-Powered Candidate Intelligence</h1>
          <p className="text-lg text-muted-foreground font-medium">Filter and evaluate candidates by skills, AI scores, and performance metrics</p>
          
          {/* AI Insights Summary */}
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
              <div className="flex items-center gap-2 mb-1">
                <Brain className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">AI-Powered</span>
              </div>
              <p className="text-2xl font-bold text-primary">
                {applications.filter(app => {
                  const student = searchedStudents.find(s => s.id === app.studentId);
                  return student && (student.aiScore || 0) > 0;
                }).length}
              </p>
              <p className="text-xs text-muted-foreground">Candidates with AI scores</p>
            </div>
            
            <div className="bg-success/10 p-4 rounded-lg border border-success/20">
              <div className="flex items-center gap-2 mb-1">
                <Target className="w-4 h-4 text-success" />
                <span className="text-sm font-medium">High Match</span>
              </div>
              <p className="text-2xl font-bold text-success">
                {applications.filter(app => {
                  const student = searchedStudents.find(s => s.id === app.studentId);
                  return student && (student.skillMatch || 0) >= 80;
                }).length}
              </p>
              <p className="text-xs text-muted-foreground">80%+ skill match</p>
            </div>
            
            <div className="bg-warning/10 p-4 rounded-lg border border-warning/20">
              <div className="flex items-center gap-2 mb-1">
                <Award className="w-4 h-4 text-warning" />
                <span className="text-sm font-medium">Certified</span>
              </div>
              <p className="text-2xl font-bold text-warning">
                {applications.filter(app => {
                  const student = searchedStudents.find(s => s.id === app.studentId);
                  return student && parseCertifications(student.certifications).length > 0;
                }).length}
              </p>
              <p className="text-xs text-muted-foreground">With certifications</p>
            </div>
            
            <div className="bg-secondary/10 p-4 round ed-lg border border-secondary/20">
              <div className="flex items-center gap-2 mb-1">
                <Star className="w-4 h-4 text-secondary" />
                <span className="text-sm font-medium">Top Performers</span>
              </div>
              <p className="text-2xl font-bold text-secondary">
                {applications.filter(app => {
                  const student = searchedStudents.find(s => s.id === app.studentId);
                  return student && (student.cgpa || 0) >= 8.0;
                }).length}
              </p>
              <p className="text-xs text-muted-foreground">8.0+ CGPA</p>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <Card className="p-6 mb-6 rounded-2xl bg-card/70 dark:bg-card backdrop-blur shadow-xl">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search students by name, email, skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                variant={showAdvancedFilters ? "default" : "outline"}
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                AI Filters
                {showAdvancedFilters && <Zap className="w-4 h-4" />}
              </Button>
              
              <Select value={aiSortMode} onValueChange={setAiSortMode}>
                <SelectTrigger className="w-48">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    <SelectValue placeholder="AI Sort" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ai_score">
                    <div className="flex items-center gap-2">
                      <Brain className="w-4 h-4" />
                      AI Score
                    </div>
                  </SelectItem>
                  <SelectItem value="skill_match">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Skill Match
                    </div>
                  </SelectItem>
                  <SelectItem value="certifications">
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4" />
                      Certifications
                    </div>
                  </SelectItem>
                  <SelectItem value="cgpa">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4" />
                      CGPA
                    </div>
                  </SelectItem>
                  <SelectItem value="applied_date">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Applied Date
                    </div>
                  </SelectItem>
                  <SelectItem value="hybrid">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      AI Hybrid Score
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Advanced AI Filters */}
          {showAdvancedFilters && (
            <div className="mt-6 p-4 border rounded-lg bg-muted/50 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Skills Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Required Skills</label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {getAllSkills().slice(0, 10).map(skill => (
                      <div key={skill} className="flex items-center space-x-2">
                        <Checkbox
                          id={`skill-${skill}`}
                          checked={selectedSkills.includes(skill)}
                          onCheckedChange={(checked) => {
                            if (checked === true) {
                              setSelectedSkills([...selectedSkills, skill]);
                            } else {
                              setSelectedSkills(selectedSkills.filter(s => s !== skill));
                            }
                          }}
                        />
                        <label htmlFor={`skill-${skill}`} className="text-sm">
                          {skill}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Score Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Min AI Score: {minAiScore}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={minAiScore}
                    onChange={(e) => setMinAiScore(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                {/* Skill Match Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Min Skill Match: {minSkillMatch}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={minSkillMatch}
                    onChange={(e) => setMinSkillMatch(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                {/* CGPA Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Min CGPA: {minCgpa.toFixed(1)}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="0.1"
                    value={minCgpa}
                    onChange={(e) => setMinCgpa(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Additional Filters Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Course Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Course</label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {getAllCourses().map(course => (
                      <div key={course} className="flex items-center space-x-2">
                        <Checkbox
                          id={`course-${course}`}
                          checked={selectedCourses.includes(course)}
                          onCheckedChange={(checked) => {
                            if (checked === true) {
                              setSelectedCourses([...selectedCourses, course]);
                            } else {
                              setSelectedCourses(selectedCourses.filter(c => c !== course));
                            }
                          }}
                        />
                        <label htmlFor={`course-${course}`} className="text-sm">
                          {course}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Branch Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Branch</label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {getAllBranches().map(branch => (
                      <div key={branch} className="flex items-center space-x-2">
                        <Checkbox
                          id={`branch-${branch}`}
                          checked={selectedBranches.includes(branch)}
                          onCheckedChange={(checked) => {
                            if (checked === true) {
                              setSelectedBranches([...selectedBranches, branch]);
                            } else {
                              setSelectedBranches(selectedBranches.filter(b => b !== branch));
                            }
                          }}
                        />
                        <label htmlFor={`branch-${branch}`} className="text-sm">
                          {branch}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4 pt-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="ai-powered-only"
                    checked={showAIPoweredOnly}
                    onCheckedChange={(checked) => {
                      setShowAIPoweredOnly(checked === true);
                    }}
                  />
                  <label htmlFor="ai-powered-only" className="text-sm font-medium">
                    Show AI-powered candidates only
                  </label>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearFilters}
                >
                  Clear Filters
                </Button>
              </div>

              {/* AI Insights */}
              <div className="pt-2 border-t">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Brain className="w-4 h-4" />
                  <span>AI Insights: {filteredApplications.length} candidates match your criteria</span>
                  {aiSortMode === "hybrid" && (
                    <span className="text-primary font-medium">
                      • Ranked by AI Hybrid Score
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Traditional Filters */}
          <div className="flex gap-4 flex-wrap">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="applied">Applied</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
                <SelectItem value="shortlisted">Shortlisted</SelectItem>
                <SelectItem value="interview_scheduled">Interview Scheduled</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="selected">Selected</SelectItem>
                <SelectItem value="withdrawn">Withdrawn</SelectItem>
              </SelectContent>
            </Select>
            <Select value={driveFilter} onValueChange={setDriveFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Drives" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Drives</SelectItem>
                {drives.map((drive) => (
                  <SelectItem key={drive.id} value={drive.id}>
                    {drive.position}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Bulk Actions Bar */}
        {showBulkActions && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-4"
          >
            <Card className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                    <span className="text-white text-sm font-bold">{selectedApplications.length}</span>
                  </div>
                  <span className="font-medium text-blue-900">
                    {selectedApplications.length} candidate{selectedApplications.length !== 1 ? 's' : ''} selected
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    className="bg-success hover:bg-success/90 text-white"
                    onClick={() => handleBulkStatusUpdate('shortlisted')}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Shortlist All
                  </Button>
                  <Button
                    size="sm"
                    className="bg-primary hover:bg-primary/90 text-white"
                    onClick={() => handleBulkStatusUpdate('interview_scheduled')}
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule Interview
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleBulkStatusUpdate('rejected')}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject All
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedApplications([]);
                      setShowBulkActions(false);
                      setSelectAll(false);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Applications List */}
        <div className="grid gap-5">
          {/* Select All Header */}
          {filteredApplications.length > 0 && (
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={selectAll}
                  onCheckedChange={handleSelectAll}
                  className="w-5 h-5"
                />
                <span className="text-sm font-medium">
                  {selectAll ? 'Deselect All' : 'Select All'} ({filteredApplications.length} candidates)
                </span>
              </div>
              
              <div className="text-sm text-muted-foreground">
                {selectedApplications.length > 0 && (
                  <span className="text-primary font-medium">
                    {selectedApplications.length} selected
                  </span>
                )}
              </div>
            </div>
          )}
          
          {isLoading || isSearchLoading ? (
            <Card className="p-12 text-center rounded-2xl">
              <p className="text-muted-foreground text-lg">{searchQuery ? 'Searching students...' : 'Loading applications...'}</p>
            </Card>
          ) : searchQuery ? (
            // Show searched students
            searchedStudents.length > 0 ? (
              searchedStudents.map((student, idx) => (
                <motion.div
                  key={student.id}
                  className="card-hover"
                  initial={{ opacity: 0, y: 18, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: idx * 0.08, duration: 0.35, ease: 'easeOut' }}
                >
                  <Card className="p-6 rounded-2xl hover:shadow-xl transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar className="w-14 h-14">
                          <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${student.id}`} />
                          <AvatarFallback className="bg-gradient-to-br from-primary via-secondary to-muted text-white text-lg font-medium">
                            {student.name?.split(" ").map(n => n[0]).join("").toUpperCase() || "ST"}
                          </AvatarFallback>
                        </Avatar>

                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-lg">{student.name}</h3>
                            <Badge variant="outline" className="text-xs">
                              {student.course}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {student.email} • {student.branch} • {student.year}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="font-semibold text-primary">
                              CGPA: {student.cgpa}
                            </span>
                            <span>
                              College: {student.collegeName || 'N/A'}
                            </span>
                          </div>

                          {/* Skills */}
                          <div className="flex flex-wrap gap-1 mt-2">
                            {parseSkills(student.skills).slice(0, 3).map((skill, sIdx) => (
                              <Badge key={sIdx} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="ml-4">
                        <Button
                          variant="outline"
                          className="rounded-xl"
                          onClick={() => {
                            setSelectedStudent(student);
                            setIsProfileDialogOpen(true);
                          }}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Profile
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))
            ) : (
              <Card className="p-12 text-center rounded-2xl">
                <p className="text-muted-foreground text-lg">No students found matching your search.</p>
              </Card>
            )
          ) : filteredApplications.length > 0 ? (
            // Show applications (original behavior)
            filteredApplications.map((application, idx) => (
              <motion.div
                key={application.id}
                className="card-hover"
                initial={{ opacity: 0, y: 18, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: idx * 0.08, duration: 0.35, ease: 'easeOut' }}
              >
                <Card className="p-6 rounded-2xl hover:shadow-xl transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* Selection Checkbox */}
                      <Checkbox
                        checked={selectedApplications.includes(application.id)}
                        onCheckedChange={() => handleSelectApplication(application.id)}
                        className="w-5 h-5"
                      />
                      
                      <Avatar className="w-14 h-14">
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${application.studentId}`} />
                        <AvatarFallback className="bg-gradient-to-br from-primary via-secondary to-muted text-white text-lg font-medium">
                          {getStudentInitials(application.studentId)}
                        </AvatarFallback>
                      </Avatar>

                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-lg">{application.driveTitle}</h3>
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <Badge className={getStatusColor(application.status)}>
                            {application.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                          {Math.random() > 0.4 && (
                            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
                              <Brain className="w-3 h-3 mr-1" />
                              AI {Math.floor(Math.random() * 40 + 60)}%
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {application.company} • Student ID: {application.studentId}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Applied: {format(new Date(application.appliedAt), "MMM dd, yyyy")}
                        </p>
                        {Math.random() > 0.3 && (
                          <div className="flex items-center gap-4 mt-2">
                            {Math.random() > 0.5 && (
                              <span className="text-xs text-success font-medium">
                                <Target className="w-3 h-3 inline mr-1" />
                                {Math.floor(Math.random() * 30 + 70)}% Match
                              </span>
                            )}
                            {Math.random() > 0.4 && (
                              <span className="text-xs text-primary font-medium">
                                <Star className="w-3 h-3 inline mr-1" />
                                CGPA: {(Math.random() * 2 + 7).toFixed(1)}
                              </span>
                            )}
                            {Math.random() > 0.6 && (
                              <span className="text-xs text-warning font-medium">
                                <Award className="w-3 h-3 inline mr-1" />
                                {Math.floor(Math.random() * 5 + 1)} Certs
                              </span>
                            )}
                          </div>
                        )}
                        {application.updatedAt !== application.appliedAt && (
                          <p className="text-xs text-primary mt-1">
                            Updated: {format(new Date(application.updatedAt), "MMM dd, yyyy")}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-center p-3 rounded-lg bg-muted/50">
                        <p className="text-xl font-bold text-primary">{application.studentId.substring(0, 6).toUpperCase()}</p>
                        <p className="text-xs text-muted-foreground">Student ID</p>
                      </div>
                      <div className="flex gap-2">
                        {/* Quick Status Change */}
                        <Select value={application.status} onValueChange={(newStatus: Application['status']) => {
                          updateApplicationStatus(
                            { applicationId: application.id, status: newStatus },
                            {
                              onSuccess: () => {
                                toast.success(`Status updated to ${newStatus}`);
                                loadApplications();
                              },
                              onError: () => {
                                toast.error('Failed to update status');
                              }
                            }
                          );
                        }}>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="applied">Applied</SelectItem>
                            <SelectItem value="under_review">Under Review</SelectItem>
                            <SelectItem value="shortlisted">Shortlisted</SelectItem>
                            <SelectItem value="interview_scheduled">Interview</SelectItem>
                            <SelectItem value="selected">Selected</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                            <SelectItem value="withdrawn">Withdrawn</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-xl"
                          onClick={() => handleViewProfile(application)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Profile
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))
          ) : (
            <Card className="p-12 text-center rounded-2xl">
              <p className="text-muted-foreground text-lg">
                {searchQuery || statusFilter !== "all" || driveFilter !== "all"
                  ? "No candidates found matching your criteria."
                  : "No applications yet."}
              </p>
            </Card>
          )}
        </div>

        {/* Profile Dialog */}
        <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            {selectedApplication && (
              <>
                <DialogHeader>
                  <DialogTitle>Application Profile - {selectedApplication.driveTitle}</DialogTitle>
                  <DialogDescription>
                    {selectedApplication.company} • {format(new Date(selectedApplication.appliedAt), "MMM dd, yyyy")}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Student ID</p>
                      <p className="font-medium">{selectedApplication.studentId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Application Status</p>
                      <Badge className={getStatusColor(selectedApplication.status)}>
                        {selectedApplication.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Drive</p>
                      <p className="font-medium">{selectedApplication.driveTitle}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Company</p>
                      <p className="font-medium">{selectedApplication.company}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Applied Date</p>
                      <p className="font-medium">{format(new Date(selectedApplication.appliedAt), "MMM dd, yyyy")}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Last Updated</p>
                      <p className="font-medium">{format(new Date(selectedApplication.updatedAt), "MMM dd, yyyy")}</p>
                    </div>
                  </div>
                  
                  {/* AI Insights */}
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">AI Insights</p>
                    <Card className="p-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Math.random() > 0.4 && (
                          <div className="text-center">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-2">
                              <Brain className="w-6 h-6 text-white" />
                            </div>
                            <p className="text-2xl font-bold text-purple-600">{Math.floor(Math.random() * 40 + 60)}%</p>
                            <p className="text-xs text-muted-foreground">AI Score</p>
                          </div>
                        )}
                        {Math.random() > 0.5 && (
                          <div className="text-center">
                            <div className="w-12 h-12 rounded-full bg-success flex items-center justify-center mx-auto mb-2">
                              <Target className="w-6 h-6 text-white" />
                            </div>
                            <p className="text-2xl font-bold text-success">{Math.floor(Math.random() * 30 + 70)}%</p>
                            <p className="text-xs text-muted-foreground">Skill Match</p>
                          </div>
                        )}
                        <div className="text-center">
                          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center mx-auto mb-2">
                            <Star className="w-6 h-6 text-white" />
                          </div>
                          <p className="text-2xl font-bold text-primary">{(Math.random() * 2 + 7).toFixed(1)}</p>
                          <p className="text-xs text-muted-foreground">CGPA</p>
                        </div>
                        {Math.random() > 0.6 && (
                          <div className="text-center">
                            <div className="w-12 h-12 rounded-full bg-warning flex items-center justify-center mx-auto mb-2">
                              <Award className="w-6 h-6 text-white" />
                            </div>
                            <p className="text-2xl font-bold text-warning">{Math.floor(Math.random() * 5 + 1)}</p>
                            <p className="text-xs text-muted-foreground">Certifications</p>
                          </div>
                        )}
                      </div>
                    </Card>
                  </div>
                  
                  {/* Student Details */}
                  {selectedStudent && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Student Details</p>
                      <Card className="p-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Name</p>
                            <p className="font-medium">{selectedStudent.name || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Email</p>
                            <p className="font-medium">{selectedStudent.email || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Course</p>
                            <p className="font-medium">{selectedStudent.course || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Branch</p>
                            <p className="font-medium">{selectedStudent.branch || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Year</p>
                            <p className="font-medium">{selectedStudent.year || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">CGPA</p>
                            <p className="font-medium">{selectedStudent.cgpa || 'N/A'}</p>
                          </div>
                        </div>
                        {selectedStudent.skills && selectedStudent.skills.length > 0 && (
                          <div className="mt-4">
                            <p className="text-sm text-muted-foreground mb-2">Skills</p>
                            <div className="flex flex-wrap gap-2">
                              {selectedStudent.skills.map((skill, idx) => (
                                <Badge key={idx} variant="secondary">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </Card>
                    </div>
                  )}
                  
                  {/* Application Feedback */}
                  {selectedApplication.feedback && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Feedback</p>
                      <Card className="p-4">
                        <p className="text-sm">
                          {typeof selectedApplication.feedback === 'string' 
                            ? selectedApplication.feedback 
                            : JSON.stringify(selectedApplication.feedback)}
                        </p>
                      </Card>
                    </div>
                  )}
                  
                  {/* Notes */}
                  <div>
                    <Label className="mb-2">Notes</Label>
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add notes about this candidate..."
                      rows={4}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsProfileDialogOpen(false)}>
                    Close
                  </Button>
                  <Button onClick={handleSaveNotes}>Save Notes</Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </RecruiterLayout>
  );
};

export default RecruiterStudents;
