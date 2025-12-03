import { useState } from "react";
import RecruiterLayout from "@/components/layouts/RecruiterLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, Users, CheckCircle, TrendingUp, Plus, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useRecruiterDashboardStats, useRecruiterDrives } from "@/hooks";
import { motion } from 'framer-motion';
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";

const RecruiterDashboard = () => {
  const { user } = useAuth();
  
  // React Query hooks with collegeId filtering
  const { data: statsData } = useRecruiterDashboardStats(user?.id || '', user?.collegeId);
  const { data: drivesData } = useRecruiterDrives(user?.id || '', { page: 1, limit: 5 }, user?.collegeId);

  const stats = statsData;
  const recentDrives = drivesData?.data || [];

  // Calculate metrics from stats
  const metrics = {
    activeDrives: stats?.activeDrives || stats?.totalDrives || 0,
    totalApplications: stats?.totalApplications || 0,
    shortlisted: stats?.shortlistedApplications || 0,
    interviewScheduled: stats?.scheduledInterviews || 0,
    accepted: 0, // Not available in API response yet
    hired: 0, // Not available in API response yet
  };

  // Recent activities - not available in API yet, using empty array
  const recentActivities: any[] = [];

  // Helper function to get color based on activity type
  const getActivityColor = (type: string) => {
    switch (type) {
      case 'drive_created':
        return 'bg-primary';
      case 'application_received':
        return 'bg-success';
      case 'status_updated':
        return 'bg-warning';
      default:
        return 'bg-muted';
    }
  };

  // Helper function to format activity title
  const getActivityTitle = (type: string) => {
    switch (type) {
      case 'drive_created':
        return 'Drive Created';
      case 'application_received':
        return 'New Application';
      case 'status_updated':
        return 'Status Updated';
      default:
        return 'Activity';
    }
  };

  const dashboardStats = [
    { label: "Active Drives", value: metrics.activeDrives, icon: Briefcase, color: "text-primary" },
    { label: "Total Applications", value: metrics.totalApplications, icon: Users, color: "text-secondary" },
    { label: "Shortlisted", value: metrics.shortlisted, icon: CheckCircle, color: "text-success" },
    { label: "Interviews", value: metrics.interviewScheduled, icon: TrendingUp, color: "text-blue-600" },
    { label: "Accepted", value: metrics.accepted, icon: CheckCircle, color: "text-green-600" },
    { label: "Hired", value: metrics.hired, icon: TrendingUp, color: "text-warning" },
  ];

  return (
    <RecruiterLayout>
      <div className="container mx-auto px-8 py-12">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-3">Recruiter Dashboard</h1>
          <p className="text-lg text-muted-foreground font-medium">Manage your recruitment drives</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {dashboardStats.map((stat, index) => {
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

        <div className="grid lg:grid-cols-2 gap-8">
          <Card className="p-8 rounded-2xl bg-gradient-to-br from-card/90 dark:from-card via-muted/90 to-secondary/20 backdrop-blur shadow-xl">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">Quick Actions</h2>
            </div>
            <div className="space-y-4">
              <Link to="/recruiter/drives/create">
                <Button variant="glowPrimary" className="w-full justify-between rounded-xl font-semibold px-7 py-3 transition-transform hover:scale-105 hover:shadow-glow">
                  <span className="flex items-center gap-3">
                    <Plus className="w-5 h-5" />
                    Create New Drive
                  </span>
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </Card>

          <Card className="p-8 rounded-2xl bg-card/80 dark:bg-card shadow-xl backdrop-blur">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Recent Activities</h2>
            </div>
            <div className="space-y-5">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity, idx) => (
                  <motion.div 
                    key={idx}
                    className="flex items-start gap-4 p-4 rounded-xl bg-muted/60 card-hover"
                    initial={{opacity: 0, y: 18, scale: 0.98}}
                    animate={{opacity: 1, y: 0, scale: 1}}
                    transition={{delay: 0.2 + idx * 0.05, duration: 0.35, ease: 'easeOut'}}
                  >
                    <div className={`w-3 h-3 rounded-full ${getActivityColor(activity.type)} mt-2`}></div>
                    <div className="flex-1">
                      <p className="text-base font-semibold">
                        {getActivityTitle(activity.type)}
                      </p>
                      <p className="text-xs text-muted-foreground">{activity.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">{format(new Date(activity.timestamp), "MMM dd, yyyy 'at' h:mm a")}</p>
                    </div>
                  </motion.div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">No recent activities</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </RecruiterLayout>
  );
};

export default RecruiterDashboard;
