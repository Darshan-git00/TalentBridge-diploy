import { useState } from "react";
import StudentLayout from "@/components/layouts/StudentLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Briefcase, Building } from "lucide-react";
import { useStudentDrives, useStudentApplications, useApplyToDrive } from "@/hooks";
import { toast } from "sonner";
import { motion } from 'framer-motion';
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const StudentDrives = () => {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  // React Query hooks
  const { data: drivesData, isLoading: drivesLoading, error: drivesError } = useStudentDrives();
  const { data: applicationsData } = useStudentApplications(user?.id || '');
  const applyToDriveMutation = useApplyToDrive();

  // Show loading state while auth is loading
  if (authLoading) {
    return (
      <StudentLayout>
        <div className="container mx-auto px-8 py-12">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading drives...</p>
            </div>
          </div>
        </div>
      </StudentLayout>
    );
  }

  // Show error state if drives query fails
  if (drivesError) {
    return (
      <StudentLayout>
        <div className="container mx-auto px-8 py-12">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <p className="text-red-500 mb-4">Failed to load drives</p>
              <Button onClick={() => window.location.reload()}>Try Again</Button>
            </div>
          </div>
        </div>
      </StudentLayout>
    );
  }

  const drives = drivesData?.data || [];
  const applications = applicationsData?.data || [];
  
  // Get applied drive IDs
  const appliedDriveIds = applications.map(app => app.driveId);

  const handleApply = (drive: any) => {
    // Check if already applied
    if (appliedDriveIds.includes(drive.id)) {
      toast.info("You have already applied to this position");
      return;
    }

    if (!user) {
      toast.error("Please login to apply");
      navigate("/auth/student");
      return;
    }

    // Apply to drive using new React Query mutation
    applyToDriveMutation.mutate(
      {
        driveId: drive.id,
        applicationData: {
          resume: '',
          coverLetter: ''
        }
      },
      {
        onSuccess: (response) => {
          toast.success("Application submitted successfully!");
        },
        onError: (error: any) => {
          toast.error(error.message || "Failed to submit application");
        }
      }
    );
  };

  const isApplied = (driveId: string) => {
    return appliedDriveIds.includes(driveId);
  };

  // Loading and error states
  if (drivesLoading) {
    return (
      <StudentLayout>
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="container mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-3">Opportunities</h1>
          <p className="text-lg text-muted-foreground font-medium">Find your job or internship</p>
        </div>

        {/* Results Count */}
        <div className="mb-4 text-sm text-muted-foreground">
          Showing {drives.length} opportunities
        </div>

        {/* Opportunities List */}
        <div className="grid gap-6">
          {drives.length > 0 ? (
            drives.map((drive, idx) => (
              <motion.div
                key={drive.id}
                className="card-hover"
                initial={{ opacity: 0, y: 18, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: idx * 0.08, duration: 0.35, ease: 'easeOut' }}
              >
                <Card className="p-6 rounded-2xl hover:shadow-xl transition-all">
                  <div className="flex items-start justify-between p-5 rounded-xl border border-border/60 bg-gradient-to-tl from-muted/40 via-background/75 dark:via-background to-muted/20 shadow-md">
                    <div className="flex gap-4 flex-1">
                      <div className="w-14 h-14 rounded-xl shadow-lg bg-primary/20 flex items-center justify-center">
                        <Building className="w-7 h-7 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-lg">{drive.position}</h3>
                          <Badge variant={drive.type === "on-campus" ? "default" : "secondary"}>
                            {drive.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{drive.recruiter?.company || 'Unknown Company'}</p>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {drive.location}
                          </span>
                          <span className="font-semibold text-primary">
                            {drive.salary}
                          </span>
                        </div>

                        <p className="text-sm text-muted-foreground mb-4">{drive.description}</p>

                        {/* Skills matching indicator */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          <span className="text-xs text-muted-foreground">Requirements:</span>
                          {drive.skills ? drive.skills.split(',').slice(0, 3).map((req, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {req.trim()}
                            </Badge>
                          )) : []}
                        </div>
                      </div>
                    </div>

                    <div className="ml-4">
                      {isApplied(drive.id) ? (
                        <Button
                          variant="outline"
                          className="rounded-xl"
                          onClick={() => navigate("/student/applications")}
                        >
                          View Application
                        </Button>
                      ) : (
                        <Button
                          onClick={() => handleApply(drive)}
                          variant="glowPrimary"
                          className="rounded-xl"
                          disabled={applyToDriveMutation.isPending}
                        >
                          {applyToDriveMutation.isPending ? 'Applying...' : 'Apply Now'}
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))
          ) : (
            <Card className="p-12 text-center rounded-2xl">
              <p className="text-muted-foreground text-lg">
                No opportunities available at the moment.
              </p>
            </Card>
          )}
        </div>
      </div>
    </StudentLayout>
  );
};

export default StudentDrives;
