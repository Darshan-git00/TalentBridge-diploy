// Application API endpoints

export interface Application {
  id: string;
  studentId: string;
  studentName: string;
  driveId: string;
  driveTitle: string;
  company: string;
  collegeId: string;
  collegeName: string;
  status: 'pending' | 'shortlisted' | 'rejected' | 'accepted' | 'interview_scheduled' | 'on_hold';
  appliedAt: string;
  updatedAt: string;
  notes?: string;
  resumeUrl?: string;
  aiScore?: number;
  skillMatch?: number;
  interviewDetails?: {
    date: string;
    time: string;
    mode: 'online' | 'offline' | 'phone';
    link?: string;
    location?: string;
  };
  feedback?: Array<{
    id: string;
    recruiterId: string;
    recruiterName: string;
    rating: number;
    comments: string;
    createdAt: string;
  }>;
}

export interface ApplicationFilters {
  status?: string[];
  company?: string[];
  collegeId?: string;
  driveId?: string;
  studentId?: string;
  search?: string;
  dateRange?: {
    from: string;
    to: string;
  };
}

export interface InterviewDetails {
  date: string;
  time: string;
  mode: 'online' | 'offline' | 'phone';
  link?: string;
  location?: string;
}

export async function getApplications(params?: {
  page?: number;
  limit?: number;
  studentId?: string;
  driveId?: string;
  status?: string;
  collegeId?: string;
  recruiterId?: string;
}): Promise<{ data: Application[] }> {
  const searchParams: Record<string, string> = {};
  if (params?.page) searchParams.page = params.page.toString();
  if (params?.limit) searchParams.limit = params.limit.toString();
  if (params?.studentId) searchParams.studentId = params.studentId;
  if (params?.driveId) searchParams.driveId = params.driveId;
  if (params?.status) searchParams.status = params.status;
  if (params?.collegeId) searchParams.collegeId = params.collegeId;
  if (params?.recruiterId) searchParams.recruiterId = params.recruiterId;
  const queryParams = new URLSearchParams(searchParams).toString();
  const response = await fetch(`${import.meta.env.VITE_API_URL}/applications?${queryParams}`, {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('talentbridge_token')}` }
  });
  if (!response.ok) throw new Error('Failed to fetch applications');
  return response.json();
}

export async function getApplicationById(applicationId: string): Promise<Application> {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/applications/${applicationId}`, {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('talentbridge_token')}` }
  });
  if (!response.ok) throw new Error('Failed to fetch application');
  return response.json();
}

export async function createApplication(data: {
  studentId: string;
  driveId: string;
  collegeId: string;
}): Promise<Application> {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/applications`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('talentbridge_token')}`
    },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Failed to create application');
  return response.json();
}

export async function updateApplicationStatus(applicationId: string, status: Application['status'], notes?: string): Promise<Application> {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/applications/${applicationId}/status`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('talentbridge_token')}`
    },
    body: JSON.stringify({ status, notes })
  });
  if (!response.ok) throw new Error('Failed to update application status');
  return response.json();
}

export async function scheduleInterview(applicationId: string, interviewDetails: InterviewDetails): Promise<Application> {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/applications/${applicationId}/interview`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('talentbridge_token')}`
    },
    body: JSON.stringify(interviewDetails)
  });
  if (!response.ok) throw new Error('Failed to schedule interview');
  return response.json();
}

export async function addApplicationFeedback(applicationId: string, feedback: {
  rating: number;
  comments: string;
}): Promise<Application> {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/applications/${applicationId}/feedback`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('talentbridge_token')}`
    },
    body: JSON.stringify(feedback)
  });
  if (!response.ok) throw new Error('Failed to add application feedback');
  return response.json();
}

export async function getApplicationStatistics(filters?: {
  collegeId?: string;
  driveId?: string;
  companyId?: string;
}): Promise<{
  totalApplications: number;
  pending: number;
  shortlisted: number;
  rejected: number;
  accepted: number;
  interviewScheduled: number;
  onHold: number;
}> {
  const searchParams: Record<string, string> = {};
  if (filters?.collegeId) searchParams.collegeId = filters.collegeId;
  if (filters?.driveId) searchParams.driveId = filters.driveId;
  if (filters?.companyId) searchParams.companyId = filters.companyId;
  const queryParams = new URLSearchParams(searchParams).toString();
  const response = await fetch(`${import.meta.env.VITE_API_URL}/applications/statistics?${queryParams}`, {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('talentbridge_token')}` }
  });
  if (!response.ok) throw new Error('Failed to fetch application statistics');
  return response.json();
}
