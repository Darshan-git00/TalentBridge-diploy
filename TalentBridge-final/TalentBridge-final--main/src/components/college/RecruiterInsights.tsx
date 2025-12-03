import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, Briefcase, Users, Eye } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";

export const RecruiterInsights = () => {
  const { user } = useAuth();
  const [recruiters, setRecruiters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Implement proper API call to fetch recruiters
    // For now, setting empty array since this endpoint may not exist
    setRecruiters([]);
    setLoading(false);
  }, [user?.id]);
  return (
    <Card className="p-6 rounded-2xl bg-gradient-to-br from-card/90 dark:from-card via-secondary/5 to-primary/5 backdrop-blur shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-secondary to-primary flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Recruiter Insights</h3>
            <p className="text-sm text-muted-foreground">Active recruiters & their activity</p>
          </div>
        </div>
        <Link to="/college/companies">
          <Button variant="outline" size="sm" className="rounded-xl">
            View All
          </Button>
        </Link>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-muted-foreground text-sm">Loading recruiters...</p>
          </div>
        ) : recruiters.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground text-sm">No active recruiters</p>
          </div>
        ) : (
          recruiters.map((recruiter) => (
          <div
            key={recruiter.id}
            className="p-4 rounded-xl bg-card/60 dark:bg-card/80 backdrop-blur border border-border/50 hover:shadow-lg transition-all"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold text-base">{recruiter.name}</h4>
                  <Badge variant="secondary" className="text-xs">
                    {recruiter.company}
                  </Badge>
                  <Badge 
                    variant={recruiter.status === "active" ? "default" : "outline"}
                    className="text-xs"
                  >
                    {recruiter.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-3">{recruiter.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                <Briefcase className="w-4 h-4 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Active Drives</p>
                  <p className="text-sm font-bold">{recruiter.activeDrives}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                <Building2 className="w-4 h-4 text-secondary" />
                <div>
                  <p className="text-xs text-muted-foreground">Total Postings</p>
                  <p className="text-sm font-bold">{recruiter.totalPostings}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                <Users className="w-4 h-4 text-success" />
                <div>
                  <p className="text-xs text-muted-foreground">Shortlisted</p>
                  <p className="text-sm font-bold">{recruiter.shortlistedStudents}</p>
                </div>
              </div>
            </div>
          </div>
          ))
        )}
      </div>
    </Card>
  );
};

