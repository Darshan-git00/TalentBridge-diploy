// Drive API endpoints

export interface Drive {
  id: string;
  title: string;
  description: string;
  company: string;
  companyId: string;
  location: string;
  type: 'on-campus' | 'virtual' | 'off-campus';
  eligibility: string[];
  salary: {
    min: number;
    max: number;
    currency: string;
  };
  deadline: string;
  driveDate: string;
  status: 'active' | 'closed' | 'draft';
  requirements: string[];
  benefits: string[];
  process: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  applicantsCount: number;
  selectedCount: number;
}

export interface DriveFilters {
  company?: string[];
  type?: string[];
  location?: string[];
  status?: string[];
  deadline?: string;
  search?: string;
}

export async function getDrives(params?: {
  page?: number;
  limit?: number;
  collegeId?: string;
  status?: string;
  filters?: DriveFilters;
}): Promise<{ data: Drive[] }> {
  const searchParams: Record<string, string> = {};
  if (params?.page) searchParams.page = params.page.toString();
  if (params?.limit) searchParams.limit = params.limit.toString();
  if (params?.collegeId) searchParams.collegeId = params.collegeId;
  if (params?.status) searchParams.status = params.status;
  const queryParams = new URLSearchParams(searchParams).toString();
  const response = await fetch(`${import.meta.env.VITE_API_URL}/drives?${queryParams}`, {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('talentbridge_token')}` }
  });
  if (!response.ok) throw new Error('Failed to fetch drives');
  return response.json();
}

export async function getDriveById(driveId: string): Promise<Drive> {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/drives/${driveId}`, {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('talentbridge_token')}` }
  });
  if (!response.ok) throw new Error('Failed to fetch drive');
  return response.json();
}

export async function getUpcomingDrives(limit?: number, collegeId?: string): Promise<Drive[]> {
  const params: Record<string, string> = {};
  if (limit) params.limit = limit.toString();
  if (collegeId) params.collegeId = collegeId;
  const queryParams = new URLSearchParams(params).toString();
  const response = await fetch(`${import.meta.env.VITE_API_URL}/drives/upcoming?${queryParams}`, {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('talentbridge_token')}` }
  });
  if (!response.ok) throw new Error('Failed to fetch upcoming drives');
  return response.json();
}

export async function searchDrives(query: string, collegeId?: string): Promise<{ data: Drive[] }> {
  const params: Record<string, string> = { q: query };
  if (collegeId) params.collegeId = collegeId;
  const queryParams = new URLSearchParams(params).toString();
  const response = await fetch(`${import.meta.env.VITE_API_URL}/drives/search?${queryParams}`, {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('talentbridge_token')}` }
  });
  if (!response.ok) throw new Error('Failed to search drives');
  return response.json();
}

export async function getDriveStatistics(driveId: string): Promise<{
  totalApplicants: number;
  shortlisted: number;
  interviewScheduled: number;
  accepted: number;
  rejected: number;
  onHold: number;
}> {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/drives/${driveId}/statistics`, {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('talentbridge_token')}` }
  });
  if (!response.ok) throw new Error('Failed to fetch drive statistics');
  return response.json();
}
