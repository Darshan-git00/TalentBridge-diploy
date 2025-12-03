import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  CheckCircle, 
  AlertCircle,
  Mail,
  Lock,
  User,
  Phone,
  Building,
  GraduationCap,
  Briefcase,
  Calendar,
  MapPin,
  Globe,
  Award,
  Users,
  Shield,
  Sparkles
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface AuthCardProps {
  type: "student" | "college" | "recruiter";
  title: string;
  subtitle: string;
  isLogin: boolean;
  onToggleMode: () => void;
}

const AuthCard = ({ type, title, subtitle, isLogin, onToggleMode }: AuthCardProps) => {
  const { login, signup, isLoading: authLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [collegeId, setCollegeId] = useState("");
  const [collegeIdValid, setCollegeIdValid] = useState<boolean | null>(null);
  const navigate = useNavigate();

  // Form data state based on type
  const [formData, setFormData] = useState(() => {
    if (type === "student") {
      return {
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        course: "",
        branch: "",
        year: "",
        cgpa: "",
        skills: "",
        certifications: "",
        collegeId: "",
        agreeToTerms: false,
      };
    } else if (type === "college") {
      return {
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        address: "",
        website: "",
        establishedYear: "",
        type: "",
        accreditation: "",
        totalStudents: "",
        departments: "",
      };
    } else {
      return {
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        company: "",
        position: "",
        department: "",
        linkedinProfile: "",
        collegeId: "",
      };
    }
  });

  const getIcon = () => {
    switch (type) {
      case "student":
        return <GraduationCap className="w-8 h-8" />;
      case "college":
        return <Building className="w-8 h-8" />;
      case "recruiter":
        return <Briefcase className="w-8 h-8" />;
    }
  };

  const getThemeColors = () => {
    switch (type) {
      case "student":
        return {
          primary: "from-blue-500 to-cyan-500",
          secondary: "from-blue-100 to-cyan-100",
          text: "text-blue-600",
          border: "border-blue-200",
        };
      case "college":
        return {
          primary: "from-purple-500 to-pink-500",
          secondary: "from-purple-100 to-pink-100",
          text: "text-purple-600",
          border: "border-purple-200",
        };
      case "recruiter":
        return {
          primary: "from-green-500 to-emerald-500",
          secondary: "from-green-100 to-emerald-100",
          text: "text-green-600",
          border: "border-green-200",
        };
    }
  };

  const theme = getThemeColors();

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateCollegeId = async () => {
    if (!formData.collegeId) return;
    
    try {
      // TODO: Replace with actual API call to validate college ID
      // For now, we'll consider any non-empty college ID as valid
      setCollegeIdValid(!!formData.collegeId.trim());
    } catch (error) {
      setCollegeIdValid(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Validate passwords match for signup
      if (!isLogin && formData.password !== formData.confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }

      // College ID is now optional for student and recruiter signup
      // No validation needed for collegeId

      // Validate terms agreement for student signup
      if (!isLogin && type === "student") {
        if (!formData.agreeToTerms) {
          toast.error("You must agree to the Terms & Conditions before signing up.");
          return;
        }
      }

      if (isLogin) {
        // Login logic
        const success = await login(formData.email, formData.password, type);
        if (success) {
          toast.success("Login successful!");
          // Navigation is handled by the AuthContext
        } else {
          toast.error("Invalid email or password");
        }
      } else {
        // Signup logic
        const userData = {
          ...formData,
          name: formData.name, // All types use 'name' property
        };
        
        const result = await signup(userData, type);
        if (result.success) {
          if (type === "college" && result.collegeId) {
            navigate(`/auth/college-success?id=${result.collegeId}&name=${encodeURIComponent(formData.name)}`);
          } else if (type === "student") {
            navigate(`/auth/student-success?created=true&name=${encodeURIComponent(formData.name || "")}`);
          } else if (type === "recruiter") {
            navigate(`/auth/recruiter-success?created=true&name=${encodeURIComponent(formData.name || "")}`);
          } else {
            toast.success("Account created successfully!");
          }
        } else {
          toast.error("Email already exists or invalid data");
        }
      }
    } catch (error) {
      console.error("Authentication error:", error);
      toast.error("An error occurred. Please try again.");
    }
  };

  const renderLoginFields = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-base font-medium">Email Address</Label>
        <div className="relative">
          <Mail className="absolute left-4 top-4 w-5 h-5 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            className="pl-12 h-14 rounded-xl border-border/60 focus:border-primary text-lg"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-base font-medium">Password</Label>
        <div className="relative">
          <Lock className="absolute left-4 top-4 w-5 h-5 text-muted-foreground" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={formData.password}
            onChange={(e) => handleInputChange("password", e.target.value)}
            className="pl-12 pr-12 h-14 rounded-xl border-border/60 focus:border-primary text-lg"
            autoComplete="current-password"
            required
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-3 top-3 h-8 w-8 p-0"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </Button>
        </div>
      </div>
    </div>
  );

  const renderSignupFields = () => {
    if (type === "student") {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-sm font-medium">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="firstName"
                  placeholder="Full name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="pl-10 h-11 rounded-xl border-border/60 focus:border-primary"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="pl-10 h-11 rounded-xl border-border/60 focus:border-primary"
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium">Phone Number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                id="phone"
                placeholder="Phone number"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                className="pl-10 h-11 rounded-xl border-border/60 focus:border-primary"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="collegeId" className="text-sm font-medium">College ID (Optional)</Label>
            <div className="relative">
              <Shield className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                id="collegeId"
                placeholder="e.g., CLG-XYZ123 (optional)"
                value={formData.collegeId}
                onChange={(e) => {
                  handleInputChange("collegeId", e.target.value);
                  setCollegeIdValid(null);
                }}
                onBlur={validateCollegeId}
                className={`pl-10 pr-10 h-11 rounded-xl border-border/60 focus:border-primary ${
                  collegeIdValid === false ? "border-red-300" : collegeIdValid === true ? "border-green-300" : ""
                }`}
              />
              {collegeIdValid !== null && (
                <div className="absolute right-3 top-3">
                  {collegeIdValid ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  )}
                </div>
              )}
            </div>
            {collegeIdValid === false && (
              <p className="text-xs text-red-500">Invalid College ID. Please check with your college.</p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="course" className="text-sm font-medium">Course</Label>
              <Input
                id="course"
                placeholder="e.g., B.Tech"
                value={formData.course}
                onChange={(e) => handleInputChange("course", e.target.value)}
                className="h-11 rounded-xl border-border/60 focus:border-primary"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="branch" className="text-sm font-medium">Branch</Label>
              <Input
                id="branch"
                placeholder="e.g., CSE"
                value={formData.branch}
                onChange={(e) => handleInputChange("branch", e.target.value)}
                className="h-11 rounded-xl border-border/60 focus:border-primary"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="year" className="text-sm font-medium">Year</Label>
              <select
                id="year"
                value={formData.year}
                onChange={(e) => handleInputChange("year", e.target.value)}
                className="w-full h-11 px-3 rounded-xl border-border/60 focus:border-primary bg-background"
                required
              >
                <option value="">Select year</option>
                <option value="1st">1st Year</option>
                <option value="2nd">2nd Year</option>
                <option value="3rd">3rd Year</option>
                <option value="4th">4th Year</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cgpa" className="text-sm font-medium">CGPA</Label>
              <Input
                id="cgpa"
                type="number"
                step="0.01"
                min="0"
                max="10"
                placeholder="e.g., 8.5"
                value={formData.cgpa}
                onChange={(e) => handleInputChange("cgpa", e.target.value)}
                className="h-11 rounded-xl border-border/60 focus:border-primary"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="skills" className="text-sm font-medium">Skills</Label>
              <Input
                id="skills"
                placeholder="e.g., React, Python, Java"
                value={formData.skills}
                onChange={(e) => handleInputChange("skills", e.target.value)}
                className="h-11 rounded-xl border-border/60 focus:border-primary"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="certifications" className="text-sm font-medium">Certifications (Optional)</Label>
            <Input
              id="certifications"
              placeholder="e.g., AWS Certified, Google Cloud"
              value={formData.certifications}
              onChange={(e) => handleInputChange("certifications", e.target.value)}
              className="h-11 rounded-xl border-border/60 focus:border-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create password"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  className="pl-10 pr-10 h-11 rounded-xl border-border/60 focus:border-primary"
                  autoComplete="new-password"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-2 h-7 w-7 p-0"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  className="pl-10 pr-10 h-11 rounded-xl border-border/60 focus:border-primary"
                  autoComplete="new-password"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-2 h-7 w-7 p-0"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-start space-x-2">
              <Checkbox
                id="agreeToTerms"
                checked={formData.agreeToTerms}
                onCheckedChange={(checked) => handleInputChange("agreeToTerms", checked as boolean)}
                className="mt-0.5"
              />
              <Label htmlFor="agreeToTerms" className="text-sm text-muted-foreground leading-relaxed">
                I confirm that all information I provide is true. If any data is found to be false, I understand that I may become ineligible to use TalentBridge.
              </Label>
            </div>
          </div>
        </div>
      );
    } else if (type === "college") {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="collegeName" className="text-sm font-medium">College Name</Label>
            <div className="relative">
              <Building className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                id="collegeName"
                placeholder="Enter college name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="pl-10 h-11 rounded-xl border-border/60 focus:border-primary"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Official Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="college@edu.in"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="pl-10 h-11 rounded-xl border-border/60 focus:border-primary"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="phone"
                  placeholder="Contact number"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className="pl-10 h-11 rounded-xl border-border/60 focus:border-primary"
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="text-sm font-medium">Address</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                id="address"
                placeholder="College address"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                className="pl-10 h-11 rounded-xl border-border/60 focus:border-primary"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="website" className="text-sm font-medium">Website</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="website"
                  placeholder="www.college.edu"
                  value={formData.website}
                  onChange={(e) => handleInputChange("website", e.target.value)}
                  className="pl-10 h-11 rounded-xl border-border/60 focus:border-primary"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="established" className="text-sm font-medium">Established Year</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="established"
                  placeholder="e.g., 1960"
                  value={formData.establishedYear}
                  onChange={(e) => handleInputChange("establishedYear", e.target.value)}
                  className="pl-10 h-11 rounded-xl border-border/60 focus:border-primary"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="type" className="text-sm font-medium">College Type</Label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) => handleInputChange("type", e.target.value)}
                className="w-full h-11 px-3 rounded-xl border-border/60 focus:border-primary bg-background"
                required
              >
                <option value="">Select type</option>
                <option value="Engineering">Engineering</option>
                <option value="Medical">Medical</option>
                <option value="Arts">Arts & Science</option>
                <option value="Management">Management</option>
                <option value="Pharmacy">Pharmacy</option>
                <option value="Law">Law</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="accreditation" className="text-sm font-medium">Accreditation</Label>
              <div className="relative">
                <Award className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="accreditation"
                  placeholder="e.g., NAAC A++"
                  value={formData.accreditation}
                  onChange={(e) => handleInputChange("accreditation", e.target.value)}
                  className="pl-10 h-11 rounded-xl border-border/60 focus:border-primary"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="students" className="text-sm font-medium">Total Students</Label>
              <div className="relative">
                <Users className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="students"
                  type="number"
                  placeholder="e.g., 5000"
                  value={formData.totalStudents}
                  onChange={(e) => handleInputChange("totalStudents", e.target.value)}
                  className="pl-10 h-11 rounded-xl border-border/60 focus:border-primary"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="departments" className="text-sm font-medium">Departments</Label>
            <Input
              id="departments"
              placeholder="e.g., CSE, ECE, MECH, CIVIL"
              value={formData.departments}
              onChange={(e) => handleInputChange("departments", e.target.value)}
              className="h-11 rounded-xl border-border/60 focus:border-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create password"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  className="pl-10 pr-10 h-11 rounded-xl border-border/60 focus:border-primary"
                  autoComplete="new-password"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-2 h-7 w-7 p-0"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  className="pl-10 pr-10 h-11 rounded-xl border-border/60 focus:border-primary"
                  autoComplete="new-password"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-2 h-7 w-7 p-0"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </div>
        </div>
      );
    } else {
      // Recruiter signup
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="name"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="pl-10 h-11 rounded-xl border-border/60 focus:border-primary"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Work Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="pl-10 h-11 rounded-xl border-border/60 focus:border-primary"
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium">Phone Number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                id="phone"
                placeholder="Contact number"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                className="pl-10 h-11 rounded-xl border-border/60 focus:border-primary"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="company" className="text-sm font-medium">Company Name</Label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                id="company"
                placeholder="Company name"
                value={formData.company}
                onChange={(e) => handleInputChange("company", e.target.value)}
                className="pl-10 h-11 rounded-xl border-border/60 focus:border-primary"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="position" className="text-sm font-medium">Position</Label>
              <Input
                id="position"
                placeholder="e.g., HR Manager"
                value={formData.position}
                onChange={(e) => handleInputChange("position", e.target.value)}
                className="h-11 rounded-xl border-border/60 focus:border-primary"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department" className="text-sm font-medium">Department</Label>
              <Input
                id="department"
                placeholder="e.g., Human Resources"
                value={formData.department}
                onChange={(e) => handleInputChange("department", e.target.value)}
                className="h-11 rounded-xl border-border/60 focus:border-primary"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="collegeId" className="text-sm font-medium">College ID (Optional)</Label>
            <div className="relative">
              <Shield className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                id="collegeId"
                placeholder="e.g., CLG-XYZ123 (optional)"
                value={formData.collegeId}
                onChange={(e) => {
                  handleInputChange("collegeId", e.target.value);
                  setCollegeIdValid(null);
                }}
                onBlur={validateCollegeId}
                className={`pl-10 pr-10 h-11 rounded-xl border-border/60 focus:border-primary ${
                  collegeIdValid === false ? "border-red-300" : collegeIdValid === true ? "border-green-300" : ""
                }`}
              />
              {collegeIdValid !== null && (
                <div className="absolute right-3 top-3">
                  {collegeIdValid ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  )}
                </div>
              )}
            </div>
            {collegeIdValid === false && (
              <p className="text-xs text-red-500">Invalid College ID. Please check with your college.</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="linkedin" className="text-sm font-medium">LinkedIn Profile (Optional)</Label>
            <div className="relative">
              <Globe className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                id="linkedin"
                placeholder="linkedin.com/in/yourprofile"
                value={formData.linkedinProfile}
                onChange={(e) => handleInputChange("linkedinProfile", e.target.value)}
                className="pl-10 h-11 rounded-xl border-border/60 focus:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create password"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  className="pl-10 pr-10 h-11 rounded-xl border-border/60 focus:border-primary"
                  autoComplete="new-password"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-2 h-7 w-7 p-0"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  className="pl-10 pr-10 h-11 rounded-xl border-border/60 focus:border-primary"
                  autoComplete="new-password"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-2 h-7 w-7 p-0"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen flex items-stretch justify-center bg-background p-0">
      <div className="w-full max-w-none grid lg:grid-cols-2 gap-0 items-stretch min-h-screen overflow-hidden">
        {/* Left Side - Colored Branding Panel */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className={`hidden lg:flex relative bg-gradient-to-br ${theme.primary} p-12 text-white items-center justify-center`}
        >
          <div className="text-center space-y-8">
            {/* TalentBridge Logo */}
            <div className="flex justify-center mb-8">
              <span className="text-3xl md:text-4xl font-bold text-white">
                <span style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Talent</span>
                <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Bridge</span>
              </span>
            </div>
            
            {/* Glass Card */}
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl">
              <div className="space-y-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm shadow-xl">
                  {getIcon()}
                </div>
                
                <div className="space-y-4">
                  <h1 className="text-3xl font-bold text-white">
                    {title}
                  </h1>
                  <p className="text-base text-white/80 leading-relaxed">
                    {subtitle}
                  </p>
                </div>

                <div className="flex items-center justify-center space-x-3">
                  <Badge className="px-3 py-1.5 rounded-full bg-white/20 text-white text-sm border border-white/30">
                    <Sparkles className="w-3 h-3 mr-1.5" />
                    AI Powered
                  </Badge>
                  <Badge className="px-3 py-1.5 rounded-full bg-white/20 text-white text-sm border border-white/30">
                    Secure
                  </Badge>
                  <Badge className="px-3 py-1.5 rounded-full bg-white/20 text-white text-sm border border-white/30">
                    Fast
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Side - Auth Form */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative bg-white flex items-center justify-center p-8 lg:p-12"
        >
          <Card className="p-0 shadow-none border-0 bg-transparent">
            {/* Mobile Header */}
            <div className="lg:hidden text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-xl mb-4">
                {getIcon()}
              </div>
              <h1 className="text-2xl font-bold mb-2">{title}</h1>
              <p className="text-muted-foreground">{subtitle}</p>
            </div>

            {/* Back Button */}
            <Link to="/" className="inline-flex items-center gap-3 text-muted-foreground hover:text-foreground mb-8 transition-colors text-lg">
              <ArrowLeft className="w-5 h-5" />
              Back to home
            </Link>

            {/* Form Header */}
            <div className="mb-10">
              <h2 className="text-4xl font-bold mb-4 text-gray-900">
                {isLogin ? "Welcome Back" : "Create Account"}
              </h2>
              <p className="text-lg text-muted-foreground">
                {isLogin ? "Enter your credentials to access your account" : "Fill in your information to get started"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {isLogin ? renderLoginFields() : renderSignupFields()}

              <Button
                type="submit"
                className={`w-full h-16 rounded-xl font-bold text-lg bg-gradient-to-r ${theme.primary} text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02]`}
                disabled={authLoading || (!isLogin && type === "student" && !formData.agreeToTerms)}
              >
                {authLoading ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    {isLogin ? "Sign In" : "Create Account"}
                    <ArrowLeft className="w-5 h-5 rotate-180" />
                  </div>
                )}
              </Button>
            </form>

            <Separator className="my-8" />

            <div className="text-center space-y-4">
              <p className="text-lg text-muted-foreground">
                {isLogin ? "Don't have an account?" : "Already have an account?"}
              </p>
              <Button
                variant="link"
                onClick={onToggleMode}
                className={`font-bold text-lg ${theme.text} hover:opacity-80`}
              >
                {isLogin ? "Create Account" : "Sign In"}
              </Button>
            </div>

            {/* Role Switcher */}
            <div className="mt-8 pt-8 border-t border-border/60">
              <p className="text-center text-base text-muted-foreground mb-4">
                Not a {type}?
              </p>
              <div className="flex justify-center gap-3">
                {type !== "student" && (
                  <Link to="/auth/student">
                    <Button variant="outline" size="lg" className="rounded-lg px-6 py-3 text-base">
                      Student
                    </Button>
                  </Link>
                )}
                {type !== "college" && (
                  <Link to="/auth/college">
                    <Button variant="outline" size="lg" className="rounded-lg px-6 py-3 text-base">
                      College
                    </Button>
                  </Link>
                )}
                {type !== "recruiter" && (
                  <Link to="/auth/recruiter">
                    <Button variant="outline" size="lg" className="rounded-lg px-6 py-3 text-base">
                      Recruiter
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthCard;
