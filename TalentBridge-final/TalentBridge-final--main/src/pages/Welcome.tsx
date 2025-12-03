import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Building2, GraduationCap, Briefcase, ArrowRight, Sparkles, TrendingUp, Users, Target, Zap, Shield, Award, FileText, CheckCircle, Globe, Rocket, Heart, Star, Code, Brain, Lightbulb, ChevronRight, Menu, X, MessageCircle } from "lucide-react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useState } from "react";

const Welcome = () => {
  // Animated counter component
  const AnimatedCounter = ({ value, duration = 2 }: { value: string; duration?: number }) => {
    const [displayValue, setDisplayValue] = useState('0');
    const count = useMotionValue(0);
    const rounded = useTransform(count, latest => Math.round(latest).toString());
    
    useEffect(() => {
      // Handle special case for "24/7"
      if (value === '24/7') {
        setDisplayValue('24/7');
        return;
      }
      
      const targetValue = parseInt(value.replace(/[^0-9]/g, '')) || 0;
      const controls = animate(count, targetValue, { duration, ease: "easeOut" });
      return controls.stop;
    }, [value, duration, count]);
    
    useEffect(() => {
      // Handle special case for "24/7"
      if (value === '24/7') {
        return;
      }
      
      const unsubscribe = rounded.on("change", latest => {
        if (value.includes('%')) {
          setDisplayValue(latest + '%');
        } else if (value.includes('M+')) {
          setDisplayValue(latest + 'M+');
        } else {
          setDisplayValue(latest.toString());
        }
      });
      return unsubscribe;
    }, [rounded, value]);
    
    return <>{displayValue}</>;
  };

  const roleCards = [
    {
      id: 'college',
      title: 'College',
      icon: Building2,
      features: ['Student Management', 'Drive Organization', 'Application Tracking', 'Analytics Dashboard'],
      gradient: 'from-purple-600 via-purple-500 to-pink-500',
      hoverGradient: 'from-purple-500 via-pink-500 to-rose-500',
      stats: { label: 'Management', value: 'Complete' },
      path: '/auth/college'
    },
    {
      id: 'student',
      title: 'Student',
      icon: GraduationCap,
      features: ['AI Interview Practice', 'Job Applications', 'Profile Management', 'Skill Assessment'],
      gradient: 'from-blue-600 via-cyan-500 to-teal-400',
      hoverGradient: 'from-cyan-500 via-teal-400 to-emerald-500',
      stats: { label: 'Opportunities', value: 'Multiple' },
      path: '/auth/student'
    },
    {
      id: 'recruiter',
      title: 'Recruiter',
      icon: Briefcase,
      features: ['Drive Management', 'Applicant Screening', 'Interview Scheduling', 'Bulk Actions'],
      gradient: 'from-emerald-600 via-green-500 to-lime-400',
      hoverGradient: 'from-green-500 via-lime-400 to-yellow-500',
      stats: { label: 'Hiring', value: 'Smart' },
      path: '/auth/recruiter'
    }
  ];

  const features = [
    { icon: Zap, text: 'Lightning Fast Matching', delay: 0.1 },
    { icon: Shield, text: 'Secure & Private', delay: 0.2 },
    { icon: FileText, text: 'Smart Resume Analysis', delay: 0.3 },
    { icon: Award, text: 'Industry Recognition', delay: 0.4 },
    { icon: Target, text: 'AI-Powered Insights', delay: 0.5 },
    { icon: Globe, text: 'Global Reach', delay: 0.6 },
    { icon: Rocket, text: 'Career Acceleration', delay: 0.7 }
  ];

  const stats = [
    { value: '3', label: 'User Roles', icon: Users },
    { value: '95%', label: 'Success Rate', icon: Zap },
    { value: '100%', label: 'Secure Platform', icon: Shield },
    { value: '24/7', label: 'AI Support', icon: Target }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Enhanced Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating Orbs with enhanced animations */}
        <motion.div 
          className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-purple-600/30 to-pink-600/30 rounded-full blur-3xl"
          animate={{ 
            x: [0, 150, -50, 0], 
            y: [0, -80, 40, 0], 
            scale: [1, 1.3, 0.9, 1],
            rotate: [0, 180, 360]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-20 right-20 w-[500px] h-[500px] bg-gradient-to-r from-cyan-600/30 to-emerald-600/30 rounded-full blur-3xl"
          animate={{ 
            x: [0, -120, 80, 0], 
            y: [0, 100, -60, 0], 
            scale: [1, 0.7, 1.2, 1],
            rotate: [0, -180, -360]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/3 w-80 h-80 bg-gradient-to-r from-emerald-600/20 to-yellow-600/20 rounded-full blur-2xl"
          animate={{ 
            x: [0, 60, -30, 0], 
            y: [0, 40, -20, 0], 
            scale: [1, 1.4, 0.8, 1],
            rotate: [0, 90, -90, 0]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 5 }}
        />
        
        {/* Additional small floating orbs */}
        <motion.div 
          className="absolute top-1/4 right-1/4 w-32 h-32 bg-gradient-to-r from-rose-500/20 to-pink-500/20 rounded-full blur-xl"
          animate={{ 
            x: [0, 30, 0], 
            y: [0, -20, 0], 
            scale: [1, 1.2, 1] 
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-1/3 left-1/4 w-40 h-40 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full blur-xl"
          animate={{ 
            x: [0, -40, 0], 
            y: [0, 30, 0], 
            scale: [1, 0.8, 1] 
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
        
        {/* Enhanced Grid Pattern with animated lines */}
        <div className="absolute inset-0 opacity-20">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse">
                <path d="M 80 0 L 0 0 0 80" fill="none" stroke="white" strokeWidth="0.8" opacity="0.15"/>
                <circle cx="40" cy="40" r="2" fill="white" opacity="0.1"/>
              </pattern>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.3"/>
                <stop offset="100%" stopColor="#EC4899" stopOpacity="0.1"/>
              </linearGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)"/>
            <motion.line 
              x1="0" y1="50%" x2="100%" y2="50%" 
              stroke="url(#lineGradient)" 
              strokeWidth="2" 
              animate={{ x2: [0, "100vw", 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />
          </svg>
        </div>
      </div>

      {/* Enhanced Navigation Header */}
      <motion.header 
        className="relative z-20 px-8 py-8"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Floating Notification Badge */}
        <motion.div
          className="absolute top-4 right-4 bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 text-white px-4 py-2 rounded-full text-xs font-semibold shadow-lg border border-green-400/30 backdrop-blur-sm"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.5, duration: 0.5, type: "spring" }}
          whileHover={{ 
            scale: 1.05, 
            boxShadow: "0 10px 25px rgba(34, 197, 94, 0.4)"
          }}
        >
          <div className="flex items-center gap-2">
            <motion.div
              className="w-2 h-2 bg-white rounded-full"
              animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span>NEW: AI Interview 2.0</span>
          </div>
        </motion.div>

        <div className="container mx-auto flex flex-col items-center">
          <div className="text-4xl md:text-6xl font-bold mt-8">
            <span className="bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent drop-shadow-lg">Talent</span>
            <span className="bg-gradient-to-r from-cyan-200 via-purple-200 to-white bg-clip-text text-transparent drop-shadow-lg ml-2">Bridge</span>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="relative z-10 min-h-screen flex items-center justify-center px-4 py-8">
        <div className="container mx-auto">
          <motion.div 
            className="text-center mb-2"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight leading-none">
              <motion.span 
                className="inline bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 bg-clip-text text-transparent drop-shadow-lg"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Beyond Grades.
              </motion.span>
              <motion.span 
                className="inline bg-gradient-to-r from-orange-400 via-amber-400 to-orange-400 bg-clip-text text-transparent drop-shadow-lg ml-4"
                style={{ textShadow: "0 0 40px rgba(251, 146, 60, 0.8)" }}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                Powered by Skills.
              </motion.span>
            </h1>
            
            <motion.p 
              className="text-lg md:text-xl text-white/80 font-light max-w-3xl mx-auto mb-12 leading-relaxed px-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              Redefine campus placements with AI‑driven interviews, smart talent matching, and effortless recruiter‑student collaboration.
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-6 justify-center items-center px-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <Link to="/auth/student" className="block">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-700 hover:via-pink-700 hover:to-purple-700 text-white px-8 py-3 rounded-full text-base font-bold shadow-2xl hover:shadow-purple-500/50 hover:shadow-2xl hover:shadow-purple-400/70 transition-all duration-300 relative overflow-hidden group"
                  >
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      initial={{ x: '-100%' }}
                      whileHover={{ x: '100%' }}
                      transition={{ duration: 0.5 }}
                    />
                    <span className="relative z-10 flex items-center">
                      Get Started <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                    </span>
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div 
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-white/50 rounded-full mt-2"></div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats & Features Section */}
      <section id="stats-section" className="relative z-10 min-h-screen flex items-center justify-center px-8 py-16">
        <div className="container mx-auto">
          {/* Stats Section */}
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={index}
                  className="bg-white/8 backdrop-blur-md rounded-3xl p-8 border border-white/15 text-center hover:bg-white/12 transition-all duration-500 group"
                  whileHover={{ 
                    scale: 1.08, 
                    y: -8,
                    boxShadow: "0 20px 40px rgba(168, 85, 247, 0.3)"
                  }}
                  transition={{ duration: 0.3, type: "spring" }}
                >
                  <motion.div
                    className="w-16 h-16 bg-gradient-to-br from-purple-500 via-pink-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:rotate-12 transition-transform duration-500 shadow-lg"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </motion.div>
                  <h3 className="text-4xl font-bold text-white mb-2 group-hover:text-purple-200 transition-colors duration-300">
                    <AnimatedCounter value={stat.value} duration={1.5} />
                  </h3>
                  <p className="text-sm text-white/70 group-hover:text-white/90 transition-colors duration-300">{stat.label}</p>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Features Bar */}
          <motion.div 
            className="flex flex-wrap justify-center gap-6 mb-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  className="flex items-center gap-3 text-white/70 hover:text-white transition-all duration-300 group cursor-pointer"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: feature.delay, duration: 0.5 }}
                  whileHover={{ scale: 1.05, x: 5 }}
                >
                  <motion.div
                    className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center group-hover:from-purple-500/40 group-hover:to-pink-500/40 transition-all duration-300"
                    whileHover={{ rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    <Icon className="w-5 h-5 text-purple-400 group-hover:text-purple-300 transition-colors duration-300" />
                  </motion.div>
                  <span className="text-sm font-medium group-hover:translate-x-1 transition-transform duration-300">{feature.text}</span>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Section Navigation */}
          <div className="text-center">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                variant="outline" 
                size="lg"
                className="border-white/40 text-white bg-white/10 hover:bg-white/20 hover:border-white/60 px-8 py-3 rounded-full text-base font-medium backdrop-blur-sm transition-all duration-300 group hover:shadow-lg hover:shadow-white/20"
                onClick={() => {
                  const element = document.getElementById('stats-section');
                  element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
              >
                <span className="flex items-center group-hover:translate-y-[-2px] transition-transform duration-300">
                  Explore Roles <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                </span>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Role Cards & CTA Section */}
      <section id="role-cards" className="relative z-10 min-h-screen flex items-center justify-center px-8 py-16">
        <div className="container mx-auto">
          {/* Role Cards */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
            {roleCards.map((role, index) => {
              const Icon = role.icon;
              return (
                <motion.div
                  key={role.id}
                  initial={{ opacity: 0, y: 80 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + index * 0.2, duration: 0.8, type: "spring" }}
                >
                  <Link to={role.path} className="block group h-full">
                    <motion.div
                      className="relative h-[550px] rounded-3xl p-8 border border-white/10 overflow-hidden backdrop-blur-sm hover-card"
                      whileHover={{ 
                        scale: 1.05, 
                        y: -10,
                        boxShadow: "0 30px 60px rgba(168, 85, 247, 0.4), 0 0 40px rgba(168, 85, 247, 0.3), inset 0 0 20px rgba(255, 255, 255, 0.1)",
                        rotateY: 5
                      }}
                      transition={{ duration: 0.4, type: "spring" }}
                    >
                      {/* Background Gradient with enhanced animation */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${role.gradient} opacity-90`} />
                      <motion.div 
                        className={`absolute inset-0 bg-gradient-to-br ${role.hoverGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-700`} 
                      />
                      
                      {/* Animated particles overlay */}
                      <div className="absolute inset-0 overflow-hidden">
                        {[...Array(6)].map((_, i) => (
                          <motion.div
                            key={i}
                            className="absolute w-1 h-1 bg-white/40 rounded-full"
                            initial={{ 
                              x: Math.random() * 100, 
                              y: Math.random() * 100,
                              opacity: 0
                            }}
                            animate={{ 
                              x: Math.random() * 100,
                              y: Math.random() * 100,
                              opacity: [0, 0.8, 0]
                            }}
                            transition={{ 
                              duration: 3 + Math.random() * 2, 
                              repeat: Infinity, 
                              delay: Math.random() * 2 
                            }}
                          />
                        ))}
                      </div>
                      
                      {/* Content */}
                      <div className="relative z-10 h-full flex flex-col">
                        {/* Icon with enhanced animation */}
                        <motion.div
                          className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center mb-8 flex-shrink-0 shadow-xl hover-icon"
                          whileHover={{ 
                            scale: 1.15, 
                            rotate: 15,
                            boxShadow: "0 15px 30px rgba(0,0,0,0.3)",
                            background: "linear-gradient(45deg, rgba(255,255,255,0.3), rgba(255,255,255,0.1))"
                          }}
                          transition={{ duration: 0.3, type: "spring" }}
                        >
                          <Icon className="w-12 h-12 text-white hover:text-yellow-300 transition-colors duration-300" />
                        </motion.div>
                        
                        {/* Title */}
                        <motion.h3 
                          className="text-4xl font-bold text-white mb-8 flex-shrink-0 hover-title group-hover:text-yellow-200 transition-all duration-500"
                          whileHover={{ scale: 1.05 }}
                        >
                          {role.title}
                        </motion.h3>
                        
                        {/* Features with enhanced animations */}
                        <div className="space-y-3 mb-8 flex-1">
                          {role.features.map((feature, idx) => (
                            <motion.div 
                              key={idx} 
                              className="flex items-center gap-3 text-white/70 text-sm group/item hover:text-white transition-colors duration-300 hover-feature"
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 1 + idx * 0.1, duration: 0.5 }}
                              whileHover={{ x: 5 }}
                            >
                              <motion.div
                                className="w-5 h-5 flex-shrink-0 particle"
                                whileHover={{ scale: 1.2, rotate: 360 }}
                                transition={{ duration: 0.4 }}
                              >
                                <CheckCircle className="w-5 h-5 text-green-400 group-hover/item:text-green-300 transition-colors duration-300" />
                              </motion.div>
                              <span className="line-clamp-1 group-hover/item:translate-x-1 transition-transform duration-300">{feature}</span>
                            </motion.div>
                          ))}
                        </div>
                        
                        {/* Stats with enhanced animation */}
                        <div className="flex items-center justify-between pt-6 border-t border-white/20 flex-shrink-0">
                          <div>
                            <motion.p 
                              className="text-3xl font-bold text-white group-hover:text-yellow-200 transition-colors duration-500"
                              whileHover={{ scale: 1.1 }}
                            >
                              {role.stats.value}
                            </motion.p>
                            <p className="text-xs text-white/60 group-hover:text-white/80 transition-colors duration-300">{role.stats.label}</p>
                          </div>
                          <motion.div
                            className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center shadow-lg"
                            whileHover={{ 
                              scale: 1.3, 
                              rotate: 45,
                              background: "linear-gradient(45deg, rgba(255,255,255,0.3), rgba(255,255,255,0.1))"
                            }}
                            transition={{ duration: 0.3, type: "spring" }}
                          >
                            <ArrowRight className="w-6 h-6 text-white group-hover:translate-x-1 transition-transform duration-300" />
                          </motion.div>
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                </motion.div>
              );
            })}
          </div>

          {/* Enhanced CTA Section */}
          <motion.div
            className="text-center py-20"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.8 }}
          >
            <div 
              className="bg-gradient-to-r from-purple-600/30 via-pink-600/30 to-purple-600/30 backdrop-blur-xl rounded-4xl p-16 border border-white/20 shadow-2xl relative overflow-hidden"
            >
              {/* Animated background elements */}
              <div className="absolute inset-0 overflow-hidden">
                <motion.div
                  className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent opacity-50"
                  animate={{ x: [0, 100, 0] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                />
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-white/30 rounded-full"
                    initial={{ 
                      x: Math.random() * 100, 
                      y: Math.random() * 100,
                      opacity: 0
                    }}
                    animate={{ 
                      x: Math.random() * 100,
                      y: Math.random() * 100,
                      opacity: [0, 0.6, 0]
                    }}
                    transition={{ 
                      duration: 4 + Math.random() * 3, 
                      repeat: Infinity, 
                      delay: Math.random() * 2 
                    }}
                  />
                ))}
              </div>
              
              <div className="relative z-10">
                <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
                  <span className="bg-gradient-to-r from-slate-200 via-slate-100 to-white bg-clip-text text-transparent drop-shadow-lg">
                    Ready to Transform
                  </span>
                  <br />
                  <span className="bg-gradient-to-r from-white via-slate-100 to-slate-200 bg-clip-text text-transparent drop-shadow-lg">
                    Your Career?
                  </span>
                </h2>
                <p 
                  className="text-xl md:text-2xl text-white/80 mb-12 max-w-3xl mx-auto leading-relaxed"
                >
                  Join thousands of students, colleges, and recruiters who are already using TalentBridge to achieve their career goals with AI-powered excellence.
                </p>
                <div 
                  className="flex flex-col sm:flex-row gap-6 justify-center"
                >
                  <Link to="/auth/student" className="block">
                    <div>
                      <Button
                        size="lg"
                        className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-700 hover:via-pink-700 hover:to-purple-700 text-white px-12 py-5 rounded-full text-xl font-bold shadow-2xl hover:shadow-purple-500/60 transition-all duration-300 relative overflow-hidden group"
                      >
                        <div 
                          className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        />
                        <span className="relative z-10 flex items-center">
                          Get Started Now <Rocket className="w-6 h-6 ml-3 group-hover:translate-x-2 group-hover:rotate-12 transition-all duration-300" />
                        </span>
                      </Button>
                    </div>
                  </Link>
                  <div>
                    <Button
                      variant="outline"
                      size="lg"
                      className="border-white/40 text-white bg-white/10 hover:bg-white/20 hover:border-white/60 px-12 py-5 rounded-full text-xl font-medium backdrop-blur-sm transition-all duration-300 group"
                      onClick={() => {
                        const element = document.getElementById('footer');
                        element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }}
                    >
                      <span className="flex items-center group-hover:translate-y-[-2px] transition-transform duration-300">
                        Learn More <ChevronRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform duration-300" />
                      </span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Enhanced Footer Section */}
      <footer id="footer" className="relative z-10 border-t border-white/10 bg-black/30 backdrop-blur-xl">
        <div className="container mx-auto px-8 py-16">
          <motion.div 
            className="grid md:grid-cols-4 gap-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.3, duration: 0.8 }}
          >
            <motion.div 
              className="space-y-4"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div 
                className="flex items-center gap-3"
                whileHover={{ scale: 1.05 }}
              >
                <h3 className="text-3xl font-bold">
                  <span className="bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">Talent</span>
                  <span className="bg-gradient-to-r from-cyan-200 via-purple-200 to-white bg-clip-text text-transparent">Bridge</span>
                </h3>
              </motion.div>
              <p className="text-white/60 text-sm leading-relaxed">
                AI-powered recruitment platform connecting talent with opportunity through cutting-edge technology and intelligent matching.
              </p>
              <motion.div 
                className="flex items-center gap-2 text-white/40 text-xs"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.5, duration: 0.6 }}
              >
                <Star className="w-3 h-3 text-yellow-400" />
                <span>Trusted by 10,000+ users</span>
              </motion.div>
            </motion.div>
            
            <motion.div 
              className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.4, duration: 0.6 }}
            >
              <h4 className="text-white font-bold text-lg mb-4">Product</h4>
              <ul className="space-y-3 text-white/60 text-sm">
                {['Features', 'Pricing', 'Success Stories', 'API'].map((item, idx) => (
                  <motion.li 
                    key={idx} 
                    className="hover:text-white transition-colors duration-300 cursor-pointer hover:translate-x-1 transform"
                    whileHover={{ x: 5 }}
                  >
                    {item}
                  </motion.li>
                ))}
              </ul>
            </motion.div>
            
            <motion.div 
              className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.5, duration: 0.6 }}
            >
              <h4 className="text-white font-bold text-lg mb-4">Company</h4>
              <ul className="space-y-3 text-white/60 text-sm">
                {['About Us', 'Careers', 'Blog', 'Contact'].map((item, idx) => (
                  <motion.li 
                    key={idx} 
                    className="hover:text-white transition-colors duration-300 cursor-pointer hover:translate-x-1 transform"
                    whileHover={{ x: 5 }}
                  >
                    {item}
                  </motion.li>
                ))}
              </ul>
            </motion.div>
            
            <motion.div 
              className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.6, duration: 0.6 }}
            >
              <h4 className="text-white font-bold text-lg mb-4">Connect</h4>
              <div className="flex gap-4">
                {[Heart, Globe, MessageCircle].map((Icon, idx) => (
                  <motion.div
                    key={idx}
                    className="w-12 h-12 bg-slate-700/50 hover:bg-slate-600/50 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 group border border-slate-600/30 hover-link"
                    whileHover={{ 
                      scale: 1.1, 
                      rotate: 5,
                      boxShadow: "0 10px 20px rgba(0, 0, 0, 0.3)"
                    }}
                    transition={{ duration: 0.3, type: "spring" }}
                  >
                    <Icon className="w-6 h-6 text-slate-300 group-hover:text-slate-100 transition-colors duration-300" />
                  </motion.div>
                ))}
              </div>
              <motion.p 
                className="text-white/40 text-xs mt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.8, duration: 0.6 }}
              >
                Join our community of innovators
              </motion.p>
            </motion.div>
          </motion.div>
          
          <motion.div 
            className="border-t border-slate-700/50 mt-12 pt-12 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.9, duration: 0.6 }}
          >
            <p className="text-slate-400 text-sm flex items-center justify-center gap-2">
              © 2024 TalentBridge. All rights reserved. 
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Heart className="w-4 h-4 inline text-slate-500 mx-2" />
              </motion.span>
              Made with passion for talent worldwide
            </p>
          </motion.div>
        </div>
      </footer>
    </div>
  );
};

export default Welcome;
