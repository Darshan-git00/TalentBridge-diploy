// Shared types used across all services

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'college' | 'recruiter';
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Student extends User {
  role: 'student';
  phone: string;
  collegeId: string;
  collegeName: string;
  course: string;
  branch: string;
  year: string;
  cgpa: number; // Profile field only - NOT used for filtering
  skills: string[];
  certifications: Certification[];
  resume?: string;
  portfolio?: string;
  linkedinProfile?: string;
  githubProfile?: string;
  // New fields for skill-first filtering
  aiScore?: number; // AI assessment score (0-100)
  projectExperience?: number; // Number of projects completed
  skillMatch?: number; // Skill match percentage (0-100)
  status?: string; // Student status (active, inactive, placed, etc.)
}

export interface College extends User {
  role: 'college';
  phone: string;
  address: string;
  website?: string;
  establishedYear: string;
  type: string;
  accreditation: string;
  totalStudents: number;
  departments: string[];
  collegeId: string;
}

export interface Recruiter extends User {
  role: 'recruiter';
  phone: string;
  company: string;
  position: string;
  department?: string;
  experience: string;
  linkedinProfile?: string;
  collegeId?: string;
  collegeName?: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  year: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
}

export interface StudentFilters {
  skills?: string[];
  certifications?: string[];
  minAIScore?: number;
  maxAIScore?: number;
  branch?: string[];
  year?: string[];
  status?: string[];
  minProjectExperience?: number;
  minSkillMatch?: number;
  customRank?: string[] | 'topN'; // Changed from number[] to string[] for student IDs
}

export interface Drive {
  id: string;
  position: string;
  description: string;
  location: string;
  type: 'on-campus' | 'off-campus' | 'virtual';
  salary: string;
  skills: string;
  openings: number;
  status: 'active' | 'closed' | 'draft';
  postedDate: string;
  recruiterId: string;
  collegeId: string;
  recruiter?: {
    id: string;
    name: string;
    company: string;
  };
  // Legacy properties for compatibility
  title?: string;
  company?: string;
  requirements?: string[];
}

export interface Application {
  id: string;
  studentId: string;
  driveId: string;
  collegeId: string; // Added for college-based filtering
  driveTitle: string;
  company: string;
  status: 'applied' | 'under_review' | 'shortlisted' | 'rejected' | 'selected' | 'withdrawn' | 'interview_scheduled' | 'on_hold' | 'accepted';
  appliedAt: string;
  updatedAt: string;
  notes?: string;
  resume?: string;
  coverLetter?: string;
  currentRound?: string;
  nextRound?: string;
  feedback?: ApplicationFeedback[];
  interviewDetails?: InterviewDetails;
}

export interface InterviewDetails {
  date: string;
  time: string;
  mode: 'online' | 'offline';
  link?: string;
}

export interface ApplicationFeedback {
  id: string;
  round: string;
  feedback: string;
  rating: number;
  interviewerId: string;
  interviewerName: string;
  createdAt: string;
}

export interface Interview {
  id: string;
  applicationId: string;
  studentId: string;
  driveId: string;
  type: 'technical' | 'hr' | 'managerial' | 'ai';
  round: number;
  scheduledAt: string;
  duration: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'rescheduled';
  interviewerId?: string;
  interviewerName?: string;
  meetingLink?: string;
  feedback?: InterviewFeedback;
  aiAnalysis?: AIInterviewAnalysis;
}

export interface InterviewFeedback {
  rating: number;
  technicalSkills: number;
  communicationSkills: number;
  problemSolving: number;
  culturalFit: number;
  overallImpression: string;
  strengths: string[];
  weaknesses: string[];
  recommendation: 'hire' | 'consider' | 'reject';
  notes: string;
}

export interface AIInterviewAnalysis {
  overallScore: number;
  technicalScore: number;
  communicationScore: number;
  confidenceScore: number;
  clarityScore: number;
  keyInsights: string[];
  improvementAreas: string[];
  strengths: string[];
  transcript: string[];
  sentimentAnalysis: {
    positive: number;
    neutral: number;
    negative: number;
  };
  recommendations: string[];
}

export interface Notification {
  id: string;
  userId: string;
  type: 'drive' | 'application' | 'interview' | 'system' | 'message';
  title: string;
  message: string;
  isRead: boolean;
  actionUrl?: string;
  createdAt: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}
