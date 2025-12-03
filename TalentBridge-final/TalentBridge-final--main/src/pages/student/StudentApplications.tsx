import { useState, useMemo } from "react";
import StudentLayout from "@/components/layouts/StudentLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Building, Calendar, Eye, Search, MapPin, Briefcase, DollarSign, Clock, Video } from "lucide-react";
import { useStudentApplications, useWithdrawApplication } from "@/hooks";
import { StatusChip } from "@/components/ui/StatusChip";
import { InterviewDetailsCard } from "@/components/ui/InterviewDetailsCard";
import { InterviewScheduler } from "@/components/InterviewScheduler";
import { ScheduledInterview } from "@/lib/calendarIntegration";
import { motion } from 'framer-motion';
import { format } from "date-fns";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Application } from "@/services/types";

const StudentApplications = () => {
  const { user, isLoading: authLoading } = useAuth();
  const [selectedTab, setSelectedTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [showScheduler, setShowScheduler] = useState(false);
  const [scheduledInterviews, setScheduledInterviews] = useState<ScheduledInterview[]>([]);

  // React Query hooks
  const { data: applicationsData, isLoading, error } = useStudentApplications(user?.id || '', { page: 1, limit: 100 });
  const withdrawApplicationMutation = useWithdrawApplication();

  // Show loading state while auth is loading or user is not available
  if (authLoading || !user) {
    return (
      <StudentLayout>
        <div className="container mx-auto px-8 py-12">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading applications...</p>
            </div>
          </div>
        </div>
      </StudentLayout>
    );
  }

  // Show error state if query fails
  if (error) {
    return (
      <StudentLayout>
        <div className="container mx-auto px-8 py-12">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <p className="text-red-500 mb-4">Failed to load applications</p>
              <Button onClick={() => window.location.reload()}>Try Again</Button>
            </div>
          </div>
        </div>
      </StudentLayout>
    );
  }

  const applications = applicationsData?.data || [];

  // Filter applications based on tab and search
  const filteredApplications = useMemo(() => {
    let filtered = applications;

    // Filter by tab
    if (selectedTab !== "all") {
      filtered = filtered.filter(app => app.status === selectedTab);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(app =>
        app.driveTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.company.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [applications, selectedTab, searchQuery]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "shortlisted":
        return "bg-success/10 text-success border-success/20";
      case "under_review":
        return "bg-warning/10 text-warning border-warning/20";
      case "rejected":
        return "bg-destructive/10 text-destructive border-destructive/20";
      case "applied":
        return "bg-primary/10 text-primary border-primary/20";
      case "interview_scheduled":
        return "bg-blue-10 text-blue-600 border-blue-200";
      case "on_hold":
        return "bg-orange-10 text-orange-600 border-orange-200";
      case "accepted":
        return "bg-green-10 text-green-600 border-green-200";
      default:
        return "bg-muted";
    }
  };

  const formatStatus = (status: string) => {
    return status
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getStatusCount = (status: string) => {
    if (status === "all") return applications.length;
    return applications.filter((app) => app.status === status).length;
  };

  const handleViewDetails = (application: Application) => {
    setSelectedApplication(application);
    setIsDetailDialogOpen(true);
  };

  const handleScheduleInterview = (application: Application) => {
    setSelectedApplication(application);
    setShowScheduler(true);
    setIsDetailDialogOpen(false);
  };

  const handleInterviewScheduled = (interview: ScheduledInterview) => {
    setScheduledInterviews([...scheduledInterviews, interview]);
    
    toast.success('Interview scheduled successfully!');
  };

  const getDriveDetails = (driveId: string) => {
    // In a real app, this would use a hook to get drive details
    return null; // Placeholder
  };

  // Loading and error states
  if (isLoading) {
    return (
      <StudentLayout>
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </StudentLayout>
    );
  }

  if (error) {
    return (
      <StudentLayout>
        <div className="text-center text-red-500 p-8">
          <p>Failed to load applications. Please try again later.</p>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="container mx-auto px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-3">My Applications</h1>
          <p className="text-lg text-muted-foreground font-medium">Track your application status</p>
        </div>

        {/* Search Bar */}
        <Card className="p-4 mb-6 rounded-2xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by company or position..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </Card>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-7 mb-6">
            <TabsTrigger value="all">
              All ({getStatusCount("all")})
            </TabsTrigger>
            <TabsTrigger value="applied">
              Applied ({getStatusCount("applied")})
            </TabsTrigger>
            <TabsTrigger value="under_review">
              Under Review ({getStatusCount("under_review")})
            </TabsTrigger>
            <TabsTrigger value="shortlisted">
              Shortlisted ({getStatusCount("shortlisted")})
            </TabsTrigger>
            <TabsTrigger value="interview_scheduled">
              Interview ({getStatusCount("interview_scheduled")})
            </TabsTrigger>
            <TabsTrigger value="on_hold">
              On Hold ({getStatusCount("on_hold")})
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Rejected ({getStatusCount("rejected")})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={selectedTab} className="space-y-5">
            {filteredApplications.length > 0 ? (
              filteredApplications.map((application, idx) => {
                const driveDetails = getDriveDetails(application.driveId);
                return (
                  <motion.div
                    key={application.id}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Card className="p-6 rounded-2xl shadow-md border hover:shadow-xl transition-all">
                      <div className="flex items-start justify-between">
                        <div className="flex gap-4 flex-1">
                          <div className="w-16 h-16 rounded-xl shadow-lg bg-primary/20 flex items-center justify-center">
                            <Building className="w-8 h-8 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-xl font-bold">{application.driveTitle}</h3>
                              <StatusChip status={application.status} />
                            </div>
                            <p className="text-muted-foreground mb-3 flex items-center gap-2">
                              <Building className="w-4 h-4" />
                              {application.company}
                            </p>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                Applied: {format(new Date(application.appliedAt), "MMM dd, yyyy")}
                              </span>
                              {application.interviewDetails && (
                                <>
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    Interview: {application.interviewDetails.date} at {application.interviewDetails.time}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    {application.interviewDetails.mode === 'online' ? (
                                      <Video className="w-4 h-4" />
                                    ) : (
                                      <MapPin className="w-4 h-4" />
                                    )}
                                    {application.interviewDetails.mode}
                                  </span>
                                  {application.interviewDetails.link && (
                                    <a 
                                      href={application.interviewDetails.link} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:underline flex items-center gap-1"
                                    >
                                      <Eye className="w-4 h-4" />
                                      Join Interview
                                    </a>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {application.status === 'shortlisted' && (
                            <Button
                              onClick={() => handleScheduleInterview(application)}
                              variant="glowPrimary"
                              size="sm"
                              className="rounded-xl"
                            >
                              <Clock className="w-4 h-4 mr-2" />
                              Schedule Interview
                            </Button>
                          )}
                          <Button
                            onClick={() => handleViewDetails(application)}
                            variant="outline"
                            className="rounded-xl"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })
            ) : (
              <Card className="p-12 text-center rounded-2xl">
                <p className="text-muted-foreground text-lg">
                  {searchQuery
                    ? "No applications found matching your search."
                    : `No ${selectedTab === "all" ? "" : formatStatus(selectedTab)} applications yet.`}
                </p>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Detail Dialog */}
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            {selectedApplication && (
              <>
                <DialogHeader>
                  <div className="flex items-center gap-4 mb-2">
                    <div className="w-16 h-16 rounded-xl bg-primary/20 flex items-center justify-center">
                      <Building className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <DialogTitle className="text-2xl">{selectedApplication.driveTitle}</DialogTitle>
                      <DialogDescription className="text-base">
                        {selectedApplication.company}
                      </DialogDescription>
                    </div>
                  </div>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <StatusChip status={selectedApplication.status} />
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground mb-1">Applied Date</p>
                      <p className="font-medium">
                        {format(new Date(selectedApplication.appliedAt), "MMM dd, yyyy")}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Last Updated</p>
                      <p className="font-medium">
                        {format(new Date(selectedApplication.updatedAt), "MMM dd, yyyy")}
                      </p>
                    </div>
                  {(() => {
                    // Since getDriveDetails returns null, we'll show placeholder content
                    return (
                      <>
                        <div>
                          <p className="text-muted-foreground mb-2">Application Details</p>
                          <p className="text-sm">Drive ID: {selectedApplication.driveId}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-2">Status</p>
                          <StatusChip status={selectedApplication.status} />
                        </div>
                        {selectedApplication.interviewDetails && (
                          <div>
                            <p className="text-muted-foreground mb-2">Interview Details</p>
                            <InterviewDetailsCard interviewDetails={selectedApplication.interviewDetails} />
                          </div>
                        )}
                        {selectedApplication.notes && (
                          <div>
                            <p className="text-muted-foreground mb-2">Notes</p>
                            <p className="text-sm">{selectedApplication.notes}</p>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Interview Scheduler Dialog */}
        {showScheduler && selectedApplication && (
          <Dialog open={showScheduler} onOpenChange={setShowScheduler}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Schedule Interview</DialogTitle>
                <DialogDescription>
                  Schedule your interview for {selectedApplication.driveTitle} at {selectedApplication.company}
                </DialogDescription>
              </DialogHeader>
              <InterviewScheduler
                candidateId="current-student"
                candidateName="Current Student"
                candidateEmail="student@example.com"
                driveId={selectedApplication.driveId}
                position={selectedApplication.driveTitle}
                company={selectedApplication.company}
                onInterviewScheduled={handleInterviewScheduled}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>
    </StudentLayout>
  );
};

export default StudentApplications;
