import CollegeLayout from "@/components/layouts/CollegeLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { Search, Plus, MapPin, Briefcase, Calendar, Users, Clock, Building2, DollarSign, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { collegesService } from "@/services/collegesService";
import { Drive } from "@/services/types";

const CollegeDrives = () => {
  const { user } = useAuth();
  const [selectedDrive, setSelectedDrive] = useState<Drive | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [drives, setDrives] = useState<Drive[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleViewDetails = (drive: Drive) => {
    setSelectedDrive(drive);
    setIsDialogOpen(true);
  };

  // Fetch real drives data
  useEffect(() => {
    const fetchDrives = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        const response = await collegesService.getDrives(user.id, {
          page: 1,
          limit: 50
        });
        
        // The service returns { drives, pagination } directly
        if (response && response.drives) {
          setDrives(response.drives);
        } else {
          setError('Failed to fetch drives');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch drives');
      } finally {
        setLoading(false);
      }
    };

    fetchDrives();
  }, [user?.id]);

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <CollegeLayout>
      <div className="container mx-auto px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-3">Placement Drives</h1>
            <p className="text-lg text-muted-foreground font-medium">Manage all recruitment drives</p>
          </div>
          <Link to="/college/drives/create">
            <Button variant="glowPrimary" className="rounded-xl">
              <Plus className="w-4 h-4" />
              Add New Position
            </Button>
          </Link>
        </div>

        <Card className="p-6 mb-6 rounded-2xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search drives by company or position..." className="pl-10" />
          </div>
        </Card>

        <div className="grid gap-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading drives...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </div>
          ) : drives.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No drives available.</p>
            </div>
          ) : (
            drives.map((drive) => (
            <Card key={drive.id} className="p-6 rounded-2xl hover:shadow-xl transition-all card-hover">
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  <img src={drive.logo} alt={drive.company} className="w-16 h-16 rounded-xl" />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-xl font-semibold">{drive.position}</h3>
                      <Badge variant={drive.type === "on-campus" ? "default" : "secondary"}>
                        {drive.type}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground mb-3">{drive.company}</p>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {drive.location}
                      </span>
                      <span className="font-semibold text-primary">
                        {drive.salary.currency} {drive.salary.min.toLocaleString()} - {drive.salary.max.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {drive.requirements.slice(0, 3).map((req, idx) => (
                        <Badge key={idx} variant="secondary">{req}</Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">{drive.openings}</p>
                    <p className="text-xs text-muted-foreground">Total Openings</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-secondary">{drive.interviews}</p>
                    <p className="text-xs text-muted-foreground">Interviews</p>
                  </div>
                  <Button onClick={() => handleViewDetails(drive)}>View Details</Button>
                </div>
              </div>
            </Card>
            ))
          )}
        </div>
      </div>

      {/* Job Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedDrive && (
            <>
              <DialogHeader>
                <div className="flex items-start gap-4 mb-4">
                  <img 
                    src={selectedDrive.logo} 
                    alt={selectedDrive.company} 
                    className="w-16 h-16 rounded-xl"
                  />
                  <div className="flex-1">
                    <DialogTitle className="text-2xl mb-2">{selectedDrive.position}</DialogTitle>
                    <DialogDescription className="text-base flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      {selectedDrive.company}
                    </DialogDescription>
                  </div>
                  <Badge variant={selectedDrive.type === "on-campus" ? "default" : "secondary"}>
                    {selectedDrive.type}
                  </Badge>
                </div>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* Job Overview */}
                <div className="p-4 rounded-lg bg-muted">
                  <p className="text-sm text-muted-foreground mb-2">Job Description</p>
                  <p className="text-base leading-relaxed">{selectedDrive.description}</p>
                </div>

                {/* Key Information Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-lg border border-border">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-4 h-4 text-primary" />
                      <p className="text-sm text-muted-foreground">Salary</p>
                    </div>
                    <p className="text-lg font-bold">
                    {selectedDrive.salary.currency} {selectedDrive.salary.min.toLocaleString()} - {selectedDrive.salary.max.toLocaleString()}
                  </p>
                  </div>

                  <div className="p-4 rounded-lg border border-border">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4 text-secondary" />
                      <p className="text-sm text-muted-foreground">Location</p>
                    </div>
                    <p className="text-lg font-bold">{selectedDrive.location}</p>
                  </div>

                  <div className="p-4 rounded-lg border border-border">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-4 h-4 text-success" />
                      <p className="text-sm text-muted-foreground">Openings</p>
                    </div>
                    <p className="text-lg font-bold">{selectedDrive.openings}</p>
                  </div>

                  <div className="p-4 rounded-lg border border-border">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-warning" />
                      <p className="text-sm text-muted-foreground">Interviews</p>
                    </div>
                    <p className="text-lg font-bold">{selectedDrive.interviews}</p>
                  </div>
                </div>

                {/* Additional Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg border border-border">
                    <div className="flex items-center gap-2 mb-2">
                      <Briefcase className="w-4 h-4 text-muted-foreground" />
                      <p className="text-sm font-semibold">Drive Type</p>
                    </div>
                    <p className="text-base">{selectedDrive.type}</p>
                  </div>

                  <div className="p-4 rounded-lg border border-border">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <p className="text-sm font-semibold">Drive Date</p>
                    </div>
                    <p className="text-base">{new Date(selectedDrive.driveDate).toLocaleDateString()}</p>
                  </div>

                  <div className="p-4 rounded-lg border border-border">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <p className="text-sm font-semibold">Application Deadline</p>
                    </div>
                    <p className="text-base">{new Date(selectedDrive.deadline).toLocaleDateString()}</p>
                  </div>

                  <div className="p-4 rounded-lg border border-border">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <p className="text-sm font-semibold">Posted Date</p>
                    </div>
                    <p className="text-base">{new Date(selectedDrive.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Application Statistics */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                    <p className="text-sm text-muted-foreground mb-1">Total Applicants</p>
                    <p className="text-2xl font-bold text-primary">{selectedDrive.applicantsCount || 0}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-success/10 border border-success/20">
                    <p className="text-sm text-muted-foreground mb-1">Shortlisted</p>
                    <p className="text-2xl font-bold text-success">{selectedDrive.selectedCount || 0}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-secondary/10 border border-secondary/20">
                    <p className="text-sm text-muted-foreground mb-1">Interviews Scheduled</p>
                    <p className="text-2xl font-bold text-secondary">{selectedDrive.interviews || 0}</p>
                  </div>
                </div>

                {/* Required Skills */}
                <div className="p-4 rounded-lg border border-border">
                  <p className="text-sm font-semibold mb-3">Requirements</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedDrive.requirements.map((req: string, idx: number) => (
                      <Badge key={idx} variant="secondary" className="text-sm px-3 py-1">
                        {req}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Benefits */}
                {selectedDrive.benefits && selectedDrive.benefits.length > 0 && (
                  <div className="p-4 rounded-lg border border-border">
                    <p className="text-sm font-semibold mb-3">Benefits</p>
                    <ul className="space-y-2">
                      {selectedDrive.benefits.map((benefit: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <span className="text-primary mt-1">•</span>
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </CollegeLayout>
  );
};

export default CollegeDrives;
