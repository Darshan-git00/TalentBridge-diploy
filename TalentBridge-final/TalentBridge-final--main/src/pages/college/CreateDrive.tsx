import { useLocation, useNavigate } from "react-router-dom";
import CollegeLayout from "@/components/layouts/CollegeLayout";
import RecruiterLayout from "@/components/layouts/RecruiterLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useState } from "react";
import { addRecruiterDrive } from "@/lib/recruiterStorage";

const CreateDrive = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isRecruiter = location.pathname.includes("/recruiter");
  
  const [formData, setFormData] = useState({
    jobTitle: "",
    type: "Job",
    description: "",
    requiredSkills: "",
    company: "",
    location: "",
    salary: "",
    openings: "",
    experienceLevel: "",
    workMode: "Hybrid",
    applicationDeadline: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isRecruiter) {
      // Save to recruiter storage
      const skills = formData.requiredSkills.split(",").map(s => s.trim()).filter(s => s);
      const requirements = [
        `Bachelor's degree in Computer Science or related field`,
        `Strong knowledge of ${skills[0] || "relevant technologies"}`,
        `Experience with ${formData.experienceLevel || "0-2 years"}`,
        `Good problem-solving and analytical skills`,
      ];
      
      addRecruiterDrive({
        company: formData.company,
        logo: `https://api.dicebear.com/7.x/shapes/svg?seed=${formData.company.toLowerCase().replace(/\s+/g, "")}`,
        position: formData.jobTitle,
        type: formData.type as "Job" | "Internship",
        salary: formData.salary,
        location: formData.location,
        skills: skills,
        openings: parseInt(formData.openings) || 1,
        interviews: 0,
        status: "active",
        description: formData.description,
        requirements: requirements,
        experienceLevel: formData.experienceLevel || "0-2 years",
        applicationDeadline: formData.applicationDeadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        workMode: formData.workMode,
        applicants: 0,
        shortlisted: 0,
      });
      
      toast.success("Drive created successfully!");
      setTimeout(() => {
        navigate("/recruiter/drives");
      }, 1000);
    } else {
      // College side (keep existing behavior for now)
      toast.success("Position created successfully!");
      setTimeout(() => {
        navigate("/college/drives");
      }, 1000);
    }
  };

  const Layout = isRecruiter ? RecruiterLayout : CollegeLayout;
  const backPath = isRecruiter ? "/recruiter/drives" : "/college/drives";

  return (
    <Layout>
      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <Link to={backPath} className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Drives
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Add New Position</h1>
          <p className="text-muted-foreground">Create a new recruitment drive</p>
        </div>

        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="jobTitle">Job Title</Label>
              <Input
                id="jobTitle"
                placeholder="e.g., Software Engineer"
                value={formData.jobTitle}
                onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background z-50">
                    <SelectItem value="Job">Job</SelectItem>
                    <SelectItem value="Internship">Internship</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  placeholder="Company name"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Job description and responsibilities..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="requiredSkills">Required Skills</Label>
              <Input
                id="requiredSkills"
                placeholder="e.g., Python, React, Node.js (comma separated)"
                value={formData.requiredSkills}
                onChange={(e) => setFormData({ ...formData, requiredSkills: e.target.value })}
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="e.g., Bangalore, India"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="openings">Number of Openings</Label>
                <Input
                  id="openings"
                  type="number"
                  placeholder="e.g., 5"
                  value={formData.openings}
                  onChange={(e) => setFormData({ ...formData, openings: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="experienceLevel">Experience Level</Label>
                <Input
                  id="experienceLevel"
                  placeholder="e.g., 0-2 years, Fresher/Intern"
                  value={formData.experienceLevel}
                  onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="workMode">Work Mode</Label>
                <Select value={formData.workMode} onValueChange={(value) => setFormData({ ...formData, workMode: value })}>
                  <SelectTrigger id="workMode">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background z-50">
                    <SelectItem value="Remote">Remote</SelectItem>
                    <SelectItem value="On-site">On-site</SelectItem>
                    <SelectItem value="Hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="salary">Salary Range</Label>
                <Input
                  id="salary"
                  placeholder="e.g., $500 - $1000"
                  value={formData.salary}
                  onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="applicationDeadline">Application Deadline</Label>
                <Input
                  id="applicationDeadline"
                  type="date"
                  value={formData.applicationDeadline}
                  onChange={(e) => setFormData({ ...formData, applicationDeadline: e.target.value })}
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" variant="glowPrimary" className="flex-1">
                Save Position
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate(backPath)} className="flex-1">
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </Layout>
  );
};

export default CreateDrive;
