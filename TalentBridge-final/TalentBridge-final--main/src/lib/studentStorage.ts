// Student data storage utilities using localStorage

export interface StudentProfile {
  name: string;
  email: string;
  phone: string;
  course: string;
  branch: string;
  year: string;
  cgpa: number;
  skills: string[];
  certifications: Array<{
    name: string;
    issuer: string;
    year: string;
  }>;
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
}

export interface StudentApplication {
  id: number;
  driveId: number;
  company: string;
  position: string;
  status: "applied" | "under-review" | "shortlisted" | "rejected";
  appliedDate: string;
  lastUpdate: string;
  interviewDate?: string;
  salary?: string;
  location?: string;
  logo?: string;
}

const STORAGE_KEYS = {
  PROFILE: "student_profile",
  APPLICATIONS: "student_applications",
  NEXT_APP_ID: "student_next_app_id",
} as const;

// Profile functions
export const getStudentProfile = (): StudentProfile | null => {
  const stored = localStorage.getItem(STORAGE_KEYS.PROFILE);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
};

export const saveStudentProfile = (profile: StudentProfile): void => {
  localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
};

export const getDefaultProfile = (): StudentProfile => ({
  name: "John Sharma",
  email: "john.sharma@student.edu",
  phone: "+91 98765 43210",
  course: "B.Tech",
  branch: "Computer Science",
  year: "3rd Year",
  cgpa: 8.4,
  skills: ["Python", "React", "Node.js", "MongoDB", "TypeScript", "Java"],
  certifications: [
    { name: "AWS Cloud Practitioner", issuer: "Amazon Web Services", year: "2024" },
    { name: "React Advanced Certification", issuer: "Meta", year: "2023" },
  ],
});

// Application functions
export const getStudentApplications = (): StudentApplication[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.APPLICATIONS);
  if (!stored) {
    // Initialize with empty array - will be populated by API calls
    const initialApps: StudentApplication[] = [];
    saveStudentApplications(initialApps);
    return initialApps;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
};

export const saveStudentApplications = (applications: StudentApplication[]): void => {
  localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(applications));
};

export const addStudentApplication = (application: Omit<StudentApplication, "id" | "appliedDate" | "lastUpdate">): StudentApplication => {
  const applications = getStudentApplications();
  const nextId = getNextApplicationId();
  const newApplication: StudentApplication = {
    ...application,
    id: nextId,
    appliedDate: new Date().toISOString().split("T")[0],
    lastUpdate: new Date().toISOString().split("T")[0],
  };
  applications.push(newApplication);
  saveStudentApplications(applications);
  setNextApplicationId(nextId + 1);
  return newApplication;
};

export const updateApplicationStatus = (id: number, status: StudentApplication["status"], interviewDate?: string): void => {
  const applications = getStudentApplications();
  const index = applications.findIndex((app) => app.id === id);
  if (index !== -1) {
    applications[index].status = status;
    applications[index].lastUpdate = new Date().toISOString().split("T")[0];
    if (interviewDate) {
      applications[index].interviewDate = interviewDate;
    }
    saveStudentApplications(applications);
  }
};

const getNextApplicationId = (): number => {
  const stored = localStorage.getItem(STORAGE_KEYS.NEXT_APP_ID);
  if (!stored) {
    const maxId = Math.max(...getStudentApplications().map((app) => app.id), 0);
    setNextApplicationId(maxId + 1);
    return maxId + 1;
  }
  return parseInt(stored, 10);
};

const setNextApplicationId = (id: number): void => {
  localStorage.setItem(STORAGE_KEYS.NEXT_APP_ID, id.toString());
};

// Calculate dashboard metrics
export const getDashboardMetrics = () => {
  const applications = getStudentApplications();
  const profile = getStudentProfile() || getDefaultProfile();

  return {
    appliedDrives: applications.length,
    shortlisted: applications.filter((app) => app.status === "shortlisted").length,
    pending: applications.filter((app) => app.status === "applied" || app.status === "under-review").length,
    cgpa: profile.cgpa,
  };
};

// AI Interview Results functions
export const saveAIInterviewResult = (interviewResult: NonNullable<StudentProfile["aiInterviewResults"]>[0]): void => {
  const profile = getStudentProfile() || getDefaultProfile();
  if (!profile.aiInterviewResults) {
    profile.aiInterviewResults = [];
  }
  profile.aiInterviewResults.push(interviewResult);
  saveStudentProfile(profile);
};

export const getAIInterviewResults = (): NonNullable<StudentProfile["aiInterviewResults"]> => {
  const profile = getStudentProfile() || getDefaultProfile();
  return profile.aiInterviewResults || [];
};

export const getLatestAIInterviewResult = (): NonNullable<StudentProfile["aiInterviewResults"]>[0] | null => {
  const results = getAIInterviewResults();
  return results.length > 0 ? results[results.length - 1] : null;
};

