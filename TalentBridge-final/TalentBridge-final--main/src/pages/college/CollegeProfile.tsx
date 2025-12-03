import CollegeLayout from "@/components/layouts/CollegeLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Building2, Mail, Phone, MapPin, Users, Briefcase, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { collegesService } from "@/services/collegesService";
import { College } from "@/services/types";

const CollegeProfile = () => {
  const { user } = useAuth();
  const [collegeData, setCollegeData] = useState<College | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    website: '',
    establishedYear: '',
    type: '',
    accreditation: '',
    totalStudents: 0,
    departments: [] as string[]
  });
  const [dashboardStats, setDashboardStats] = useState({
    totalStudents: 0,
    activeDrives: 0,
    totalApplications: 0,
    placementRate: 0
  });

  // Fetch college profile data
  useEffect(() => {
    const fetchCollegeData = async () => {
      console.log('🔍 College Profile: User data:', user);
      
      // For college users, the user.id is actually the collegeId
      const collegeId = user?.id;
      
      if (!collegeId) {
        console.log('❌ College Profile: No ID found in user data');
        setError('College ID not found. Please log in again.');
        return;
      }
      
      try {
        setLoading(true);
        console.log('📡 College Profile: Fetching data for collegeId:', collegeId);
        const response = await collegesService.getProfile(collegeId);
        console.log('📥 College Profile: API response:', response);
        
        // API returns data directly, not wrapped in {success, data}
        if (response && (response.data || response.id)) {
          // Handle both wrapped and direct response formats
          const college = response.data || response; // Use response.data if exists, otherwise use response directly
          console.log('✅ College Profile: Data loaded successfully:', college);
          setCollegeData(college);
          setFormData({
            name: college.name || '',
            email: college.email || '',
            phone: college.phone || '',
            address: college.address || college.location || '', // Use location as fallback
            website: college.website || '',
            establishedYear: college.establishedYear || '',
            type: college.type || '',
            accreditation: college.accreditation || '',
            totalStudents: college.totalStudents || college.students?.length || 0,
            departments: college.departments || []
          });
        } else {
          console.log('❌ College Profile: API returned no data');
          setError('Failed to fetch college profile - No data received');
        }
      } catch (err: any) {
        console.log('💥 College Profile: API error:', err);
        setError(err.message || 'Failed to fetch college profile');
      } finally {
        setLoading(false);
      }
    };

    fetchCollegeData();
  }, [user?.id]);

  // Fetch dashboard stats
  useEffect(() => {
    const fetchDashboardStats = async () => {
      const collegeId = user?.id;
      if (!collegeId) return;
      
      try {
        console.log('📊 College Profile: Fetching dashboard stats for collegeId:', collegeId);
        const response = await collegesService.getDashboardStats(collegeId);
        console.log('📊 College Profile: Dashboard stats response:', response);
        
        // API returns data directly, not wrapped in {success, data}
        if (response && (response.data || response.totalStudents !== undefined)) {
          // Handle both wrapped and direct response formats
          const stats = response.data || response; // Use response.data if exists, otherwise use response directly
          setDashboardStats({
            totalStudents: stats.totalStudents || 0,
            activeDrives: stats.activeDrives || 0,
            totalApplications: stats.totalApplications || 0,
            placementRate: stats.placementRate || 0
          });
          console.log('✅ College Profile: Dashboard stats loaded');
        } else {
          console.log('⚠️ College Profile: No dashboard stats available');
        }
      } catch (err) {
        console.error('❌ College Profile: Failed to fetch dashboard stats:', err);
      }
    };

    fetchDashboardStats();
  }, [user?.id]);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDepartmentsChange = (value: string) => {
    const departmentsArray = value.split(',').map(d => d.trim()).filter(d => d);
    setFormData(prev => ({
      ...prev,
      departments: departmentsArray
    }));
  };

  const handleSave = async () => {
    const collegeId = user?.id;
    if (!collegeId || !collegeData) return;
    
    try {
      setSaving(true);
      
      const updateData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        website: formData.website,
        establishedYear: formData.establishedYear,
        type: formData.type,
        accreditation: formData.accreditation,
        totalStudents: formData.totalStudents,
        departments: formData.departments
      };

      console.log('💾 College Profile: Saving data for collegeId:', collegeId, updateData);
      const response = await collegesService.updateProfile(collegeId, updateData);
      console.log('📥 College Profile: Save response:', response);
      
      // API returns data directly, not wrapped in {success, data}
      if (response && (response.data || response.id)) {
        // Handle both wrapped and direct response formats
        const updatedCollege = response.data || response; // Use response.data if exists, otherwise use response directly
        setCollegeData(updatedCollege);
        toast.success("Profile updated successfully!");
        console.log('✅ College Profile: Profile saved successfully');
      } else {
        toast.error("Failed to update profile");
        console.log('❌ College Profile: Save failed - no data in response');
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile");
      console.log('💥 College Profile: Save error:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <CollegeLayout>
      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">College Profile</h1>
          <p className="text-muted-foreground">Manage your college information</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        ) : (
          <div className="grid gap-6">
            <Card className="p-8">
              <div className="flex items-center gap-6 mb-8">
                <Avatar className="w-24 h-24">
                  <AvatarFallback className="bg-primary text-white text-2xl">
                    <Building2 className="w-12 h-12" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-2xl font-bold mb-1">{formData.name || 'College Name'}</h2>
                  <p className="text-muted-foreground">{formData.address || 'Location'}</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="collegeName">College Name</Label>
                    <Input 
                      id="collegeName" 
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Enter college name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input 
                      id="location" 
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="Enter location"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter email address"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input 
                      id="phone" 
                      type="tel" 
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input 
                      id="website" 
                      type="url" 
                      value={formData.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      placeholder="Enter website URL"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="establishedYear">Established Year</Label>
                    <Input 
                      id="establishedYear" 
                      value={formData.establishedYear}
                      onChange={(e) => handleInputChange('establishedYear', e.target.value)}
                      placeholder="e.g., 1960"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">College Type</Label>
                    <Input 
                      id="type" 
                      value={formData.type}
                      onChange={(e) => handleInputChange('type', e.target.value)}
                      placeholder="e.g., Engineering, Medical"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="accreditation">Accreditation</Label>
                    <Input 
                      id="accreditation" 
                      value={formData.accreditation}
                      onChange={(e) => handleInputChange('accreditation', e.target.value)}
                      placeholder="e.g., NBA, NAAC 'A'"
                    />
                  </div>
                </div>

                <Button 
                  onClick={handleSave} 
                  variant="glowPrimary" 
                  className="w-full"
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Quick Stats</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 rounded-lg bg-muted">
                  <div className="flex items-center justify-center gap-1 mb-2">
                    <Users className="w-4 h-4 text-primary" />
                    <p className="text-2xl font-bold text-primary">{dashboardStats.totalStudents}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">Total Students</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted">
                  <div className="flex items-center justify-center gap-1 mb-2">
                    <Briefcase className="w-4 h-4 text-secondary" />
                    <p className="text-2xl font-bold text-secondary">{dashboardStats.activeDrives}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">Active Drives</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted">
                  <div className="flex items-center justify-center gap-1 mb-2">
                    <TrendingUp className="w-4 h-4 text-success" />
                    <p className="text-2xl font-bold text-success">{dashboardStats.totalApplications}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">Applications</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted">
                  <div className="flex items-center justify-center gap-1 mb-2">
                    <TrendingUp className="w-4 h-4 text-warning" />
                    <p className="text-2xl font-bold text-warning">{dashboardStats.placementRate.toFixed(1)}%</p>
                  </div>
                  <p className="text-sm text-muted-foreground">Placement Rate</p>
                </div>
              </div>
            </Card>

            {/* Additional Information */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Additional Information</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="totalStudents">Total Students</Label>
                  <Input 
                    id="totalStudents" 
                    type="number" 
                    value={formData.totalStudents}
                    onChange={(e) => handleInputChange('totalStudents', parseInt(e.target.value) || 0)}
                    placeholder="Enter total students count"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="departments">Departments (comma-separated)</Label>
                  <Input 
                    id="departments" 
                    value={formData.departments.join(', ')}
                    onChange={(e) => handleDepartmentsChange(e.target.value)}
                    placeholder="e.g., Computer Science, Mechanical, Electrical"
                  />
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </CollegeLayout>
  );
};

export default CollegeProfile;
