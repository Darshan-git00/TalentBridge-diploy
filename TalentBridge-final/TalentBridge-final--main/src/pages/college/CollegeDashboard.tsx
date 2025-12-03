import CollegeLayout from "@/components/layouts/CollegeLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Building, Briefcase, TrendingUp, Plus, ArrowRight, Award, Copy, Eye, EyeOff } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from 'framer-motion';
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useCollegeStudents, useCollegeDrives, useCollegeApplications, useCollegeDashboardStats } from "@/hooks";

const CollegeDashboard = () => {
  const { user } = useAuth();
  const [collegeData, setCollegeData] = useState<any>(null);
  const [showCollegeId, setShowCollegeId] = useState(false);

  useEffect(() => {
    if (user?.id) {
      // College data is now available directly from the authenticated user
      setCollegeData(user);
    }
  }, [user]);

  const handleCopyCollegeId = async () => {
    if (user?.id) {
      try {
        await navigator.clipboard.writeText(user.id);
        toast.success("College ID copied to clipboard!");
      } catch (error) {
        toast.error("Failed to copy College ID");
      }
    }
  };

  // React Query hooks with collegeId filtering
  const { data: studentsData, isLoading: studentsLoading } = useCollegeStudents(user?.collegeId || '', { page: 1, limit: 100 });
  const { data: drivesData, isLoading: drivesLoading } = useCollegeDrives(user?.collegeId || '', { page: 1, limit: 10 });
  const { data: applicationsData, isLoading: applicationsLoading } = useCollegeApplications(user?.collegeId || '');
  const { data: statsData, isLoading: statsLoading } = useCollegeDashboardStats(user?.collegeId || '');

  const applications = applicationsData || [];
  const students = studentsData?.students || [];
  const drives = drivesData?.data || [];

  // Calculate real metrics from applications data
  const applicationMetrics = {
    totalApplications: applications.length,
    shortlisted: applications.filter(app => app.status === 'shortlisted').length,
    interviewScheduled: applications.filter(app => app.status === 'interview_scheduled').length,
    accepted: applications.filter(app => app.status === 'accepted').length,
    rejected: applications.filter(app => app.status === 'rejected').length,
  };

  const stats = [
    { label: "Total Students", value: students.length, icon: Users, color: "text-primary" },
    { label: "Applications", value: applicationMetrics.totalApplications, icon: Briefcase, color: "text-primary" },
    { label: "Shortlisted", value: applicationMetrics.shortlisted, icon: TrendingUp, color: "text-yellow-600" },
    { label: "Accepted", value: applicationMetrics.accepted, icon: Award, color: "text-green-600" },
  ];

  return (
    <CollegeLayout>
      <div className="container mx-auto px-8 py-12">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-3 text-balance">Placement Dashboard</h1>
          <p className="text-lg text-muted-foreground font-medium">Academic Year 2024-25</p>
        </div>

        {/* College ID Card */}
        {collegeData?.collegeId && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <Card className="p-6 rounded-2xl bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                    <Building className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-purple-900">Your College ID</h3>
                      <Badge className="px-2 py-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 text-xs">
                        Official
                      </Badge>
                    </div>
                    <p className="text-sm text-purple-700">
                      Share this ID with students for registration
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    {showCollegeId ? (
                      <div className="font-mono text-xl font-bold text-purple-900 tracking-wider">
                        {collegeData.collegeId}
                      </div>
                    ) : (
                      <div className="font-mono text-xl font-bold text-purple-300 tracking-wider">
                        •••••••••
                      </div>
                    )}
                    <p className="text-xs text-purple-600 mt-1">
                      {collegeData.name}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowCollegeId(!showCollegeId)}
                      className="h-8 w-8 p-0 text-purple-600 hover:text-purple-700 hover:bg-purple-100"
                    >
                      {showCollegeId ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopyCollegeId}
                      className="h-8 w-8 p-0 text-purple-600 hover:text-purple-700 hover:bg-purple-100"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
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

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Quick Actions */}
          <Card className="p-8 rounded-2xl bg-gradient-to-br from-card/90 dark:from-card via-muted/90 to-secondary/20 backdrop-blur shadow-xl">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">Quick Actions</h2>
            </div>
            <div className="space-y-4">
              <Link to="/college/applications">
                <Button variant="glowPrimary" className="w-full justify-between rounded-xl font-semibold px-7 py-3 transition-transform hover:scale-105 hover:shadow-glow">
                  <span className="flex items-center gap-3">
                    <Briefcase className="w-5 h-5" />
                    All Applications
                  </span>
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </Card>

          {/* Recent Activities */}
          <Card className="p-8 rounded-2xl bg-card/80 dark:bg-card shadow-xl backdrop-blur">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Recent Activities</h2>
            </div>
            <div className="space-y-5">
              {/* Activity examples updated for modern hierarchy */}
              <motion.div 
                className="flex items-start gap-4 p-4 rounded-xl bg-muted/60 card-hover"
                initial={{opacity: 0, y: 18, scale: 0.98}}
                animate={{opacity: 1, y: 0, scale: 1}}
                transition={{delay: 0.2, duration: 0.35, ease: 'easeOut'}}
              >
                <div className="w-3 h-3 rounded-full bg-primary mt-2"></div>
                <div className="flex-1">
                  <p className="text-base font-semibold">New Position Added</p>
                  <p className="text-xs text-muted-foreground">Software Engineer at Highspeed Studios</p>
                  <p className="text-xs text-muted-foreground mt-1">2 hours ago</p>
                </div>
              </motion.div>
              <motion.div 
                className="flex items-start gap-4 p-4 rounded-xl bg-muted/60 card-hover"
                initial={{opacity: 0, y: 18, scale: 0.98}}
                animate={{opacity: 1, y: 0, scale: 1}}
                transition={{delay: 0.25, duration: 0.35, ease: 'easeOut'}}
              >
                <div className="w-3 h-3 rounded-full bg-success mt-2"></div>
                <div className="flex-1">
                  <p className="text-base font-semibold">Student Placement</p>
                  <p className="text-xs text-muted-foreground">Marcus Rashford placed at Stealth AI</p>
                  <p className="text-xs text-muted-foreground mt-1">5 hours ago</p>
                </div>
              </motion.div>
              <motion.div 
                className="flex items-start gap-4 p-4 rounded-xl bg-muted/60 card-hover"
                initial={{opacity: 0, y: 18, scale: 0.98}}
                animate={{opacity: 1, y: 0, scale: 1}}
                transition={{delay: 0.3, duration: 0.35, ease: 'easeOut'}}
              >
                <div className="w-3 h-3 rounded-full bg-secondary mt-2"></div>
                <div className="flex-1">
                  <p className="text-base font-semibold">Company Registered</p>
                  <p className="text-xs text-muted-foreground">Lunch Data Corp joined the platform</p>
                  <p className="text-xs text-muted-foreground mt-1">1 day ago</p>
                </div>
              </motion.div>
            </div>
          </Card>
        </div>

        {/* Active Drives */}
        <Card className="p-8 rounded-2xl bg-card/70 dark:bg-card backdrop-blur shadow-xl">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold mb-0">Active Drives</h2>
            <Link to="/college/drives">
              <Button variant="ghost" size="sm" className="rounded-xl">View All <ArrowRight className="w-4 h-4 ml-2" /></Button>
            </Link>
          </div>
          <div className="space-y-5">
            {drivesLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-muted-foreground text-sm">Loading drives...</p>
              </div>
            ) : drives.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground text-sm">No active drives</p>
              </div>
            ) : (
              drives.slice(0, 3).map((drive, idx) => (
              <motion.div
                key={drive.id}
                className="card-hover"
                initial={{opacity: 0, y: 18, scale: 0.98}}
                animate={{opacity: 1, y: 0, scale: 1}}
                transition={{delay: idx * 0.08 + 0.2, duration: 0.35, ease: 'easeOut'}}
              >
                <div className="flex items-center justify-between p-5 rounded-xl border border-border/60 bg-gradient-to-tl from-muted/40 via-background/75 dark:via-background to-muted/20 shadow-md">
                  <div className="flex items-center gap-4">
                    <img src={drive.logo} alt={drive.company} className="w-14 h-14 rounded-xl shadow-lg" />
                    <div>
                      <h3 className="font-bold text-lg mb-0 text-balance">{drive.position}</h3>
                      <p className="text-sm text-muted-foreground">{drive.company} • {drive.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary drop-shadow-sm">{drive.openings}</p>
                      <p className="text-xs text-muted-foreground">Openings</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-secondary drop-shadow-sm">{drive.interviews}</p>
                      <p className="text-xs text-muted-foreground">Interviews</p>
                    </div>
                    <Button size="sm" className="rounded-lg px-5 py-2 hover:scale-105 hover:shadow-glow">View Details</Button>
                  </div>
                </div>
              </motion.div>
              ))
            )}
          </div>
        </Card>
      </div>
    </CollegeLayout>
  );
};

export default CollegeDashboard;
