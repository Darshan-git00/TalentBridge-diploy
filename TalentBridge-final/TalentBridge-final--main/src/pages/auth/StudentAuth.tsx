import { useState } from "react";
import AuthCard from "@/components/auth/AuthCard";

const StudentAuth = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <AuthCard
      type="student"
      title="Student Portal"
      subtitle="Connect with top companies, showcase your skills, and accelerate your career journey with AI-powered interviews and personalized opportunities."
      isLogin={isLogin}
      onToggleMode={() => setIsLogin(!isLogin)}
    />
  );
};

export default StudentAuth;
