import { useState, useEffect } from "react";
import CollegeLayout from "@/components/layouts/CollegeLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Filter, Send, Eye, Brain, Award, Code, CheckCircle2, Calendar, Clock, Video, MapPin as MapPinIcon } from "lucide-react";
import { useCollegeApplications } from "@/hooks";
import { useAuth } from "@/contexts/AuthContext";
import { StatusChip } from "@/components/ui/StatusChip";
import { InterviewDetailsCard } from "@/components/ui/InterviewDetailsCard";
import { toast } from "sonner";
import { motion } from 'framer-motion';
import { format } from "date-fns";
import { Application } from "@/services/types";

const CollegeApplications = () => {
  const { user } = useAuth();
  
  // React Query hook for college applications
  const { data: applicationsData, isLoading, error } = useCollegeApplications(user?.collegeId || '');
  
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [selectedApplications, setSelectedApplications] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isSendDialogOpen, setIsSendDialogOpen] = useState(false);
  
  const applications = applicationsData || [];
  
  const [filters, setFilters] = useState({
    status: "all",
    driveId: "all",
  });

  useEffect(() => {
    filterApplications();
  }, [applicationsData, searchQuery, filters]);

  const filterApplications = () => {
    let filtered = [...applications];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (app) =>
          app.studentId.toLowerCase().includes(query) ||
          app.driveTitle.toLowerCase().includes(query) ||
          app.company.toLowerCase().includes(query)
      );
    }

    // Filter by status
    if (filters.status !== "all") {
      filtered = filtered.filter((app) => app.status === filters.status);
    }

    // Filter by drive
    if (filters.driveId !== "all") {
      filtered = filtered.filter((app) => app.driveId === filters.driveId);
    }

    setFilteredApplications(filtered);
  };

  const handleFilterChange = (key: string, value: string | number) => {
    setFilters({ ...filters, [key]: value });
  };

  const handleClearFilters = () => {
    setFilters({
      status: "all",
      driveId: "all",
    });
    setSearchQuery("");
    setSelectedApplications(new Set());
  };

  const handleSelectApplication = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedApplications);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedApplications(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedApplications(new Set(filteredApplications.map((app) => app.id)));
    } else {
      setSelectedApplications(new Set());
    }
  };

  const handleSendToRecruiter = () => {
    if (selectedApplications.size === 0) {
      toast.error("Please select at least one application to send");
      return;
    }

    // TODO: Implement send to recruiter functionality
    toast.success(`Selected ${selectedApplications.size} application(s) for recruiter review`);
    setSelectedApplications(new Set());
    setIsSendDialogOpen(false);
  };

  const handleViewDetails = (application: Application) => {
    setSelectedApplication(application);
    setIsDetailDialogOpen(true);
  };

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
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Show loading state
  if (isLoading) {
    return (
      <CollegeLayout>
        <div className="container mx-auto px-8 py-12">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading applications...</p>
            </div>
          </div>
        </div>
      </CollegeLayout>
    );
  }

  // Show error state
  if (error) {
    return (
      <CollegeLayout>
        <div className="container mx-auto px-8 py-12">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <p className="text-red-500 mb-4">Failed to load applications</p>
              <Button onClick={() => window.location.reload()}>Try Again</Button>
            </div>
          </div>
        </div>
      </CollegeLayout>
    );
  }

  const hasActiveFilters = Object.values(filters).some(
    (value) => value !== "all" && value !== 0
  ) || searchQuery.trim() !== "";

  return (
    <CollegeLayout>
      <div className="container mx-auto px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-3">All Applications</h1>
          <p className="text-lg text-muted-foreground font-medium">
            View and filter student applications ({filteredApplications.length} of {applications.length})
          </p>
        </div>

        {/* Filters Section */}
        <Card className="p-6 mb-6 rounded-2xl bg-card/70 dark:bg-card backdrop-blur shadow-xl">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by student ID, drive title, or company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Status</Label>
                <Select value={filters.status} onValueChange={(value) => handleFilterChange("status", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="applied">Applied</SelectItem>
                    <SelectItem value="under_review">Under Review</SelectItem>
                    <SelectItem value="shortlisted">Shortlisted</SelectItem>
                    <SelectItem value="interview_scheduled">Interview Scheduled</SelectItem>
                    <SelectItem value="on_hold">On Hold</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Drive</Label>
                <Select value={filters.driveId} onValueChange={(value) => handleFilterChange("driveId", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Drives</SelectItem>
                    <SelectItem value="drive_1">Software Engineer Intern - Google</SelectItem>
                    <SelectItem value="drive_2">Frontend Developer - Microsoft</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button variant="outline" onClick={handleClearFilters} className="w-fit">
                Clear Filters
              </Button>
            </div>
          </div>
        </Card>

        {/* Applications Table */}
        <Card className="rounded-2xl bg-card/70 dark:bg-card backdrop-blur shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedApplications.size === filteredApplications.length && filteredApplications.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Applied Date</TableHead>
                  <TableHead>Interview Details</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplications.length > 0 ? (
                  filteredApplications.map((app) => (
                    <TableRow key={app.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedApplications.has(app.id)}
                          onCheckedChange={(checked) =>
                            handleSelectApplication(app.id, checked as boolean)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <p className="font-medium text-sm">{app.studentId}</p>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{app.driveTitle}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">{app.company}</p>
                      </TableCell>
                      <TableCell>
                        <StatusChip status={app.status} />
                      </TableCell>
                      <TableCell>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(app.appliedAt), "MMM dd, yyyy")}
                        </p>
                      </TableCell>
                      <TableCell>
                        {app.interviewDetails ? (
                          <InterviewDetailsCard interviewDetails={app.interviewDetails} className="scale-75 origin-left" />
                        ) : (
                          <p className="text-xs text-muted-foreground">Not scheduled</p>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(app)}
                          className="rounded-xl"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12">
                      <p className="text-muted-foreground">
                        {hasActiveFilters
                          ? "No applications found matching your filters."
                          : "No applications yet."}
                      </p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>

        {/* Detail Dialog */}
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            {selectedApplication && (
              <>
                <DialogHeader>
                  <DialogTitle>Application Details</DialogTitle>
                  <DialogDescription>
                    {selectedApplication.driveTitle} at {selectedApplication.company}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Student ID</p>
                      <p className="font-medium">{selectedApplication.studentId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Drive ID</p>
                      <p className="font-medium">{selectedApplication.driveId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">College ID</p>
                      <p className="font-medium">{selectedApplication.collegeId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Status</p>
                      <StatusChip status={selectedApplication.status} />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Applied Date</p>
                      <p className="font-medium">
                        {format(new Date(selectedApplication.appliedAt), "MMM dd, yyyy")}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Last Updated</p>
                      <p className="font-medium">
                        {format(new Date(selectedApplication.updatedAt), "MMM dd, yyyy")}
                      </p>
                    </div>
                  </div>

                  {selectedApplication.interviewDetails && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Interview Details</p>
                      <InterviewDetailsCard interviewDetails={selectedApplication.interviewDetails} />
                    </div>
                  )}

                  {selectedApplication.resume && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Resume</p>
                      <p className="text-sm">{selectedApplication.resume}</p>
                    </div>
                  )}

                  {selectedApplication.coverLetter && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Cover Letter</p>
                      <p className="text-sm">{selectedApplication.coverLetter}</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Send to Recruiter Dialog */}
        <Dialog open={isSendDialogOpen} onOpenChange={setIsSendDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Send Applications to Recruiter</DialogTitle>
              <DialogDescription>
                Are you sure you want to send {selectedApplications.size} application(s) to the recruiter?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsSendDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSendToRecruiter}>
                Send to Recruiter
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </CollegeLayout>
  );
};

export default CollegeApplications;
