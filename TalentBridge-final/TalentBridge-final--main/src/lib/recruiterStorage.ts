// Recruiter data storage utilities using localStorage

export interface RecruiterDrive {
  id: number;
  company: string;
  logo: string;
  position: string;
  type: "Job" | "Internship";
  salary: string;
  location: string;
  skills: string[];
  openings: number;
  interviews: number;
  status: "active" | "closed" | "draft";
  description: string;
  requirements: string[];
  experienceLevel: string;
  applicationDeadline: string;
  workMode: string;
  applicants: number;
  shortlisted: number;
  postedDate: string;
  createdBy?: string; // recruiter identifier
}

export interface Applicant {
  id: number;
  studentId: number;
  driveId: number;
  name: string;
  email: string;
  course: string;
  branch: string;
  year: string;
  cgpa: number;
  skills: string[];
  status: "applied" | "shortlisted" | "rejected" | "hired";
  appliedDate: string;
  interviewRounds?: InterviewRound[];
  notes?: string;
}

export interface InterviewRound {
  id: number;
  roundNumber: number;
  roundName: string;
  scheduledDate?: string;
  status: "scheduled" | "completed" | "cancelled";
  feedback?: string;
  score?: number;
}

const STORAGE_KEYS = {
  DRIVES: "recruiter_drives",
  APPLICANTS: "recruiter_applicants",
  NEXT_DRIVE_ID: "recruiter_next_drive_id",
  NEXT_APPLICANT_ID: "recruiter_next_applicant_id",
} as const;

// Drive functions
export const getRecruiterDrives = (): RecruiterDrive[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.DRIVES);
  if (!stored) {
    // Initialize with empty array - will be populated by API calls
    const initialDrives: RecruiterDrive[] = [];
    saveRecruiterDrives(initialDrives);
    return initialDrives;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
};

export const saveRecruiterDrives = (drives: RecruiterDrive[]): void => {
  localStorage.setItem(STORAGE_KEYS.DRIVES, JSON.stringify(drives));
};

export const addRecruiterDrive = (drive: Omit<RecruiterDrive, "id" | "postedDate" | "applicants" | "shortlisted" | "interviews">): RecruiterDrive => {
  const drives = getRecruiterDrives();
  const nextId = getNextDriveId();
  const newDrive: RecruiterDrive = {
    ...drive,
    id: nextId,
    postedDate: new Date().toISOString().split("T")[0],
    applicants: 0,
    shortlisted: 0,
    interviews: 0,
    createdBy: "recruiter",
  };
  drives.push(newDrive);
  saveRecruiterDrives(drives);
  setNextDriveId(nextId + 1);
  return newDrive;
};

export const updateRecruiterDrive = (id: number, updates: Partial<RecruiterDrive>): void => {
  const drives = getRecruiterDrives();
  const index = drives.findIndex((drive) => drive.id === id);
  if (index !== -1) {
    drives[index] = { ...drives[index], ...updates };
    saveRecruiterDrives(drives);
  }
};

export const deleteRecruiterDrive = (id: number): void => {
  const drives = getRecruiterDrives();
  const filtered = drives.filter((drive) => drive.id !== id);
  saveRecruiterDrives(filtered);
  
  // Also remove applicants for this drive
  const applicants = getApplicants();
  const filteredApplicants = applicants.filter((app) => app.driveId !== id);
  saveApplicants(filteredApplicants);
};

const getNextDriveId = (): number => {
  const stored = localStorage.getItem(STORAGE_KEYS.NEXT_DRIVE_ID);
  if (!stored) {
    const maxId = Math.max(...getRecruiterDrives().map((drive) => drive.id), 0);
    setNextDriveId(maxId + 1);
    return maxId + 1;
  }
  return parseInt(stored, 10);
};

const setNextDriveId = (id: number): void => {
  localStorage.setItem(STORAGE_KEYS.NEXT_DRIVE_ID, id.toString());
};

// Applicant functions
export const getApplicants = (): Applicant[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.APPLICANTS);
  if (!stored) {
    // Initialize with empty array - will be populated by API calls
    const initialApplicants: Applicant[] = [];
    saveApplicants(initialApplicants);
    return initialApplicants;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
};

export const saveApplicants = (applicants: Applicant[]): void => {
  localStorage.setItem(STORAGE_KEYS.APPLICANTS, JSON.stringify(applicants));
};

export const addApplicant = (applicant: Omit<Applicant, "id" | "appliedDate">): Applicant => {
  const applicants = getApplicants();
  const nextId = getNextApplicantId();
  const newApplicant: Applicant = {
    ...applicant,
    id: nextId,
    appliedDate: new Date().toISOString().split("T")[0],
  };
  applicants.push(newApplicant);
  saveApplicants(applicants);
  
  // Update drive applicant count
  const drives = getRecruiterDrives();
  const driveIndex = drives.findIndex((d) => d.id === applicant.driveId);
  if (driveIndex !== -1) {
    drives[driveIndex].applicants += 1;
    saveRecruiterDrives(drives);
  }
  
  setNextApplicantId(nextId + 1);
  return newApplicant;
};

export const updateApplicantStatus = (
  id: number,
  status: Applicant["status"]
): void => {
  const applicants = getApplicants();
  const index = applicants.findIndex((app) => app.id === id);
  if (index !== -1) {
    const oldStatus = applicants[index].status;
    const applicant = applicants[index];
    applicants[index].status = status;
    saveApplicants(applicants);
    
    // Update drive counts
    const drives = getRecruiterDrives();
    const drive = drives.find((d) => d.id === applicant.driveId);
    if (drive) {
      if (oldStatus === "shortlisted" && status !== "shortlisted") {
        drive.shortlisted = Math.max(0, drive.shortlisted - 1);
      }
      if (status === "shortlisted" && oldStatus !== "shortlisted") {
        drive.shortlisted += 1;
      }
      if (status === "hired") {
        drive.shortlisted = Math.max(0, drive.shortlisted - 1);
      }
      saveRecruiterDrives(drives);
    }
    
    // Sync with student applications if possible
    try {
      const { getStudentApplications, updateApplicationStatus } = require("./studentStorage");
      const studentApps = getStudentApplications();
      const studentApp = studentApps.find(
        (app: any) => app.driveId === applicant.driveId && app.company === drive?.company
      );
      if (studentApp) {
        // Map recruiter status to student status
        let studentStatus: "applied" | "under-review" | "shortlisted" | "rejected" = "applied";
        if (status === "shortlisted") {
          studentStatus = "shortlisted";
        } else if (status === "rejected") {
          studentStatus = "rejected";
        } else if (status === "applied") {
          studentStatus = "under-review";
        }
        updateApplicationStatus(studentApp.id, studentStatus);
      }
    } catch (error) {
      // Silently fail if student storage isn't available
      console.log("Could not sync with student storage:", error);
    }
  }
};

export const addInterviewRound = (
  applicantId: number,
  round: Omit<InterviewRound, "id">
): void => {
  const applicants = getApplicants();
  const index = applicants.findIndex((app) => app.id === applicantId);
  if (index !== -1) {
    if (!applicants[index].interviewRounds) {
      applicants[index].interviewRounds = [];
    }
    const nextRoundId = Math.max(
      ...(applicants[index].interviewRounds?.map((r) => r.id) || [0]),
      0
    ) + 1;
    applicants[index].interviewRounds!.push({
      ...round,
      id: nextRoundId,
    });
    saveApplicants(applicants);
    
    // Update drive interview count
    const drives = getRecruiterDrives();
    const drive = drives.find((d) => d.id === applicants[index].driveId);
    if (drive) {
      drive.interviews += 1;
      saveRecruiterDrives(drives);
    }
  }
};

export const updateInterviewRound = (
  applicantId: number,
  roundId: number,
  updates: Partial<InterviewRound>
): void => {
  const applicants = getApplicants();
  const index = applicants.findIndex((app) => app.id === applicantId);
  if (index !== -1 && applicants[index].interviewRounds) {
    const roundIndex = applicants[index].interviewRounds!.findIndex(
      (r) => r.id === roundId
    );
    if (roundIndex !== -1) {
      applicants[index].interviewRounds![roundIndex] = {
        ...applicants[index].interviewRounds![roundIndex],
        ...updates,
      };
      saveApplicants(applicants);
    }
  }
};

export const updateApplicantNotes = (id: number, notes: string): void => {
  const applicants = getApplicants();
  const index = applicants.findIndex((app) => app.id === id);
  if (index !== -1) {
    applicants[index].notes = notes;
    saveApplicants(applicants);
  }
};

const getNextApplicantId = (): number => {
  const stored = localStorage.getItem(STORAGE_KEYS.NEXT_APPLICANT_ID);
  if (!stored) {
    const maxId = Math.max(...getApplicants().map((app) => app.id), 0);
    setNextApplicantId(maxId + 1);
    return maxId + 1;
  }
  return parseInt(stored, 10);
};

const setNextApplicantId = (id: number): void => {
  localStorage.setItem(STORAGE_KEYS.NEXT_APPLICANT_ID, id.toString());
};

// Calculate dashboard metrics
export const getDashboardMetrics = () => {
  const drives = getRecruiterDrives();
  const applicants = getApplicants();
  
  const activeDrives = drives.filter((d) => d.status === "active").length;
  const totalApplications = applicants.length;
  const shortlisted = applicants.filter((app) => app.status === "shortlisted").length;
  const hired = applicants.filter((app) => app.status === "hired").length;
  
  return {
    activeDrives,
    totalApplications,
    shortlisted,
    hired,
  };
};

