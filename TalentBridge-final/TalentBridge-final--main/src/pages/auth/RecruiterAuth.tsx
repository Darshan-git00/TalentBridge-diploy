import { useState } from "react";
import AuthCard from "@/components/auth/AuthCard";

const RecruiterAuth = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <AuthCard
      type="recruiter"
      title="Recruiter Portal"
      subtitle="Find top talent, streamline your hiring process, and connect with qualified candidates through AI-powered interviews and smart matching algorithms."
      isLogin={isLogin}
      onToggleMode={() => setIsLogin(!isLogin)}
    />
  );
};

export default RecruiterAuth;
