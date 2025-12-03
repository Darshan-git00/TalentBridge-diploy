// Recruiter API endpoints
// TODO: Replace with real backend API calls

export interface RecruiterProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  companyId: string;
  role: string;
  department: string;
  location: string;
  website?: string;
  establishedYear?: string;
  totalEmployees?: number;
  industry?: string;
}

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

export async function getRecruiterProfile(recruiterId: string): Promise<RecruiterProfile> {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/recruiters/${recruiterId}`, {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('talentbridge_token')}` }
  });
  if (!response.ok) throw new Error('Failed to fetch recruiter profile');
  return response.json();
}

export async function updateRecruiterProfile(recruiterId: string, data: Partial<RecruiterProfile>): Promise<RecruiterProfile> {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/recruiters/${recruiterId}`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('talentbridge_token')}`
    },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Failed to update recruiter profile');
  return response.json();
}

export async function getRecruiterDrives(recruiterId: string, params?: {
  page?: number;
  limit?: number;
  status?: string;
}): Promise<{ data: Drive[] }> {
  const searchParams: Record<string, string> = {};
  if (params?.page) searchParams.page = params.page.toString();
  if (params?.limit) searchParams.limit = params.limit.toString();
  if (params?.status) searchParams.status = params.status;
  const queryParams = new URLSearchParams(searchParams).toString();
  const response = await fetch(`${import.meta.env.VITE_API_URL}/recruiters/${recruiterId}/drives?${queryParams}`, {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('talentbridge_token')}` }
  });
  if (!response.ok) throw new Error('Failed to fetch recruiter drives');
  return response.json();
}

export async function createDrive(recruiterId: string, data: Omit<Drive, 'id' | 'createdBy' | 'createdAt' | 'updatedAt' | 'applicantsCount' | 'selectedCount'>): Promise<Drive> {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/recruiters/${recruiterId}/drives`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('talentbridge_token')}`
    },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Failed to create drive');
  return response.json();
}

export async function updateDrive(recruiterId: string, driveId: string, data: Partial<Drive>): Promise<Drive> {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/recruiters/${recruiterId}/drives/${driveId}`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('talentbridge_token')}`
    },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Failed to update drive');
  return response.json();
}

export async function deleteDrive(recruiterId: string, driveId: string): Promise<void> {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/recruiters/${recruiterId}/drives/${driveId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${localStorage.getItem('talentbridge_token')}` }
  });
  if (!response.ok) throw new Error('Failed to delete drive');
}
