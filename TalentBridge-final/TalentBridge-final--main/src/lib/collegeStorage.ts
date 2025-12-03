// College data storage utilities using localStorage

export interface CollegeApplication {
  id: number;
  studentId: number;
  studentName: string;
  studentEmail: string;
  driveId: number;
  company: string;
  position: string;
  appliedDate: string;
  status: "applied" | "under-review" | "shortlisted" | "rejected" | "sent-to-recruiter";
  // Student details
  course: string;
  branch: string;
  year: string;
  cgpa: number;
  skills: string[];
  certifications: string[];
  aiInterviewScore?: number;
  aiInterviewResults?: Array<{
    id: string;
    date: string;
    duration: number;
    type: string;
    overallScore: number;
    verified: boolean;
    scores: {
      communication: number;
      problemSolving: number;
      technical: number;
    };
    feedback?: {
      strengths: string[];
      improvements: string[];
    };
  }>;
  skillMatchPercentage?: number;
  customRank?: number;
  projectExperience?: number;
  // Drive details
  salary?: string;
  location?: string;
  logo?: string;
  requirements?: string[];
  sentToRecruiterDate?: string;
}

const STORAGE_KEYS = {
  APPLICATIONS: "college_applications",
  NEXT_APP_ID: "college_next_app_id",
  SENT_TO_RECRUITER: "college_sent_to_recruiter",
} as const;

// Application functions
export const getCollegeApplications = (): CollegeApplication[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.APPLICATIONS);
  if (!stored) {
    // Initialize with empty array - will be populated by API calls
    const initialApplications: CollegeApplication[] = [];
    saveCollegeApplications(initialApplications);
    return initialApplications;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
};

export const saveCollegeApplications = (applications: CollegeApplication[]): void => {
  localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(applications));
};

export const addCollegeApplication = (application: Omit<CollegeApplication, "id" | "appliedDate">): CollegeApplication => {
  const applications = getCollegeApplications();
  const nextId = getNextApplicationId();
  
  // Student data will be populated from API when application is created
  // Default values will be updated with real student profile data
  const studentData = {
    aiInterviewScore: application.aiInterviewScore || 0,
    skillMatchPercentage: application.skillMatchPercentage || 0,
    customRank: application.customRank || 0,
    projectExperience: application.projectExperience || 0,
    certifications: application.certifications || [],
  };
  
  // Normalize year format (remove "Year" suffix if present)
  const normalizedYear = application.year.replace(" Year", "").replace("Year", "").trim();
  
  const newApplication: CollegeApplication = {
    ...application,
    id: nextId,
    appliedDate: new Date().toISOString().split("T")[0],
    year: normalizedYear,
    aiInterviewScore: studentData.aiInterviewScore,
    skillMatchPercentage: studentData.skillMatchPercentage,
    customRank: studentData.customRank,
    projectExperience: studentData.projectExperience,
    certifications: studentData.certifications || application.certifications || [],
  };
  
  applications.push(newApplication);
  saveCollegeApplications(applications);
  setNextApplicationId(nextId + 1);
  return newApplication;
};

export const updateApplicationStatus = (id: number, status: CollegeApplication["status"]): void => {
  const applications = getCollegeApplications();
  const index = applications.findIndex((app) => app.id === id);
  if (index !== -1) {
    applications[index].status = status;
    if (status === "sent-to-recruiter") {
      applications[index].sentToRecruiterDate = new Date().toISOString().split("T")[0];
    }
    saveCollegeApplications(applications);
  }
};

export const sendApplicationsToRecruiter = (applicationIds: number[]): void => {
  const applications = getCollegeApplications();
  const sentApplications = applications.filter((app) => applicationIds.includes(app.id));
  
  // Update status for sent applications
  sentApplications.forEach((app) => {
    app.status = "sent-to-recruiter";
    app.sentToRecruiterDate = new Date().toISOString().split("T")[0];
  });
  
  saveCollegeApplications(applications);
  
  // Also add to recruiter storage
  try {
    const { addApplicant } = require("./recruiterStorage");
    sentApplications.forEach((app) => {
      addApplicant({
        studentId: app.studentId,
        driveId: app.driveId,
        name: app.studentName,
        email: app.studentEmail,
        course: app.course,
        branch: app.branch,
        year: app.year,
        cgpa: app.cgpa,
        skills: app.skills,
        status: "applied",
      });
    });
  } catch (error) {
    console.log("Could not sync with recruiter storage:", error);
  }
};

const getNextApplicationId = (): number => {
  const stored = localStorage.getItem(STORAGE_KEYS.NEXT_APP_ID);
  if (!stored) {
    const maxId = Math.max(...getCollegeApplications().map((app) => app.id), 0);
    setNextApplicationId(maxId + 1);
    return maxId + 1;
  }
  return parseInt(stored, 10);
};

const setNextApplicationId = (id: number): void => {
  localStorage.setItem(STORAGE_KEYS.NEXT_APP_ID, id.toString());
};

// Sync AI interview results from student profiles to college applications
export const syncAIInterviewResults = (): void => {
  try {
    const applications = getCollegeApplications();
    const { getAIInterviewResults } = require("./studentStorage");
    
    applications.forEach(app => {
      const studentResults = getAIInterviewResults();
      if (studentResults && studentResults.length > 0) {
        app.aiInterviewResults = studentResults;
        // Set the latest score as the main score
        app.aiInterviewScore = studentResults[studentResults.length - 1].overallScore;
      }
    });
    
    saveCollegeApplications(applications);
  } catch (error) {
    console.log("Could not sync AI interview results:", error);
  }
};

