import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { recruitersService } from '@/services';
import { Recruiter, Drive, Application, Student, PaginationParams } from '@/services/types';

// Query keys
export const recruiterKeys = {
  all: ['recruiters'] as const,
  lists: () => [...recruiterKeys.all, 'list'] as const,
  list: (filters: any) => [...recruiterKeys.lists(), filters] as const,
  details: () => [...recruiterKeys.all, 'detail'] as const,
  detail: (id: string) => [...recruiterKeys.details(), id] as const,
  drives: (id: string) => [...recruiterKeys.detail(id), 'drives'] as const,
  applications: (id: string) => [...recruiterKeys.detail(id), 'applications'] as const,
  stats: (id: string) => [...recruiterKeys.detail(id), 'stats'] as const,
  search: () => [...recruiterKeys.all, 'search'] as const,
};

// Recruiter profile hooks
export const useRecruiterProfile = (recruiterId: string) => {
  return useQuery({
    queryKey: recruiterKeys.detail(recruiterId),
    queryFn: () => recruitersService.getProfile(recruiterId),
    select: (response) => response.data,
    enabled: !!recruiterId,
  });
};

export const useUpdateRecruiterProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ recruiterId, data }: { recruiterId: string; data: Partial<Recruiter> }) =>
      recruitersService.updateProfile(recruiterId, data),
    onSuccess: (response, variables) => {
      // Invalidate recruiter profile
      queryClient.invalidateQueries({ queryKey: recruiterKeys.detail(variables.recruiterId) });
    },
    onError: (error: any) => {
      console.error('Failed to update recruiter profile:', error);
    },
  });
};

// Recruiter drives hooks
export const useRecruiterDrives = (recruiterId: string, params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}, collegeId?: string) => {
  return useQuery({
    queryKey: recruiterKeys.drives(recruiterId),
    queryFn: () => recruitersService.getDrives(recruiterId, params), // TODO: Add collegeId when service supports filtering
    select: (response) => response.data,
    enabled: !!recruiterId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useCreateRecruiterDrive = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      recruiterId, 
      driveData 
    }: { 
      recruiterId: string; 
      driveData: Omit<Drive, 'id' | 'createdBy' | 'createdAt' | 'updatedAt' | 'applicantsCount' | 'selectedCount'> 
    }) => recruitersService.createDrive(recruiterId, driveData),
    onSuccess: (response, variables) => {
      // Invalidate recruiter drives
      queryClient.invalidateQueries({ queryKey: recruiterKeys.drives(variables.recruiterId) });
      queryClient.invalidateQueries({ queryKey: ['drives'] });
    },
    onError: (error: any) => {
      console.error('Failed to create drive:', error);
    },
  });
};

export const useUpdateRecruiterDrive = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ driveId, driveData }: { driveId: string; driveData: Partial<Drive> }) =>
      recruitersService.updateDrive(driveId, driveData),
    onSuccess: (response, variables) => {
      // Invalidate drives queries
      queryClient.invalidateQueries({ queryKey: ['drives'] });
      queryClient.invalidateQueries({ queryKey: ['drive', variables.driveId] });
    },
    onError: (error: any) => {
      console.error('Failed to update drive:', error);
    },
  });
};

export const useDeleteRecruiterDrive = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (driveId: string) => recruitersService.deleteDrive(driveId),
    onSuccess: (response, driveId) => {
      // Remove drive from cache and invalidate lists
      queryClient.removeQueries({ queryKey: ['drive', driveId] });
      queryClient.invalidateQueries({ queryKey: ['drives'] });
    },
    onError: (error: any) => {
      console.error('Failed to delete drive:', error);
    },
  });
};

// Recruiter applications hooks
export const useRecruiterDriveApplications = (driveId: string, params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: Application['status'];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) => {
  return useQuery({
    queryKey: recruiterKeys.applications(driveId),
    queryFn: () => recruitersService.getDriveApplications(driveId, params),
    select: (response) => response.data,
    enabled: !!driveId,
  });
};

export const useUpdateRecruiterApplicationStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      applicationId, 
      status, 
      notes 
    }: { 
      applicationId: string; 
      status: Application['status']; 
      notes?: string 
    }) => recruitersService.updateApplicationStatus(applicationId, status, notes),
    onSuccess: (response, variables) => {
      // Invalidate applications queries
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: recruiterKeys.applications('all') });
    },
    onError: (error: any) => {
      console.error('Failed to update application status:', error);
    },
  });
};

// Student search hooks
export const useSearchStudents = (params: {
  search?: string;
  skills?: string[];
  college?: string;
  course?: string;
  branch?: string;
  minCgpa?: number;
  year?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: recruiterKeys.search(),
    queryFn: () => recruitersService.searchStudents(params),
    select: (response) => response.data,
    staleTime: 5 * 60 * 1000, // 5 minutes for search results
  });
};

export const useStudentProfile = (studentId: string) => {
  return useQuery({
    queryKey: ['student', studentId],
    queryFn: () => recruitersService.getStudentProfile(studentId),
    select: (response) => response.data,
    enabled: !!studentId,
  });
};

// Recruiter dashboard stats hooks
export const useRecruiterDashboardStats = (recruiterId: string, collegeId?: string) => {
  return useQuery({
    queryKey: recruiterKeys.stats(recruiterId),
    queryFn: () => recruitersService.getDashboardStats(recruiterId), // TODO: Add collegeId when service supports filtering
    select: (response) => response.data,
    enabled: !!recruiterId,
    staleTime: 5 * 60 * 1000, // 5 minutes for stats
  });
};

// Bulk operations hooks
export const useBulkUpdateApplicationStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      applicationIds, 
      status 
    }: { 
      applicationIds: string[]; 
      status: Application['status'] 
    }) => recruitersService.bulkUpdateApplicationStatus(applicationIds, status),
    onSuccess: () => {
      // Invalidate applications queries
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
    onError: (error: any) => {
      console.error('Failed to bulk update application status:', error);
    },
  });
};

// Export functionality hooks
export const useExportApplications = () => {
  return useMutation({
    mutationFn: ({ 
      driveId, 
      format 
    }: { 
      driveId: string; 
      format: 'csv' | 'excel' | 'pdf' 
    }) => recruitersService.exportApplications(driveId, format),
    onError: (error: any) => {
      console.error('Failed to export applications:', error);
    },
  });
};
