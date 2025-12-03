import { ApiResponse, apiClient } from './api';
import { Drive, Application, PaginatedResponse, PaginationParams } from './types';

// Drives service
export const drivesService = {
  // Get all drives
  getDrives: async (params?: PaginationParams & {
    search?: string;
    type?: string;
    status?: string;
    location?: string;
    companyId?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<ApiResponse<PaginatedResponse<Drive>>> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.search) queryParams.append('search', params.search);
      if (params?.type) queryParams.append('type', params.type);
      if (params?.status) queryParams.append('status', params.status);
      if (params?.location) queryParams.append('location', params.location);
      if (params?.companyId) queryParams.append('companyId', params.companyId);
      if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

      const response = await apiClient.get(`/drives?${queryParams.toString()}`);
      return response.data as ApiResponse<PaginatedResponse<Drive>>;
    } catch (error) {
      console.error('❌ Get drives error:', error);
      throw error;
    }
  },

  // Get drive by ID
  getDriveById: async (driveId: string): Promise<ApiResponse<Drive>> => {
    try {
      const response = await apiClient.get(`/drives/${driveId}`);
      return response.data as ApiResponse<Drive>;
    } catch (error) {
      console.error('❌ Get drive by ID error:', error);
      throw error;
    }
  },

  // Create new drive
  createDrive: async (driveData: Omit<Drive, 'id' | 'createdAt' | 'updatedAt'>, recruiterId: string, collegeId?: string): Promise<ApiResponse<Drive>> => {
    try {
      // Add required recruiterId and optional collegeId to drive data
      const completeDriveData = {
        ...driveData,
        recruiterId,
        collegeId: collegeId || "default-college-id" // Use provided collegeId or fallback
      };
      
      const response = await apiClient.post('/drives', completeDriveData);
      return response.data as ApiResponse<Drive>;
    } catch (error) {
      console.error('❌ Create drive error:', error);
      throw error;
    }
  },

  // Update drive
  updateDrive: async (driveId: string, driveData: Partial<Drive>): Promise<ApiResponse<Drive>> => {
    try {
      const response = await apiClient.put(`/drives/${driveId}`, driveData);
      return response.data as ApiResponse<Drive>;
    } catch (error) {
      console.error('❌ Update drive error:', error);
      throw error;
    }
  },

  // Delete drive
  deleteDrive: async (driveId: string): Promise<ApiResponse<void>> => {
    try {
      const response = await apiClient.delete(`/drives/${driveId}`);
      return response.data as ApiResponse<void>;
    } catch (error) {
      console.error('❌ Delete drive error:', error);
      throw error;
    }
  },

  // Get drive applications
  getDriveApplications: async (driveId: string, params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<Application>>> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());

      const response = await apiClient.get(`/drives/${driveId}/applications?${queryParams.toString()}`);
      return response.data as ApiResponse<PaginatedResponse<Application>>;
    } catch (error) {
      console.error('❌ Get drive applications error:', error);
      throw error;
    }
  },

  // Update application status
  updateApplicationStatus: async (driveId: string, applicationId: string, status: Application['status'], feedback?: string): Promise<ApiResponse<Application>> => {
    try {
      const response = await apiClient.put(`/drives/${driveId}/applications/${applicationId}`, {
        status,
        feedback
      });
      return response.data as ApiResponse<Application>;
    } catch (error) {
      console.error('❌ Update application status error:', error);
      throw error;
    }
  },

  // Get drive statistics
  getDriveStats: async (driveId: string): Promise<ApiResponse<{
    totalApplications: number;
    pendingApplications: number;
    shortlistedApplications: number;
    rejectedApplications: number;
    interviewsScheduled: number;
  }>> => {
    try {
      const response = await apiClient.get(`/drives/${driveId}/stats`);
      return response.data as ApiResponse<any>;
    } catch (error) {
      console.error('❌ Get drive stats error:', error);
      throw error;
    }
  },

  // Get upcoming drives
  getUpcomingDrives: async (params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<Drive>>> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());

      const response = await apiClient.get(`/public/drives/upcoming?${queryParams.toString()}`);
      return response.data as ApiResponse<PaginatedResponse<Drive>>;
    } catch (error) {
      console.error('❌ Get upcoming drives error:', error);
      throw error;
    }
  },

  // Get company drives
  getCompanyDrives: async (companyId: string, params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<Drive>>> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());

      const response = await apiClient.get(`/companies/${companyId}/drives?${queryParams.toString()}`);
      return response.data as ApiResponse<PaginatedResponse<Drive>>;
    } catch (error) {
      console.error('❌ Get company drives error:', error);
      throw error;
    }
  },

  // Close drive
  closeDrive: async (driveId: string): Promise<ApiResponse<Drive>> => {
    try {
      const response = await apiClient.put(`/drives/${driveId}/close`);
      return response.data as ApiResponse<Drive>;
    } catch (error) {
      console.error('❌ Close drive error:', error);
      throw error;
    }
  },

  // Duplicate drive
  duplicateDrive: async (driveId: string): Promise<ApiResponse<Drive>> => {
    try {
      const response = await apiClient.post(`/drives/${driveId}/duplicate`);
      return response.data as ApiResponse<Drive>;
    } catch (error) {
      console.error('❌ Duplicate drive error:', error);
      throw error;
    }
  }
};
