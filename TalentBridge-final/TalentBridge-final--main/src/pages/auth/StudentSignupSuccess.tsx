import { useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, ArrowLeft, Sparkles, GraduationCap, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";

const StudentSignupSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const studentName = searchParams.get("name") || "Future Trailblazer";

  useEffect(() => {
    const fromSignup = searchParams.get("created");
    if (!fromSignup) {
      navigate("/auth/student", { replace: true });
    }
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center px-4 py-10 relative overflow-hidden">
      <motion.div
        className="absolute inset-0 opacity-60"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="absolute top-10 left-16 w-64 h-64 bg-blue-500/20 blur-3xl rounded-full animate-pulse" />
        <div className="absolute bottom-16 right-20 w-72 h-72 bg-cyan-500/20 blur-3xl rounded-full animate-pulse" />
      </motion.div>

      <motion.div
        className="relative w-full max-w-4xl bg-white/5 border border-white/10 rounded-3xl shadow-2xl backdrop-blur-xl overflow-hidden"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-cyan-500/10 to-purple-500/10" />
        <div className="relative p-10 md:p-14">
          <Link to="/auth/student" className="inline-flex items-center text-white/60 hover:text-white transition-colors mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Student Portal
          </Link>

          <div className="grid md:grid-cols-[1.1fr_0.9fr] gap-10 items-center">
            <div>
              <motion.div
                className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-2xl mb-8"
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
                Student account ready!
              </motion.h1>
              <p className="text-lg md:text-xl text-white/80 mb-6 leading-relaxed">
                {studentName}, your TalentBridge profile has been created successfully. Sign in anytime to explore drives,
                practice AI-powered interviews, and unlock personalized career intelligence.
              </p>

              <div className="bg-white/10 border border-white/10 rounded-2xl p-5 mb-6 text-white/80 space-y-3">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-cyan-300" />
                  <span>Next steps</span>
                </div>
                <ul className="list-disc pl-6 text-sm text-white/70 space-y-1">
                  <li>Use the email & password you just created to sign in securely.</li>
                  <li>Complete your profile to get the best AI-driven recommendations.</li>
                  <li>Track drives, interviews, and offers from a unified dashboard.</li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-500 text-white px-8">
                  <Link to="/auth/student">
                    <LogIn className="w-5 h-5 mr-2" />
                    Go to Login
                  </Link>
                </Button>
              </div>
            </div>

            <motion.div
              className="relative bg-white/5 border border-white/10 rounded-3xl p-8 text-white"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <div className="absolute -top-6 -right-6 w-20 h-20 rounded-3xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-2xl">
                <GraduationCap className="w-10 h-10 text-white" />
              </div>
              <p className="text-sm uppercase tracking-[0.3em] text-white/60 mb-6">What to expect</p>

              <div className="space-y-6">
                {[
                  {
                    title: "AI Interview Readiness",
                    copy: "Practice with real-time AI feedback and boost your confidence before every drive."
                  },
                  {
                    title: "Personalized Drive Feed",
                    copy: "Discover roles curated for your skills, CGPA, and aspirations."
                  },
                  {
                    title: "Smart Progress Tracking",
                    copy: "Monitor applications, interviews, and offers in a single intelligent view."
                  }
                ].map((item, idx) => (
                  <motion.div
                    key={item.title}
                    className="bg-white/5 border border-white/10 rounded-2xl p-4"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + idx * 0.1, duration: 0.5 }}
                  >
                    <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                    <p className="text-sm text-white/70">{item.copy}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default StudentSignupSuccess;
