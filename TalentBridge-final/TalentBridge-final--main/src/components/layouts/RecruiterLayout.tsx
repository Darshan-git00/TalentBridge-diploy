import { Link, useLocation } from "react-router-dom";
import { useState, useEffect, memo } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Briefcase, 
  LayoutDashboard, 
  Users, 
  FileText, 
  Settings, 
  LogOut,
  Menu,
  X,
  Building2
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import BreadcrumbNav from "@/components/BreadcrumbNav";

interface RecruiterLayoutProps {
  children: React.ReactNode;
}

const RecruiterLayout = ({ children }: RecruiterLayoutProps) => {
  const location = useLocation();
  const { logout, user } = useAuth();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const navItems = [
    { path: "/recruiter/dashboard", label: "Dashboard", icon: Building2 },
    { path: "/recruiter/drives", label: "My Drives", icon: Briefcase },
    { path: "/recruiter/students", label: "Students", icon: Users },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/20 via-background/75 dark:via-background to-muted/40">
      <header className="bg-background/85 backdrop-blur-md border-b border-border sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-10 min-w-0">
              <Link to="/recruiter/dashboard" className="flex items-center gap-3 group">
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
              <Link to="/recruiter/settings">
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
              <Link to="/recruiter/profile">
                <Avatar className="cursor-pointer ring-2 ring-primary/30 hover:ring-primary/70 transition-all duration-200">
                  <AvatarFallback className="bg-gradient-to-br from-primary via-secondary to-muted text-white text-lg font-medium">
                    {user?.name ? getInitials(user.name) : 'TR'}
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

export default memo(RecruiterLayout);
