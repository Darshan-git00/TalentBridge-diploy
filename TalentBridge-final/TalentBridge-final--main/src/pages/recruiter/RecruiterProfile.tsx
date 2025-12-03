import { useState, useEffect } from "react";
import RecruiterLayout from "@/components/layouts/RecruiterLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Building2, User, Mail, Phone, Briefcase } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { recruitersService } from "@/services";
import { Recruiter } from "@/services/types";

interface RecruiterProfileData {
  name: string;
  company: string;
  email: string;
  phone: string;
  position: string;
}

const RecruiterProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<RecruiterProfileData>({
    name: (user as Recruiter)?.name || "",
    company: (user as Recruiter)?.company || "",
    email: user?.email || "",
    phone: (user as Recruiter)?.phone || "",
    position: (user as Recruiter)?.position || "",
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load profile from user context or fetch from API
    if (user) {
      const recruiterUser = user as Recruiter;
      setProfile({
        name: recruiterUser.name || "",
        company: recruiterUser.company || "",
        email: recruiterUser.email || "",
        phone: recruiterUser.phone || "",
        position: recruiterUser.position || "",
      });
    }
  }, [user]);

  const handleSave = async () => {
    if (!user?.id) {
      toast.error('User ID not found');
      return;
    }
    
    setIsLoading(true);
    try {
      console.log('Updating profile with data:', profile);
      console.log('User ID:', user.id);
      
      // Update profile via API
      const response = await recruitersService.updateProfile(user.id, profile);
      console.log('Update response:', response);
      
      toast.success("Profile updated successfully!");
      
      // Update local state with the response data if available
      if (response.data) {
        const updatedRecruiter = response.data;
        setProfile({
          name: updatedRecruiter.name || "",
          company: updatedRecruiter.company || "",
          email: updatedRecruiter.email || "",
          phone: updatedRecruiter.phone || "",
          position: updatedRecruiter.position || "",
        });
      }
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      
      // Provide more specific error messages
      if (error.response?.status === 400) {
        toast.error('Invalid data provided');
      } else if (error.response?.status === 401) {
        toast.error('Unauthorized - Please login again');
      } else if (error.response?.status === 404) {
        toast.error('Profile endpoint not found');
      } else {
        toast.error('Failed to update profile - Please try again');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <RecruiterLayout>
      <div className="container mx-auto px-8 py-12 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-3">Recruiter Profile</h1>
          <p className="text-lg text-muted-foreground font-medium">Manage your recruiter information</p>
        </div>

        <Card className="p-8 rounded-2xl shadow-xl bg-card/80 dark:bg-card backdrop-blur">
          <div className="flex items-center gap-6 mb-10">
            <Avatar className="w-28 h-28 ring-4 ring-primary/20">
              <AvatarFallback className="bg-gradient-to-br from-primary via-secondary to-muted text-white text-3xl font-bold">
                {getInitials(profile.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-3xl font-extrabold mb-1">{profile.name}</h2>
              <p className="text-lg text-muted-foreground font-medium flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                {profile.company}
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="font-semibold flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Full Name
                </Label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="rounded-xl"
                  placeholder="Enter your full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company" className="font-semibold flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Company Name
                </Label>
                <Input
                  id="company"
                  value={profile.company}
                  onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                  className="rounded-xl"
                  placeholder="Enter your company name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="font-semibold flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="rounded-xl"
                placeholder="Enter your email address"
                disabled // Email typically shouldn't be editable
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="phone" className="font-semibold flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="rounded-xl"
                  placeholder="Enter your phone number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="position" className="font-semibold flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  Position
                </Label>
                <Input
                  id="position"
                  value={profile.position}
                  onChange={(e) => setProfile({ ...profile, position: e.target.value })}
                  className="rounded-xl"
                  placeholder="Enter your position"
                />
              </div>
            </div>

            <Button 
              onClick={handleSave} 
              variant="glowPrimary" 
              className="w-full rounded-xl mt-6" 
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </Card>
      </div>
    </RecruiterLayout>
  );
};

export default RecruiterProfile;
