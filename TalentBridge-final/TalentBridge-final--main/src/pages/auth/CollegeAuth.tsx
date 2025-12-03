import { useState } from "react";
import AuthCard from "@/components/auth/AuthCard";

const CollegeAuth = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <AuthCard
      type="college"
      title="College Portal"
      subtitle="Empower your students with cutting-edge placement opportunities, AI-powered interviews, and seamless collaboration with top companies worldwide."
      isLogin={isLogin}
      onToggleMode={() => setIsLogin(!isLogin)}
    />
  );
};

export default CollegeAuth;
