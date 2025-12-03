import { ApiResponse, apiClient } from './api';
import { Recruiter, Drive, Student, Application, PaginatedResponse, PaginationParams } from './types';

// Recruiters service
export const recruitersService = {
  // Get recruiter profile
  getProfile: async (recruiterId: string): Promise<ApiResponse<Recruiter>> => {
    try {
      const response = await apiClient.get(`/recruiters/${recruiterId}`);
      return response.data as ApiResponse<Recruiter>;
    } catch (error) {
      console.error('❌ Get recruiter profile error:', error);
      throw error;
    }
  },

  // Update recruiter profile
  updateProfile: async (recruiterId: string, data: Partial<Recruiter>): Promise<ApiResponse<Recruiter>> => {
    try {
      // Use /me endpoint for updating current user's profile
      const response = await apiClient.put('/recruiters/me', data);
      return response.data as ApiResponse<Recruiter>;
    } catch (error) {
      console.error('❌ Update recruiter profile error:', error);
      throw error;
    }
  },

  // Get recruiter drives
  getDrives: async (recruiterId: string, params?: PaginationParams & {
    search?: string;
    status?: string;
    type?: string;
  }): Promise<ApiResponse<PaginatedResponse<Drive>>> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.search) queryParams.append('search', params.search);
      if (params?.status) queryParams.append('status', params.status);
      if (params?.type) queryParams.append('type', params.type);

      const response = await apiClient.get(`/recruiters/${recruiterId}/drives?${queryParams.toString()}`);
      return response.data as ApiResponse<PaginatedResponse<Drive>>;
    } catch (error) {
      console.error('❌ Get recruiter drives error:', error);
      throw error;
    }
  },

  // Create recruiter drive
  createDrive: async (recruiterId: string, driveData: Omit<Drive, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Drive>> => {
    try {
      const response = await apiClient.post(`/recruiters/${recruiterId}/drives`, driveData);
      return response.data as ApiResponse<Drive>;
    } catch (error) {
      console.error('❌ Create recruiter drive error:', error);
      throw error;
    }
  },

  // Update recruiter drive
  updateDrive: async (recruiterId: string, driveId: string, driveData: Partial<Drive>): Promise<ApiResponse<Drive>> => {
    try {
      const response = await apiClient.put(`/recruiters/${recruiterId}/drives/${driveId}`, driveData);
      return response.data as ApiResponse<Drive>;
    } catch (error) {
      console.error('❌ Update recruiter drive error:', error);
      throw error;
    }
  },

  // Delete recruiter drive
  deleteDrive: async (recruiterId: string, driveId: string): Promise<ApiResponse<void>> => {
    try {
      const response = await apiClient.delete(`/recruiters/${recruiterId}/drives/${driveId}`);
      return response.data as ApiResponse<void>;
    } catch (error) {
      console.error('❌ Delete recruiter drive error:', error);
      throw error;
    }
  },

  // Get recruiter drive applications
  getDriveApplications: async (recruiterId: string, driveId: string, params?: PaginationParams & {
    status?: string;
    search?: string;
  }): Promise<ApiResponse<PaginatedResponse<Application>>> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.status) queryParams.append('status', params.status);
      if (params?.search) queryParams.append('search', params.search);

      const response = await apiClient.get(`/recruiters/${recruiterId}/drives/${driveId}/applications?${queryParams.toString()}`);
      return response.data as ApiResponse<PaginatedResponse<Application>>;
    } catch (error) {
      console.error('❌ Get recruiter drive applications error:', error);
      throw error;
    }
  },

  // Update recruiter application status
  updateApplicationStatus: async (recruiterId: string, applicationId: string, status: Application['status'], feedback?: string): Promise<ApiResponse<Application>> => {
    try {
      const response = await apiClient.put(`/recruiters/${recruiterId}/applications/${applicationId}`, {
        status,
        feedback
      });
      return response.data as ApiResponse<Application>;
    } catch (error) {
      console.error('❌ Update recruiter application status error:', error);
      throw error;
    }
  },

  // Search students
  searchStudents: async (recruiterId: string, params?: PaginationParams & {
    search?: string;
    skills?: string[];
    college?: string;
    course?: string;
    minCGPA?: number;
  }): Promise<ApiResponse<PaginatedResponse<Student>>> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.search) queryParams.append('search', params.search);
      if (params?.skills) queryParams.append('skills', params.skills.join(','));
      if (params?.college) queryParams.append('college', params.college);
      if (params?.course) queryParams.append('course', params.course);
      if (params?.minCGPA) queryParams.append('minCGPA', params.minCGPA.toString());

      const response = await apiClient.get(`/recruiters/${recruiterId}/students/search?${queryParams.toString()}`);
      return response.data as ApiResponse<PaginatedResponse<Student>>;
    } catch (error) {
      console.error('❌ Search students error:', error);
      throw error;
    }
  },

  // Get recruiter dashboard stats
  getDashboardStats: async (recruiterId: string): Promise<ApiResponse<{
    totalDrives: number;
    activeDrives: number;
    totalApplications: number;
    pendingApplications: number;
    shortlistedApplications: number;
    scheduledInterviews: number;
    conversionRate: number;
  }>> => {
    try {
      const response = await apiClient.get(`/recruiters/${recruiterId}/dashboard/stats`);
      return response.data as ApiResponse<any>;
    } catch (error) {
      console.error('❌ Get recruiter dashboard stats error:', error);
      throw error;
    }
  },

  // Bulk update application status
  bulkUpdateApplicationStatus: async (recruiterId: string, applicationIds: string[], status: Application['status']): Promise<ApiResponse<Application[]>> => {
    try {
      const response = await apiClient.put(`/recruiters/${recruiterId}/applications/bulk`, {
        applicationIds,
        status
      });
      return response.data as ApiResponse<Application[]>;
    } catch (error) {
      console.error('❌ Bulk update application status error:', error);
      throw error;
    }
  },

  // Export applications
  exportApplications: async (recruiterId: string, driveId: string, format?: 'csv' | 'excel'): Promise<ApiResponse<Blob>> => {
    try {
      const queryParams = new URLSearchParams();
      if (format) queryParams.append('format', format);

      const response = await apiClient.get(`/recruiters/${recruiterId}/drives/${driveId}/export?${queryParams.toString()}`, {
        responseType: 'blob'
      });
      return response.data as ApiResponse<Blob>;
    } catch (error) {
      console.error('❌ Export applications error:', error);
      throw error;
    }
  }
};
