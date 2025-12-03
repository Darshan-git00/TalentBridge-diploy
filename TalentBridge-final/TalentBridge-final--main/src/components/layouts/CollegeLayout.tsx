import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Building2, 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  FileText, 
  Settings, 
  LogOut,
  Menu,
  X
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { collegesService } from "@/services/collegesService";
import { College } from "@/services/types";
import BreadcrumbNav from "@/components/BreadcrumbNav";

interface CollegeLayoutProps {
  children: React.ReactNode;
}

const CollegeLayout = ({ children }: CollegeLayoutProps) => {
  const location = useLocation();
  const { logout, user } = useAuth();
  const [collegeData, setCollegeData] = useState<College | null>(null);

  // Fetch college data to get the college name for avatar
  useEffect(() => {
    const fetchCollegeData = async () => {
      if (!user?.id) return;
      
      try {
        const response = await collegesService.getProfile(user.id);
        // Handle both wrapped and direct response formats
        if (response && (response.data || (response as any).id)) {
          const college = response.data || response;
          setCollegeData(college as any); // Type assertion since API returns extra fields
        }
      } catch (err) {
        console.error('Failed to fetch college data for layout:', err);
      }
    };

    fetchCollegeData();
  }, [user?.id]);

  // Generate initials from college name
  const getCollegeInitials = (name: string) => {
    if (!name) return 'RC'; // Default fallback
    const words = name.trim().split(' ');
    if (words.length >= 2) {
      return words[0][0].toUpperCase() + words[1][0].toUpperCase();
    } else if (words.length === 1 && words[0].length >= 2) {
      return words[0].substring(0, 2).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const navItems = [
    { path: "/college/dashboard", label: "Dashboard", icon: Building2 },
    { path: "/college/applications", label: "Applications", icon: FileText },
    { path: "/college/students", label: "Students", icon: Users },
    { path: "/college/drives", label: "Drives", icon: Briefcase },
    { path: "/college/companies", label: "Companies", icon: Building2 },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/20 via-background/75 dark:via-background to-muted/40">
      {/* Top Navigation */}
      <header className="bg-background/85 backdrop-blur-md border-b border-border sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-10 min-w-0">
              <Link to="/college/dashboard" className="flex items-center gap-3 group">
                <span className="text-2xl font-extrabold tracking-tight text-primary drop-shadow-lg select-none">Talent<span className="text-secondary">Bridge</span></span>
              </Link>

              <nav className="hidden md:flex items-center gap-1 ml-6">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link key={item.path} to={item.path} className="relative group">
                      <Button
                        variant={isActive(item.path) ? "default" : "ghost"}
                        className={`rounded-full px-5 py-2 text-base font-medium tracking-wide transition-all ${isActive(item.path) ? 'shadow-glow scale-105' : 'hover:bg-secondary/20 hover:text-primary/90'} group-hover:scale-110`}
                      >
                        <Icon className="w-5 h-5 mr-2 transition-transform group-hover:scale-110" />
                        {item.label}
                        {isActive(item.path) && (
                          <span className="absolute left-1/2 -bottom-2 w-2 h-2 -translate-x-1/2 rounded-full bg-primary-glow shadow shadow-primary/30 animate-fade-in"></span>
                        )}
                      </Button>
                    </Link>
                  );
                })}
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/college/settings">
                <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors">
                  <Settings className="w-6 h-6" />
                </Button>
              </Link>
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-colors"
                onClick={logout}
                title="Logout"
              >
                <LogOut className="w-6 h-6" />
              </Button>
              <Link to="/college/profile">
                <Avatar className="cursor-pointer ring-2 ring-primary/30 hover:ring-primary/70 transition-all duration-200">
                  <AvatarFallback className="bg-gradient-to-br from-primary via-secondary to-muted text-white text-lg font-medium">
                    {getCollegeInitials(collegeData?.name || user?.name || 'RC')}
                  </AvatarFallback>
                </Avatar>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Breadcrumb Navigation */}
      <div className="container mx-auto px-8 py-4">
        <BreadcrumbNav />
      </div>

      {/* Main Content with smooth transition */}
      <main>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="py-10"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default CollegeLayout;
