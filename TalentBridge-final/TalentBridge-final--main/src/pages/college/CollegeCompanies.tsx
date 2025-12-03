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
import { Search, Plus, Building2, Briefcase, Users, Mail, MapPin, Globe, Calendar, Users2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { collegesService } from "@/services/collegesService";

const CollegeCompanies = () => {
  const { user } = useAuth();
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAddCompanyOpen, setIsAddCompanyOpen] = useState(false);
  const [companies, setCompanies] = useState<any[]>([]);
  const [recruiters, setRecruiters] = useState<any[]>([]);
  const [drives, setDrives] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    website: "",
    description: "",
    industry: "",
    employees: "",
    founded: "",
    status: "active",
  });

  // Fetch real data
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        // For now, we'll set empty arrays since these endpoints may not exist yet
        // TODO: Implement proper API endpoints for companies and recruiters
        setCompanies([]);
        setRecruiters([]);
        setDrives([]);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id]);

  const handleViewDetails = (company: any) => {
    setSelectedCompany(company);
    setIsDialogOpen(true);
  };

  const getCompanyDrives = (companyName: string) => {
    return drives.filter(drive => drive.company === companyName);
  };

  const handleAddCompany = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would add to the companies list
    toast.success("Company added successfully!");
    setIsAddCompanyOpen(false);
    // Reset form
    setFormData({
      name: "",
      location: "",
      website: "",
      description: "",
      industry: "",
      employees: "",
      founded: "",
      status: "active",
    });
  };

  return (
    <CollegeLayout>
      <div className="container mx-auto px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-3">Recruiter Insights & Companies</h1>
            <p className="text-lg text-muted-foreground font-medium">View all recruiters and their activity</p>
          </div>
          <Button 
            variant="glowPrimary" 
            className="rounded-xl"
            onClick={() => setIsAddCompanyOpen(true)}
          >
            <Plus className="w-4 h-4" />
            Add Company
          </Button>
        </div>

        {/* Recruiters Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Active Recruiters</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {loading ? (
              <div className="col-span-full text-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-muted-foreground text-sm">Loading recruiters...</p>
              </div>
            ) : recruiters.length === 0 ? (
              <div className="col-span-full text-center py-8">
                <p className="text-muted-foreground text-sm">No active recruiters</p>
              </div>
            ) : (
              recruiters.map((recruiter) => (
              <Card key={recruiter.id} className="p-6 rounded-2xl hover:shadow-xl transition-all card-hover">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1">{recruiter.name}</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {recruiter.email}
                    </p>
                    <Badge variant="secondary" className="mt-2">{recruiter.company}</Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg bg-muted/50 text-center">
                    <Briefcase className="w-4 h-4 text-primary mx-auto mb-1" />
                    <p className="text-xs text-muted-foreground">Active Drives</p>
                    <p className="text-lg font-bold">{recruiter.activeDrives}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 text-center">
                    <Building2 className="w-4 h-4 text-secondary mx-auto mb-1" />
                    <p className="text-xs text-muted-foreground">Postings</p>
                    <p className="text-lg font-bold">{recruiter.totalPostings}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 text-center">
                    <Users className="w-4 h-4 text-success mx-auto mb-1" />
                    <p className="text-xs text-muted-foreground">Shortlisted</p>
                    <p className="text-lg font-bold">{recruiter.shortlistedStudents}</p>
                  </div>
                </div>
              </Card>
              ))
            )}
          </div>
        </div>

        {/* Companies Section */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Companies</h2>
          <Card className="p-6 mb-6 rounded-2xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search companies..." className="pl-10" />
            </div>
          </Card>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-muted-foreground text-sm">Loading companies...</p>
            </div>
          ) : companies.length === 0 ? (
            <div className="col-span-full text-center py-8">
              <p className="text-muted-foreground text-sm">No companies found</p>
            </div>
          ) : (
            companies.map((company) => (
            <Card key={company.id} className="p-6 rounded-2xl hover:shadow-xl transition-all card-hover">
              <div className="flex items-start gap-4">
                <img src={company.logo} alt={company.name} className="w-16 h-16 rounded-xl" />
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">{company.name}</h3>
                  <Badge variant="secondary" className="mb-3">
                    {company.status}
                  </Badge>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Active Positions</span>
                      <span className="font-semibold text-primary">{company.activePositions}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Total Hires</span>
                      <span className="font-semibold">{company.totalHires}</span>
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full mt-4"
                    onClick={() => handleViewDetails(company)}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            </Card>
            ))
            )}
          </div>
        </div>
      </div>

      {/* Company Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedCompany && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-4 mb-4">
                  <img 
                    src={selectedCompany.logo} 
                    alt={selectedCompany.name} 
                    className="w-16 h-16 rounded-xl"
                  />
                  <div>
                    <DialogTitle className="text-2xl">{selectedCompany.name}</DialogTitle>
                    <DialogDescription className="text-base mt-1">
                      {selectedCompany.description}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* Company Info Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-muted">
                    <div className="flex items-center gap-2 mb-2">
                      <Users2 className="w-4 h-4 text-primary" />
                      <p className="text-sm text-muted-foreground">Number of Employees</p>
                    </div>
                    <p className="text-2xl font-bold">{selectedCompany.employees?.toLocaleString() || "N/A"}</p>
                  </div>

                  <div className="p-4 rounded-lg bg-muted">
                    <div className="flex items-center gap-2 mb-2">
                      <Briefcase className="w-4 h-4 text-secondary" />
                      <p className="text-sm text-muted-foreground">Active Positions</p>
                    </div>
                    <p className="text-2xl font-bold text-primary">{selectedCompany.activePositions}</p>
                  </div>

                  <div className="p-4 rounded-lg bg-muted">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-4 h-4 text-success" />
                      <p className="text-sm text-muted-foreground">Total Hires</p>
                    </div>
                    <p className="text-2xl font-bold">{selectedCompany.totalHires}</p>
                  </div>

                  <div className="p-4 rounded-lg bg-muted">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-warning" />
                      <p className="text-sm text-muted-foreground">Founded</p>
                    </div>
                    <p className="text-2xl font-bold">{selectedCompany.founded || "N/A"}</p>
                  </div>
                </div>

                {/* Location & Website */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg border border-border">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <p className="text-sm font-semibold">Location</p>
                    </div>
                    <p className="text-base">{selectedCompany.location || "N/A"}</p>
                  </div>

                  <div className="p-4 rounded-lg border border-border">
                    <div className="flex items-center gap-2 mb-2">
                      <Globe className="w-4 h-4 text-muted-foreground" />
                      <p className="text-sm font-semibold">Website</p>
                    </div>
                    <a 
                      href={selectedCompany.website || "#"} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-base text-primary hover:underline"
                    >
                      {selectedCompany.website || "N/A"}
                    </a>
                  </div>
                </div>

                {/* Industry */}
                {selectedCompany.industry && (
                  <div className="p-4 rounded-lg border border-border">
                    <p className="text-sm font-semibold mb-2">Industry</p>
                    <Badge variant="secondary" className="text-base px-3 py-1">
                      {selectedCompany.industry}
                    </Badge>
                  </div>
                )}

                {/* Positions Hiring For */}
                <div className="p-4 rounded-lg border border-border">
                  <p className="text-sm font-semibold mb-3">Positions Currently Hiring For</p>
                  <div className="flex flex-wrap gap-2">
                    {(selectedCompany.positionsHiring || []).map((position: string, idx: number) => (
                      <Badge key={idx} variant="outline" className="text-sm">
                        {position}
                      </Badge>
                    ))}
                    {(!selectedCompany.positionsHiring || selectedCompany.positionsHiring.length === 0) && (
                      <p className="text-sm text-muted-foreground">No active positions</p>
                    )}
                  </div>
                </div>

                {/* Active Drives */}
                {(() => {
                  const companyDrives = getCompanyDrives(selectedCompany.name);
                  if (companyDrives.length > 0) {
                    return (
                      <div className="p-4 rounded-lg border border-border">
                        <p className="text-sm font-semibold mb-3">Active Drives</p>
                        <div className="space-y-2">
                          {companyDrives.map((drive) => (
                            <div key={drive.id} className="flex items-center justify-between p-2 rounded bg-muted/50">
                              <div>
                                <p className="font-medium">{drive.position}</p>
                                <p className="text-xs text-muted-foreground">{drive.type} • {drive.location}</p>
                              </div>
                              <Badge variant="secondary">{drive.openings} openings</Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Company Form Dialog */}
      <Dialog open={isAddCompanyOpen} onOpenChange={setIsAddCompanyOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Add New Company</DialogTitle>
            <DialogDescription>
              Fill in the details to add a new company to the platform
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddCompany} className="space-y-6 mt-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Company Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Tech Solutions Inc."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry">Industry *</Label>
                <Select 
                  value={formData.industry} 
                  onValueChange={(value) => setFormData({ ...formData, industry: value })}
                >
                  <SelectTrigger id="industry">
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Software Development">Software Development</SelectItem>
                    <SelectItem value="Artificial Intelligence">Artificial Intelligence</SelectItem>
                    <SelectItem value="Data Management">Data Management</SelectItem>
                    <SelectItem value="FinTech">FinTech</SelectItem>
                    <SelectItem value="E-commerce">E-commerce</SelectItem>
                    <SelectItem value="Healthcare">Healthcare</SelectItem>
                    <SelectItem value="Education">Education</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Company Description *</Label>
              <Textarea
                id="description"
                placeholder="Brief description of the company and what they do..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  placeholder="e.g., Bangalore, India"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  placeholder="https://example.com"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="employees">Number of Employees</Label>
                <Input
                  id="employees"
                  type="number"
                  placeholder="e.g., 250"
                  value={formData.employees}
                  onChange={(e) => setFormData({ ...formData, employees: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="founded">Founded Year</Label>
                <Input
                  id="founded"
                  type="number"
                  placeholder="e.g., 2018"
                  min="1900"
                  max={new Date().getFullYear()}
                  value={formData.founded}
                  onChange={(e) => setFormData({ ...formData, founded: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" variant="glowPrimary" className="flex-1 rounded-xl">
                Add Company
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsAddCompanyOpen(false)} 
                className="flex-1 rounded-xl"
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </CollegeLayout>
  );
};

export default CollegeCompanies;
