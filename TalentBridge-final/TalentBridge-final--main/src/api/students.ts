// Student API endpoints

export interface StudentProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  collegeId: string;
  collegeName: string;
  course: string;
  branch: string;
  year: string;
  cgpa: number;
  skills: string[];
  certifications: Array<{
    id: string;
    name: string;
    issuer: string;
    year: string;
    credentialId?: string;
    credentialUrl?: string;
  }>;
  aiInterviewScore: number;
  skillMatchPercentage: number;
  projectExperience: number;
  customRank: number;
  status: string;
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
  customRank?: string[] | 'topN';
}

export async function getStudentProfile(studentId: string): Promise<StudentProfile> {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/students/${studentId}`, {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('talentbridge_token')}` }
  });
  if (!response.ok) throw new Error('Failed to fetch student profile');
  return response.json();
}

export async function updateStudentProfile(studentId: string, data: Partial<StudentProfile>): Promise<StudentProfile> {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/students/${studentId}`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('talentbridge_token')}`
    },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Failed to update student profile');
  return response.json();
}

export async function getFilteredStudents(collegeId: string, filters: StudentFilters): Promise<{ data: StudentProfile[] }> {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/colleges/${collegeId}/students/filter`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('talentbridge_token')}`
    },
    body: JSON.stringify(filters)
  });
  if (!response.ok) throw new Error('Failed to fetch filtered students');
  return response.json();
}

export async function uploadResume(studentId: string, file: File): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append('resume', file);
  const response = await fetch(`${import.meta.env.VITE_API_URL}/students/${studentId}/resume`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${localStorage.getItem('talentbridge_token')}` },
    body: formData
  });
  if (!response.ok) throw new Error('Failed to upload resume');
  return response.json();
}
