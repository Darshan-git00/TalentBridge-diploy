import { useState } from "react";
import StudentLayout from "@/components/layouts/StudentLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Briefcase, FileText, MapPin, TrendingUp, ArrowRight, Search, LogOut, Info, Building } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useStudentProfile, useStudentApplications, useUpcomingDrives } from "@/hooks";
import { AdvancedSearch } from "@/components/AdvancedSearch";
import { HelpTooltip, ProfileCompletionHelp } from "@/components/HelpTooltip";
import { motion } from 'framer-motion';
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const [showSearch, setShowSearch] = useState(false);

  // Calculate profile completion based on filled fields
  const calculateProfileCompletion = (profile: any) => {
    if (!profile) return 0;
    
    const fields = [
      'name', 'email', 'phone', 'branch', 'cgpa', 'skills', 
      'resume', 'address', 'tenthPercentage', 'twelfthPercentage', 
      'graduationYear', 'backlogs'
    ];
    
    const filledFields = fields.filter(field => 
      profile[field] && profile[field] !== '' && profile[field] !== null
    ).length;
    
    return Math.round((filledFields / fields.length) * 100);
  };

  // React Query hooks - only run when user is available
  const { data: profileData, isLoading: profileLoading, error: profileError } = useStudentProfile(user?.id || '', user?.collegeId);
  const { data: applicationsData, isLoading: applicationsLoading, error: applicationsError } = useStudentApplications(user?.id || '');
  const { data: upcomingDrivesData, isLoading: drivesLoading, error: drivesError } = useUpcomingDrives(3, user?.collegeId);

  // Show loading state while auth is loading or user is not available
  if (authLoading || !user) {
    return (
      <StudentLayout>
        <div className="container mx-auto px-8 py-12">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading dashboard...</p>
            </div>
          </div>
        </div>
      </StudentLayout>
    );
  }

  // Show error state if any of the critical queries fail
  if (profileError || applicationsError || drivesError) {
    return (
      <StudentLayout>
        <div className="container mx-auto px-8 py-12">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <p className="text-red-500 mb-4">Failed to load dashboard data</p>
              <Button onClick={() => window.location.reload()}>Try Again</Button>
            </div>
          </div>
        </div>
      </StudentLayout>
    );
  }

  // Show loading state while data is being fetched
  if (profileLoading || applicationsLoading || drivesLoading) {
    return (
      <StudentLayout>
        <div className="container mx-auto px-8 py-12">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading your data...</p>
            </div>
          </div>
        </div>
      </StudentLayout>
    );
  }

  const profile = profileData;
  const applications = applicationsData?.data || [];
  const upcomingDrives = Array.isArray(upcomingDrivesData) ? upcomingDrivesData : upcomingDrivesData?.data || [];

  // Calculate metrics from applications data
  const metrics = {
    appliedDrives: applications.length,
    shortlisted: applications.filter(app => app.status === 'shortlisted').length,
    interviewScheduled: applications.filter(app => app.status === 'interview_scheduled').length,
    accepted: applications.filter(app => app.status === 'accepted').length,
    pending: applications.filter(app => app.status === 'applied' || app.status === 'under_review').length,
    cgpa: profile?.cgpa || 8.4,
  };

  const studentName = profile?.name || user?.name || "John";
  const profileCompletion = profile ? calculateProfileCompletion(profile) : 0;

  const handleLogout = () => {
    // Clear localStorage data
    localStorage.removeItem('studentProfile');
    localStorage.removeItem('studentApplications');
    localStorage.removeItem('studentMetrics');
    
    // Show success message
    toast.success('Logged out successfully');
    
    // Redirect to welcome page
    setTimeout(() => {
      navigate('/');
    }, 1000);
  };

  const stats = [
    { label: "Applied", value: metrics.appliedDrives, icon: FileText, color: "text-primary" },
    { label: "Shortlisted", value: metrics.shortlisted, icon: TrendingUp, color: "text-success" },
    { label: "Interviews", value: metrics.interviewScheduled, icon: Briefcase, color: "text-blue-600" },
    { label: "Accepted", value: metrics.accepted, icon: TrendingUp, color: "text-green-600" },
    { label: "Pending", value: metrics.pending, icon: Briefcase, color: "text-warning" },
    { label: "CGPA", value: metrics.cgpa, icon: TrendingUp, color: "text-secondary" },
  ];

  return (
    <StudentLayout>
      <div className="container mx-auto px-8 py-12">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-3">Welcome back, {studentName}!</h1>
            <p className="text-lg text-muted-foreground font-medium">Find your next opportunity</p>
          </div>
          <Button 
            variant="outline" 
            onClick={handleLogout}
            className="rounded-xl flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>

        {/* Quick Search Bar */}
        <Card className="p-4 mb-12">
          <div className="flex items-center gap-4">
            <Search className="w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search opportunities, companies, or skills..."
              className="flex-1 bg-transparent outline-none text-lg"
              onFocus={() => setShowSearch(true)}
            />
            <Button 
              variant="outline" 
              onClick={() => setShowSearch(!showSearch)}
              className="rounded-xl"
            >
              {showSearch ? 'Hide Search' : 'Advanced Search'}
            </Button>
          </div>
        </Card>

        {/* Advanced Search Component */}
        {showSearch && (
          <div className="mb-12">
            <AdvancedSearch 
              placeholder="Search for opportunities that match your skills and interests..."
              showFilters={true}
              defaultType="drive"
            />
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div 
                key={index}
                className="card-hover"
                initial={{opacity: 0, scale: 0.96, y: 16}}
                animate={{opacity: 1, scale: 1, y: 0}}
                transition={{delay: index * 0.08, duration: 0.35, ease: 'easeOut'}}
              >
                <Card className="p-8 rounded-2xl bg-card/70 dark:bg-card backdrop-blur shadow-md transition-all h-full flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-6">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br from-primary via-primary-glow to-secondary flex items-center justify-center shadow ${stat.color} transition-transform scale-105 group-hover:scale-110 animate-breathe`}>
                      <Icon className="w-7 h-7 text-white drop-shadow-lg" />
                    </div>
                  </div>
                  <div>
                    <p className="text-4xl font-extrabold mb-1 tracking-tight text-balance leading-tight">{stat.value}</p>
                    <p className="text-base text-muted-foreground font-semibold tracking-tight uppercase">{stat.label}</p>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Available Drives */}
        <Card className="p-8 rounded-2xl bg-card/70 dark:bg-card backdrop-blur shadow-xl mb-12">
          <div className="mb-8">
            <h2 className="text-2xl font-bold">Available Opportunities</h2>
          </div>
          {upcomingDrives.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingDrives.map((drive, idx) => (
                <motion.div
                  key={drive.id}
                  className="card-hover"
                  initial={{opacity: 0, y: 18, scale: 0.98}}
                  animate={{opacity: 1, y: 0, scale: 1}}
                  transition={{delay: idx * 0.08 + 0.2, duration: 0.35, ease: 'easeOut'}}
                >
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
                      </div>
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                      {drive.skills ? drive.skills.split(',').slice(0, 2).map((req, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">{req.trim()}</Badge>
                      )) : []}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No new opportunities available. Check back later!</p>
            </div>
          )}
        </Card>

        {/* Profile Completion */}
        <Card className="p-6 mb-12">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold">Profile Completion</h3>
              <ProfileCompletionHelp />
            </div>
            <Badge variant={profileCompletion >= 80 ? "default" : "secondary"} className="text-sm">
              {profileCompletion}% Complete
            </Badge>
          </div>
          
          <div className="w-full bg-muted rounded-full h-3 mb-4">
            <div 
              className="bg-gradient-to-r from-primary to-secondary h-3 rounded-full transition-all duration-500"
              style={{ width: `${profileCompletion}%` }}
            />
          </div>
          
          {profileCompletion < 80 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Complete your profile to get better job matches
              </p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/student/profile/edit')}
              >
                Complete Profile
              </Button>
            </div>
          )}
        </Card>
      </div>
    </StudentLayout>
  );
};

export default StudentDashboard;
