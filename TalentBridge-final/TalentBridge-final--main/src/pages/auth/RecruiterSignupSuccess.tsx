import { useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { BadgeCheck, ArrowLeft, Sparkles, Briefcase, LogIn, Users, Target } from "lucide-react";
import { Button } from "@/components/ui/button";

const RecruiterSignupSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const recruiterName = searchParams.get("name") || "Talent Partner";

  useEffect(() => {
    const fromSignup = searchParams.get("created");
    if (!fromSignup) {
      navigate("/auth/recruiter", { replace: true });
    }
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-900 flex items-center justify-center px-4 py-10 relative overflow-hidden">
      <motion.div
        className="absolute inset-0 opacity-60"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="absolute top-10 left-12 w-64 h-64 bg-emerald-500/25 blur-3xl rounded-full animate-pulse" />
        <div className="absolute bottom-12 right-14 w-72 h-72 bg-lime-400/20 blur-3xl rounded-full animate-pulse" />
      </motion.div>

      <motion.div
        className="relative w-full max-w-4xl bg-white/5 border border-white/10 rounded-3xl shadow-2xl backdrop-blur-xl overflow-hidden"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-green-500/10 to-lime-500/10" />
        <div className="relative p-10 md:p-14">
          <Link to="/auth/recruiter" className="inline-flex items-center text-white/60 hover:text-white transition-colors mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Recruiter Portal
          </Link>

          <div className="grid md:grid-cols-[1.1fr_0.9fr] gap-10 items-center">
            <div>
              <motion.div
                className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-500 via-green-500 to-lime-400 text-white shadow-2xl mb-8"
                initial={{ scale: 0.8, rotate: -10, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2, type: "spring" }}
              >
                <BadgeCheck className="w-12 h-12" />
              </motion.div>
              <motion.h1
                className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                Recruiter account activated!
              </motion.h1>
              <p className="text-lg md:text-xl text-white/80 mb-6 leading-relaxed">
                {recruiterName}, your TalentBridge hiring workspace is ready. Sign in with the credentials you just created to start launching drives, shortlisting candidates, and collaborating with colleges in real time.
              </p>

              <div className="bg-white/10 border border-white/10 rounded-2xl p-5 mb-6 text-white/80 space-y-3">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-lime-300" />
                  <span>Next steps</span>
                </div>
                <ul className="list-disc pl-6 text-sm text-white/70 space-y-1">
                  <li>Use your email & password to log in securely.</li>
                  <li>Create or join college drives and invite hiring managers.</li>
                  <li>Leverage AI-powered insights to prioritize top applicants.</li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="bg-gradient-to-r from-emerald-600 via-green-500 to-lime-400 text-white px-8">
                  <Link to="/auth/recruiter">
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
              <div className="absolute -top-6 -right-6 w-20 h-20 rounded-3xl bg-gradient-to-br from-lime-400 to-emerald-500 flex items-center justify-center shadow-2xl">
                <Briefcase className="w-10 h-10 text-white" />
              </div>
              <p className="text-sm uppercase tracking-[0.3em] text-white/60 mb-6">What to expect</p>

              <div className="space-y-6">
                {[ 
                  {
                    title: "AI Shortlisting Engine",
                    copy: "Review high-match candidates instantly with transparent scoring."
                  },
                  {
                    title: "Collaborative Drive Control",
                    copy: "Plan assessments, track interviews, and align teams in one workspace."
                  },
                  {
                    title: "Talent Intelligence Dashboards",
                    copy: "Monitor pipeline health, offer velocity, and hiring effectiveness."
                  }
                ].map((item, idx) => (
                  <motion.div
                    key={item.title}
                    className="bg-white/5 border border-white/10 rounded-2xl p-4"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + idx * 0.1, duration: 0.5 }}
                  >
                    <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                      {idx === 0 ? <Users className="w-5 h-5 text-lime-300" /> : idx === 1 ? <Briefcase className="w-5 h-5 text-lime-300" /> : <Target className="w-5 h-5 text-lime-300" />}
                      {item.title}
                    </h3>
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

export default RecruiterSignupSuccess;
