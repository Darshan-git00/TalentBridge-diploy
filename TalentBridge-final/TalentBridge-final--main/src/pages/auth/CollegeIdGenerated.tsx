import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building, CheckCircle, ArrowLeft, Eye, EyeOff, Copy, Shield, Sparkles } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";

const CollegeIdGenerated = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showId, setShowId] = useState(false);

  const collegeId = searchParams.get('id') || '';
  const collegeName = searchParams.get('name') || 'Your College';

  useEffect(() => {
    if (!collegeId) {
      // If no college ID is provided, redirect to college signup
      navigate('/auth/college');
    }
  }, [collegeId, navigate]);

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(collegeId);
      toast.success("College ID copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy College ID");
    }
  };

  const handleGoToDashboard = () => {
    navigate("/college/dashboard");
  };

  if (!collegeId) {
    return null; // Will redirect automatically
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 flex items-center justify-center px-4 py-10 relative overflow-hidden">
      {/* Floating accents */}
      <motion.div
        className="absolute inset-0 opacity-60"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="absolute top-16 left-10 w-72 h-72 bg-purple-500/30 blur-3xl rounded-full animate-pulse" />
        <div className="absolute bottom-10 right-14 w-80 h-80 bg-pink-500/20 blur-3xl rounded-full animate-pulse" />
      </motion.div>

      <motion.div
        className="relative w-full max-w-5xl bg-white/5 border border-white/10 rounded-3xl shadow-2xl backdrop-blur-xl overflow-hidden"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-indigo-500/10" />
        <div className="relative p-10 md:p-14">
          <Link to="/auth/college" className="inline-flex items-center text-white/60 hover:text-white transition-colors mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to College Portal
          </Link>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left column */}
            <div>
              <motion.div
                className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-2xl mb-8"
                initial={{ scale: 0.8, rotate: -10, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2, type: "spring" }}
              >
                <CheckCircle className="w-12 h-12" />
              </motion.div>
              <motion.h1
                className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                College registration complete!
              </motion.h1>
              <p className="text-lg md:text-xl text-white/80 mb-6 leading-relaxed">
                {collegeName} now has full access to TalentBridge’s college suite. Share your unique College ID with students and administrators to onboard them securely.
              </p>

              <div className="bg-white/10 border border-white/10 rounded-2xl p-5 mb-6 text-white/80 space-y-4">
                <div className="flex items-center gap-3 text-white">
                  <Sparkles className="w-5 h-5 text-pink-300" />
                  <span className="font-semibold">What happens next</span>
                </div>
                <ul className="text-sm text-white/70 space-y-2">
                  <li>• Share your College ID with placement officers and eligible students.</li>
                  <li>• Configure departments, drives, and analytics inside the dashboard.</li>
                  <li>• Track applications and interview intelligence in real time.</li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={handleGoToDashboard}
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 via-pink-500 to-purple-500 text-white px-10"
                >
                  Go to College Dashboard
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white/30 text-white hover:bg-white/10"
                  onClick={handleCopyId}
                >
                  Copy College ID
                </Button>
              </div>
            </div>

            {/* Right column */}
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <Card className="bg-white/10 border-white/15 text-white rounded-3xl p-6 backdrop-blur-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Building className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-white/70">Official Identifier</p>
                    <h2 className="text-xl font-semibold">College ID for {collegeName}</h2>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-4">
                  <div className="flex items-center justify-between mb-4">
                    <Badge className="px-3 py-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
                      Verified
                    </Badge>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowId(!showId)}
                        className="h-9 w-9 rounded-2xl bg-white/10 text-white hover:bg-white/20"
                        title={showId ? "Hide College ID" : "Show College ID"}
                      >
                        {showId ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleCopyId}
                        className="h-9 w-9 rounded-2xl bg-white/10 text-white hover:bg-white/20"
                        title="Copy College ID"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="text-center font-mono text-3xl font-bold tracking-widest">
                    {showId ? (
                      <span>{collegeId}</span>
                    ) : (
                      <span className="text-white/40">•••••••••</span>
                    )}
                  </div>
                </div>

                <div className="space-y-3 text-sm text-white/80">
                  <div className="flex items-center gap-3">
                    <Shield className="w-4 h-4 text-pink-300" />
                    <span>Store this ID securely; it grants access to your college workspace.</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Shield className="w-4 h-4 text-pink-300" />
                    <span>Share with verified placement officers and student administrators only.</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Shield className="w-4 h-4 text-pink-300" />
                    <span>Students will reference this ID during their registration flow.</span>
                  </div>
                </div>
              </Card>

              <Card className="bg-white/5 border-white/10 text-white rounded-3xl p-6 backdrop-blur-xl">
                <p className="text-sm uppercase tracking-[0.3em] text-white/60 mb-4">Need assistance?</p>
                <p className="text-white/80 mb-6">Our success team is available 24/7 to help you onboard departments, upload student data, and configure placement drives.</p>
                <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
                  Contact Support
                </Button>
              </Card>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default CollegeIdGenerated;
