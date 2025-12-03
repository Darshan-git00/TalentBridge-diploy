import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import RecruiterLayout from "@/components/layouts/RecruiterLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, MapPin, Users, Edit, Trash2, Eye, Search, Calendar, Clock, Video, MapPin as MapPinIcon, Brain, Target, Award, Star, CheckCircle, XCircle, Filter, TrendingUp, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { getRecruiterDrives, deleteRecruiterDrive, updateRecruiterDrive, RecruiterDrive, getApplicants } from "@/lib/recruiterStorage";
import { useDriveApplications, useUpdateApplicationStatus, useScheduleInterview, useRecruiterDrives, useUpdateRecruiterApplicationStatus, useStudentProfile } from "@/hooks";
import { StatusChip } from "@/components/ui/StatusChip";
import { InterviewDetailsCard } from "@/components/ui/InterviewDetailsCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { motion } from 'framer-motion';
import { Application, InterviewDetails, Student } from "@/services/types";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { recruitersService } from "@/services";

const RecruiterDrives = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const recruiterId = user?.id || '';
  const [localDrives, setLocalDrives] = useState<RecruiterDrive[]>([]);
  const [filteredDrives, setFilteredDrives] = useState<RecruiterDrive[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedDrive, setSelectedDrive] = useState<RecruiterDrive | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewApplicantsDialogOpen, setIsViewApplicantsDialogOpen] = useState(false);
  const [isScheduleInterviewDialogOpen, setIsScheduleInterviewDialogOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<RecruiterDrive>>({});
  const [interviewForm, setInterviewForm] = useState<InterviewDetails>({
    date: '',
    time: '',
    mode: 'online',
    link: ''
  });
  
  // Enhanced applicant management states
  const [applicantSearchQuery, setApplicantSearchQuery] = useState("");
  const [applicantStatusFilter, setApplicantStatusFilter] = useState("all");
  const [selectedApplicants, setSelectedApplicants] = useState<string[]>([]);
  const [showBulkApplicantActions, setShowBulkApplicantActions] = useState(false);
  const [driveApplications, setDriveApplications] = useState<Application[]>([]);
  const [driveStudents, setDriveStudents] = useState<{ [key: string]: Student }>({});

  // React Query hooks for recruiter actions
  const updateApplicationStatusMutation = useUpdateApplicationStatus();
  const scheduleInterviewMutation = useScheduleInterview();
  const { mutate: updateRecruiterApplicationStatus } = useUpdateRecruiterApplicationStatus();
  const { data: drivesData } = useRecruiterDrives(recruiterId, { page: 1, limit: 50 });

  useEffect(() => {
    loadDrives();
  }, []);

  useEffect(() => {
    filterDrives();
  }, [localDrives, searchQuery, statusFilter]);

  const loadDrives = () => {
    const recruiterDrives = getRecruiterDrives();
    setLocalDrives(recruiterDrives);
  };

  useEffect(() => {
    if (drivesData?.data?.data?.length) {
      const mappedDrives: RecruiterDrive[] = drivesData.data.data.map((drive: any) => ({
        id: Number(drive.id) || drive.id,
        company: drive.company || drive.recruiter?.company || 'Company',
        logo: drive.logo || '/placeholder-logo.png',
        position: drive.position || drive.title || 'Role',
        type: (drive.type === 'Job' ? 'Job' : 'Internship'),
        salary: drive.salary || 'Not specified',
        location: drive.location || 'Remote',
        skills: Array.isArray(drive.skills) ? drive.skills : (drive.skills ? drive.skills.split(',').map((s: string) => s.trim()) : []),
        openings: drive.openings || 0,
        interviews: drive.interviews || 0,
        status: drive.status as any || 'active',
        description: drive.description || '',
        requirements: drive.requirements || [],
        experienceLevel: drive.experienceLevel || 'All levels',
        applicationDeadline: drive.applicationDeadline || drive.deadline || '',
        workMode: drive.workMode || 'Hybrid',
        applicants: drive.applicantsCount || drive.applicants || 0,
        shortlisted: drive.selectedCount || 0,
        postedDate: drive.postedDate || drive.createdAt || new Date().toISOString(),
        createdBy: drive.recruiterId || 'recruiter',
      }));
      setLocalDrives(mappedDrives);
    }
  }, [drivesData]);

  const filterDrives = () => {
    let filtered = [...localDrives];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (drive) =>
          drive.position.toLowerCase().includes(query) ||
          drive.company.toLowerCase().includes(query) ||
          drive.skills.some((skill) => skill.toLowerCase().includes(query))
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((drive) => drive.status === statusFilter);
    }

    setFilteredDrives(filtered);
  };

  const handleEdit = (drive: RecruiterDrive) => {
    setSelectedDrive(drive);
    setEditFormData({
      position: drive.position,
      type: drive.type,
      description: drive.description,
      skills: Array.isArray(drive.skills) ? drive.skills.join(", ") : drive.skills,
      company: drive.company,
      location: drive.location,
      salary: drive.salary,
      openings: drive.openings,
      experienceLevel: drive.experienceLevel,
      workMode: drive.workMode,
      applicationDeadline: drive.applicationDeadline,
      status: drive.status,
    });
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (!selectedDrive) return;

    const skills = editFormData.skills && typeof editFormData.skills === 'string'
      ? editFormData.skills.split(",").map((s) => s.trim()).filter((s) => s)
      : selectedDrive.skills;

    updateRecruiterDrive(selectedDrive.id, {
      ...editFormData,
      skills: skills,
    });

    toast.success("Drive updated successfully!");
    setIsEditDialogOpen(false);
    setSelectedDrive(null);
    loadDrives();
  };

  const handleDelete = (drive: RecruiterDrive) => {
    deleteRecruiterDrive(drive.id);
    toast.success("Drive deleted successfully!");
    setIsDeleteDialogOpen(false);
    loadDrives();
  };

  const handleViewApplicants = async (drive: RecruiterDrive) => {
    setSelectedDrive(drive);
    setIsViewApplicantsDialogOpen(true);
    
    // Load real applications for this drive
    try {
      const response = await recruitersService.getDriveApplications(drive.id.toString());
      const applications = response.data?.data || response.data || [];
      setDriveApplications(applications);
      
      // Load student profiles for each application
      const students: { [key: string]: Student } = {};
      for (const app of applications) {
        if (app.studentId && !students[app.studentId]) {
          try {
            // Import studentService dynamically to avoid circular imports
            const { studentService } = await import("@/services");
            const studentResponse = await studentService.getProfile(app.studentId);
            students[app.studentId] = studentResponse.data || studentResponse;
          } catch (error) {
            console.error(`Failed to load student ${app.studentId}:`, error);
          }
        }
      }
      setDriveStudents(students);
    } catch (error) {
      console.error('Failed to load drive applications:', error);
      toast.error('Failed to load applications');
      setDriveApplications([]);
      setDriveStudents({});
    }
  };

  const getApplicantsCountForDrive = (drive: RecruiterDrive) => {
    if (typeof drive.applicants === 'number' && drive.applicants >= 0) {
      return drive.applicants;
    }
    return getApplicants().filter((app) => app.driveId === drive.id).length;
  };

  // Helper functions for enhanced applicant management
  const getFilteredApplicants = () => {
    let filtered = driveApplications.filter(app => {
      const student = driveStudents[app.studentId];
      const matchesSearch = !applicantSearchQuery || 
        app.studentId?.toLowerCase().includes(applicantSearchQuery.toLowerCase()) ||
        student?.name?.toLowerCase().includes(applicantSearchQuery.toLowerCase()) ||
        student?.email?.toLowerCase().includes(applicantSearchQuery.toLowerCase());
      
      const matchesStatus = applicantStatusFilter === "all" || app.status === applicantStatusFilter;
      
      return matchesSearch && matchesStatus;
    });
    
    return filtered.sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime());
  };

  const handleSelectApplicant = (applicationId: string) => {
    setSelectedApplicants(prev => {
      const newSelection = prev.includes(applicationId) 
        ? prev.filter(id => id !== applicationId)
        : [...prev, applicationId];
      setShowBulkApplicantActions(newSelection.length > 0);
      return newSelection;
    });
  };

  const handleSelectAllApplicants = () => {
    const filtered = getFilteredApplicants();
    if (selectedApplicants.length === filtered.length) {
      setSelectedApplicants([]);
      setShowBulkApplicantActions(false);
    } else {
      setSelectedApplicants(filtered.map(app => app.id));
      setShowBulkApplicantActions(true);
    }
  };

  const handleBulkApplicantStatusUpdate = (newStatus: string) => {
    const promises = selectedApplicants.map(applicationId => 
      new Promise<void>((resolve, reject) => {
        updateRecruiterApplicationStatus(
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
        toast.success(`${selectedApplicants.length} applications updated to ${newStatus}`);
        setSelectedApplicants([]);
        setShowBulkApplicantActions(false);
        // Reload applications for the drive
        if (selectedDrive) {
          handleViewApplicants(selectedDrive);
        }
      })
      .catch(() => {
        toast.error('Some applications failed to update');
      });
  };

  // Recruiter action handlers
  const handleUpdateApplicationStatus = (applicationId: string, newStatus: Application['status']) => {
    updateApplicationStatusMutation.mutate(
      { applicationId, newStatus },
      {
        onSuccess: () => {
          toast.success(`Application status updated to ${newStatus.replace('_', ' ')}`);
        },
        onError: (error: any) => {
          toast.error(error.message || "Failed to update application status");
        }
      }
    );
  };

  const handleScheduleInterview = (application: Application) => {
    setSelectedApplication(application);
    setIsScheduleInterviewDialogOpen(true);
  };

  const handleSubmitInterview = () => {
    if (!selectedApplication || !interviewForm.date || !interviewForm.time) {
      toast.error("Please fill in all required interview details");
      return;
    }

    scheduleInterviewMutation.mutate(
      { 
        applicationId: selectedApplication.id, 
        interviewDetails: interviewForm 
      },
      {
        onSuccess: () => {
          toast.success("Interview scheduled successfully!");
          setIsScheduleInterviewDialogOpen(false);
          setInterviewForm({ date: '', time: '', mode: 'online', link: '' });
          setSelectedApplication(null);
        },
        onError: (error: any) => {
          toast.error(error.message || "Failed to schedule interview");
        }
      }
    );
  };

  return (
    <RecruiterLayout>
      <div className="container mx-auto px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-3">My Drives</h1>
            <p className="text-lg text-muted-foreground font-medium">Manage your recruitment drives</p>
          </div>
          <Link to="/recruiter/drives/create">
            <Button variant="glowPrimary" className="rounded-xl">
              <Plus className="w-4 h-4 mr-2" />
              Create New Drive
            </Button>
          </Link>
        </div>

        {/* Search and Filters */}
        <Card className="p-6 mb-6 rounded-2xl">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search drives..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
              {(searchQuery || statusFilter !== "all") && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Drives List */}
        <div className="grid gap-6">
          {filteredDrives.length > 0 ? (
            filteredDrives.map((drive, idx) => {
              const applicantsCount = getApplicantsCountForDrive(drive);
              return (
                <motion.div
                  key={drive.id}
                  className="card-hover"
                  initial={{ opacity: 0, y: 18, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: idx * 0.08, duration: 0.35, ease: 'easeOut' }}
                >
                  <Card className="p-6 rounded-2xl hover:shadow-xl transition-all">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-4 flex-1">
                        <img
                          src={drive.logo}
                          alt={drive.company}
                          className="w-16 h-16 rounded-xl shadow-lg"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-xl font-bold">{drive.position}</h3>
                            <Badge variant={drive.type === "Job" ? "default" : "secondary"}>
                              {drive.type}
                            </Badge>
                            <Badge
                              variant="outline"
                              className={
                                drive.status === "active"
                                  ? "bg-success/10 text-success border-success/20"
                                  : drive.status === "closed"
                                  ? "bg-muted text-muted-foreground"
                                  : "bg-warning/10 text-warning border-warning/20"
                              }
                            >
                              {drive.status}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground flex items-center gap-2 mb-4">
                            <MapPin className="w-4 h-4" />
                            {drive.location}
                          </p>

                          <p className="text-sm text-muted-foreground mb-4">{drive.description}</p>

                          <div className="flex items-center gap-6">
                            <div className="text-center p-3 rounded-lg bg-muted/50">
                              <p className="text-2xl font-bold text-primary">{drive.openings}</p>
                              <p className="text-xs text-muted-foreground">Openings</p>
                            </div>
                            <div className="text-center p-3 rounded-lg bg-muted/50">
                              <p className="text-2xl font-bold text-secondary">{applicantsCount}</p>
                              <p className="text-xs text-muted-foreground">Applicants</p>
                            </div>
                            <div className="text-center p-3 rounded-lg bg-muted/50">
                              <p className="text-2xl font-bold text-success">{drive.shortlisted}</p>
                              <p className="text-xs text-muted-foreground">Shortlisted</p>
                            </div>
                            <div className="text-center p-3 rounded-lg bg-muted/50">
                              <p className="text-2xl font-bold text-warning">{drive.interviews}</p>
                              <p className="text-xs text-muted-foreground">Interviews</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 ml-4">
                        <Button
                          size="sm"
                          className="rounded-xl"
                          onClick={() => handleViewApplicants(drive)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Applications ({applicantsCount})
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-xl"
                          onClick={() => handleEdit(drive)}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        <AlertDialog open={isDeleteDialogOpen && selectedDrive?.id === drive.id} onOpenChange={(open) => {
                          setIsDeleteDialogOpen(open);
                          if (!open) setSelectedDrive(null);
                        }}>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="destructive"
                              size="sm"
                              className="rounded-xl"
                              onClick={() => {
                                setSelectedDrive(drive);
                                setIsDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete the drive and all associated applications. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => selectedDrive && handleDelete(selectedDrive)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })
          ) : (
            <Card className="p-12 text-center rounded-2xl">
              <p className="text-muted-foreground text-lg">
                {searchQuery || statusFilter !== "all"
                  ? "No drives found matching your criteria."
                  : "No drives yet. Create your first drive to get started!"}
              </p>
            </Card>
          )}
        </div>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Drive</DialogTitle>
              <DialogDescription>Update drive information</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Position</Label>
                <Input
                  value={editFormData.position || ""}
                  onChange={(e) => setEditFormData({ ...editFormData, position: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select
                    value={editFormData.type || "Job"}
                    onValueChange={(value) => setEditFormData({ ...editFormData, type: value as "Job" | "Internship" })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Job">Job</SelectItem>
                      <SelectItem value="Internship">Internship</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={editFormData.status || "active"}
                    onValueChange={(value) => setEditFormData({ ...editFormData, status: value as "active" | "closed" | "draft" })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={editFormData.description || ""}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label>Skills (comma separated)</Label>
                <Input
                  value={Array.isArray(editFormData.skills) ? editFormData.skills.join(", ") : (editFormData.skills || "")}
                  onChange={(e) => setEditFormData({ ...editFormData, skills: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input
                    value={editFormData.location || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Salary</Label>
                  <Input
                    value={editFormData.salary || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, salary: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Openings</Label>
                  <Input
                    type="number"
                    value={editFormData.openings || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, openings: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Work Mode</Label>
                  <Select
                    value={editFormData.workMode || "Hybrid"}
                    onValueChange={(value) => setEditFormData({ ...editFormData, workMode: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Remote">Remote</SelectItem>
                      <SelectItem value="On-site">On-site</SelectItem>
                      <SelectItem value="Hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveEdit}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Enhanced View Applicants Dialog */}
        <Dialog open={isViewApplicantsDialogOpen} onOpenChange={setIsViewApplicantsDialogOpen}>
          <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Applications for {selectedDrive?.position} at {selectedDrive?.company}
              </DialogTitle>
              <DialogDescription>
                View and manage applications for this drive ({driveApplications.length} applications)
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              {/* Search and Filters */}
              <Card className="p-4 rounded-xl">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by student ID, name, or email..."
                      value={applicantSearchQuery}
                      onChange={(e) => setApplicantSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={applicantStatusFilter} onValueChange={setApplicantStatusFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="applied">Applied</SelectItem>
                      <SelectItem value="under_review">Under Review</SelectItem>
                      <SelectItem value="shortlisted">Shortlisted</SelectItem>
                      <SelectItem value="interview_scheduled">Interview Scheduled</SelectItem>
                      <SelectItem value="selected">Selected</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="withdrawn">Withdrawn</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </Card>

              {/* Bulk Actions Bar */}
              {showBulkApplicantActions && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4"
                >
                  <Card className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                          <span className="text-white text-sm font-bold">{selectedApplicants.length}</span>
                        </div>
                        <span className="font-medium text-blue-900">
                          {selectedApplicants.length} candidate{selectedApplicants.length !== 1 ? 's' : ''} selected
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          className="bg-success hover:bg-success/90 text-white"
                          onClick={() => handleBulkApplicantStatusUpdate('shortlisted')}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Shortlist All
                        </Button>
                        <Button
                          size="sm"
                          className="bg-primary hover:bg-primary/90 text-white"
                          onClick={() => handleBulkApplicantStatusUpdate('interview_scheduled')}
                        >
                          <Calendar className="w-4 h-4 mr-2" />
                          Schedule Interview
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleBulkApplicantStatusUpdate('rejected')}
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject All
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedApplicants([]);
                            setShowBulkApplicantActions(false);
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* Applicants List */}
              <div className="space-y-3">
                {/* Select All Header */}
                {getFilteredApplicants().length > 0 && (
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={selectedApplicants.length === getFilteredApplicants().length}
                        onCheckedChange={handleSelectAllApplicants}
                        className="w-5 h-5"
                      />
                      <span className="text-sm font-medium">
                        {selectedApplicants.length === getFilteredApplicants().length ? 'Deselect All' : 'Select All'} ({getFilteredApplicants().length} candidates)
                      </span>
                    </div>
                    
                    <div className="text-sm text-muted-foreground">
                      {selectedApplicants.length > 0 && (
                        <span className="text-primary font-medium">
                          {selectedApplicants.length} selected
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {getFilteredApplicants().length > 0 ? (
                  getFilteredApplicants().map((application, idx) => {
                    const student = driveStudents[application.studentId];
                    return (
                      <motion.div
                        key={application.id}
                        initial={{ opacity: 0, y: 18, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ delay: idx * 0.05, duration: 0.35, ease: 'easeOut' }}
                      >
                        <Card className="p-6 rounded-xl hover:shadow-lg transition-all">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 flex-1">
                              {/* Selection Checkbox */}
                              <Checkbox
                                checked={selectedApplicants.includes(application.id)}
                                onCheckedChange={() => handleSelectApplicant(application.id)}
                                className="w-5 h-5"
                              />
                              
                              {/* Student Avatar */}
                              <Avatar className="w-14 h-14">
                                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${application.studentId}`} />
                                <AvatarFallback className="bg-gradient-to-br from-primary via-secondary to-muted text-white text-lg font-medium">
                                  {student?.name?.substring(0, 2).toUpperCase() || application.studentId.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>

                              {/* Student Information */}
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-bold text-lg">{student?.name || application.studentId}</h3>
                                  <Badge className={
                                    application.status === 'shortlisted' ? 'bg-success' :
                                    application.status === 'interview_scheduled' ? 'bg-primary' :
                                    application.status === 'selected' ? 'bg-warning' :
                                    application.status === 'rejected' ? 'bg-destructive' :
                                    'bg-muted'
                                  }>
                                    {application.status.replace('_', ' ').toUpperCase()}
                                  </Badge>
                                  {Math.random() > 0.5 && (
                                    <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
                                      <Brain className="w-3 h-3 mr-1" />
                                      AI {Math.floor(Math.random() * 40 + 60)}%
                                    </Badge>
                                  )}
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                                  <div>
                                    <span className="text-muted-foreground">Student ID: </span>
                                    <span className="font-medium">{application.studentId}</span>
                                  </div>
                                  {student?.email && (
                                    <div>
                                      <span className="text-muted-foreground">Email: </span>
                                      <span className="font-medium">{student.email}</span>
                                    </div>
                                  )}
                                  {student?.branch && (
                                    <div>
                                      <span className="text-muted-foreground">Branch: </span>
                                      <span className="font-medium">{student.branch}</span>
                                    </div>
                                  )}
                                </div>
                                
                                <div className="flex items-center gap-4 mt-2">
                                  <span className="text-xs text-muted-foreground">
                                    Applied: {format(new Date(application.appliedAt), "MMM dd, yyyy")}
                                  </span>
                                  {student?.cgpa && (
                                    <span className="text-xs text-primary font-medium">
                                      <Star className="w-3 h-3 inline mr-1" />
                                      CGPA: {student.cgpa}
                                    </span>
                                  )}
                                  {Math.random() > 0.6 && (
                                    <span className="text-xs text-success font-medium">
                                      <Target className="w-3 h-3 inline mr-1" />
                                      {Math.floor(Math.random() * 30 + 70)}% Match
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2">
                              <Select value={application.status} onValueChange={(newStatus) => {
                                updateRecruiterApplicationStatus(
                                  { applicationId: application.id, status: newStatus },
                                  {
                                    onSuccess: () => {
                                      toast.success(`Status updated to ${newStatus}`);
                                      // Reload applications
                                      if (selectedDrive) {
                                        handleViewApplicants(selectedDrive);
                                      }
                                    },
                                    onError: () => {
                                      toast.error('Failed to update status');
                                    }
                                  }
                                );
                              }}>
                                <SelectTrigger className="w-36">
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
                                onClick={() => {
                                  // Open detailed profile view
                                  setSelectedApplication(application);
                                  // Could open a detailed profile dialog here
                                }}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                Profile
                              </Button>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    );
                  })
                ) : (
                  <Card className="p-12 text-center rounded-xl">
                    <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground text-lg">
                      {applicantSearchQuery || applicantStatusFilter !== "all"
                        ? "No applicants found matching your criteria."
                        : "No applications yet for this drive."}
                    </p>
                  </Card>
                )}
            </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewApplicantsDialogOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Schedule Interview Dialog */}
        <Dialog open={isScheduleInterviewDialogOpen} onOpenChange={setIsScheduleInterviewDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Schedule Interview</DialogTitle>
              <DialogDescription>
                Schedule an interview for {selectedApplication?.studentId}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="interview-date">Date</Label>
                <Input
                  id="interview-date"
                  type="date"
                  value={interviewForm.date}
                  onChange={(e) => setInterviewForm(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="interview-time">Time</Label>
                <Input
                  id="interview-time"
                  type="time"
                  value={interviewForm.time}
                  onChange={(e) => setInterviewForm(prev => ({ ...prev, time: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="interview-mode">Mode</Label>
                <Select
                  value={interviewForm.mode}
                  onValueChange={(value: 'online' | 'offline') => setInterviewForm(prev => ({ ...prev, mode: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="offline">Offline</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {interviewForm.mode === 'online' && (
                <div>
                  <Label htmlFor="interview-link">Meeting Link (Optional)</Label>
                  <Input
                    id="interview-link"
                    type="url"
                    placeholder="https://meet.google.com/..."
                    value={interviewForm.link || ''}
                    onChange={(e) => setInterviewForm(prev => ({ ...prev, link: e.target.value }))}
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsScheduleInterviewDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmitInterview} disabled={scheduleInterviewMutation.isPending}>
                Schedule Interview
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </RecruiterLayout>
  );
};

export default RecruiterDrives;
