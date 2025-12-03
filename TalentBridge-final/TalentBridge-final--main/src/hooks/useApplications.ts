import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { applicationsService } from '@/services';
import { Application, PaginationParams, ApplicationFeedback, Interview, InterviewDetails } from '@/services/types';

// Query keys
export const applicationKeys = {
  all: ['applications'] as const,
  lists: () => [...applicationKeys.all, 'list'] as const,
  list: (filters: any) => [...applicationKeys.lists(), filters] as const,
  details: () => [...applicationKeys.all, 'detail'] as const,
  detail: (id: string) => [...applicationKeys.details(), id] as const,
  feedback: (id: string) => [...applicationKeys.detail(id), 'feedback'] as const,
  interviews: (id: string) => [...applicationKeys.detail(id), 'interviews'] as const,
  stats: () => [...applicationKeys.all, 'stats'] as const,
  student: (studentId: string) => [...applicationKeys.all, 'student', studentId] as const,
  drive: (driveId: string) => [...applicationKeys.all, 'drive', driveId] as const,
  college: (collegeId: string) => [...applicationKeys.all, 'college', collegeId] as const,
};

// Applications list hooks
export const useApplications = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: Application['status'];
  driveId?: string;
  studentId?: string;
  company?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) => {
  return useQuery({
    queryKey: applicationKeys.list(params || {}),
    queryFn: () => {
      // Ensure required params have defaults
      const queryParams = {
        page: params?.page || 1,
        limit: params?.limit || 10,
        ...params
      };
      return applicationsService.getApplications(queryParams);
    },
    select: (response) => response.data,
    staleTime: 1 * 60 * 1000, // 1 minute - applications change more frequently
    gcTime: 10 * 60 * 1000, // 10 minutes garbage collection
    refetchOnWindowFocus: false, // Don't refetch on window focus
    placeholderData: (previousData) => {
      // Keep previous data while fetching new data
      return previousData;
    },
  });
};

export const useApplicationById = (applicationId: string) => {
  return useQuery({
    queryKey: applicationKeys.detail(applicationId),
    queryFn: () => applicationsService.getApplicationById(applicationId),
    select: (response) => response.data,
    enabled: !!applicationId,
    staleTime: 2 * 60 * 1000, // 2 minutes - individual applications
    gcTime: 15 * 60 * 1000, // 15 minutes garbage collection
    refetchOnWindowFocus: false,
  });
};

// Application management hooks
export const useCreateApplication = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (applicationData: Omit<Application, 'id' | 'createdAt' | 'updatedAt'>) =>
      applicationsService.createApplication(applicationData),
    onSuccess: () => {
      // Invalidate applications list
      queryClient.invalidateQueries({ queryKey: applicationKeys.lists() });
    },
    onError: (error: any) => {
      console.error('Failed to create application:', error);
    },
  });
};

export const useUpdateApplication = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ applicationId, applicationData }: { 
      applicationId: string; 
      applicationData: Partial<Application> 
    }) => applicationsService.updateApplication(applicationId, applicationData),
    onSuccess: (response, variables) => {
      // Invalidate specific application and applications list
      queryClient.invalidateQueries({ queryKey: applicationKeys.detail(variables.applicationId) });
      queryClient.invalidateQueries({ queryKey: applicationKeys.lists() });
    },
    onError: (error: any) => {
      console.error('Failed to update application:', error);
    },
  });
};

export const useUpdateApplicationStatus = () => {
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
    }) => applicationsService.updateApplicationStatus(applicationId, status, notes),
    onSuccess: (response, variables) => {
      // Invalidate specific application and applications list
      queryClient.invalidateQueries({ queryKey: applicationKeys.detail(variables.applicationId) });
      queryClient.invalidateQueries({ queryKey: applicationKeys.lists() });
    },
    onError: (error: any) => {
      console.error('Failed to update application status:', error);
    },
  });
};

// Application feedback hooks
// export const useAddApplicationFeedback = () => {
//   const queryClient = useQueryClient();
  
//   return useMutation({
//     mutationFn: ({ 
//       applicationId, 
//       feedbackData 
//     }: { 
//       applicationId: string; 
//       feedbackData: Omit<ApplicationFeedback, 'id' | 'createdAt'> 
//     }) => applicationsService.addFeedback(applicationId, feedbackData),
//     onSuccess: (response, variables) => {
//       // Invalidate application feedback and application details
//       queryClient.invalidateQueries({ queryKey: applicationKeys.feedback(variables.applicationId) });
//       queryClient.invalidateQueries({ queryKey: applicationKeys.detail(variables.applicationId) });
//     },
//     onError: (error: any) => {
//       console.error('Failed to add application feedback:', error);
//     },
//   });
// };

export const useApplicationFeedback = (applicationId: string) => {
  return useQuery({
    queryKey: applicationKeys.feedback(applicationId),
    queryFn: () => applicationsService.getApplicationFeedback(applicationId),
    select: (response) => response.data,
    enabled: !!applicationId,
  });
};

// Application statistics hooks
export const useApplicationsStats = (filters?: {
  driveId?: string;
  companyId?: string;
  collegeId?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}) => {
  return useQuery({
    queryKey: applicationKeys.stats(),
    queryFn: () => applicationsService.getApplicationsStats(filters),
    select: (response) => response.data,
    staleTime: 5 * 60 * 1000, // 5 minutes for stats
  });
};

// Student applications hooks
export const useStudentApplications = (studentId: string, params?: PaginationParams) => {
  return useQuery({
    queryKey: applicationKeys.student(studentId),
    queryFn: () => applicationsService.getStudentApplications(studentId, params),
    select: (response) => response.data,
    enabled: !!studentId,
  });
};

// Drive applications hooks
export const useDriveApplications = (driveId: string, params?: PaginationParams) => {
  return useQuery({
    queryKey: applicationKeys.drive(driveId),
    queryFn: () => applicationsService.getDriveApplications(driveId, params),
    select: (response) => response.data,
    enabled: !!driveId,
  });
};

// Interview management hooks
export const useApplicationInterviews = (applicationId: string) => {
  return useQuery({
    queryKey: applicationKeys.interviews(applicationId),
    queryFn: () => applicationsService.getApplicationInterviews(applicationId),
    select: (response) => response.data,
    enabled: !!applicationId,
  });
};

export const useUpdateInterviewStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      applicationId,
      interviewId, 
      status 
    }: { 
      applicationId: string;
      interviewId: string; 
      status: Interview['status'] 
    }) => applicationsService.updateInterviewStatus(applicationId, interviewId, status),
    onSuccess: (response, interviewId) => {
      // Invalidate interview queries
      queryClient.invalidateQueries({ queryKey: ['interview', interviewId] });
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
    },
    onError: (error: any) => {
      console.error('Failed to update interview status:', error);
    },
  });
};

// Application Workflow Foundation Hooks

// Apply to drive mutation
export const useApplyToDrive = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      driveId, 
      applicationData 
    }: { 
      driveId: string; 
      applicationData?: {
        resume?: string;
        coverLetter?: string;
      };
    }) => applicationsService.applyToDrive(driveId, applicationData),
    onSuccess: (response, variables) => {
      console.log('useApplyToDrive - application created successfully:', response.data);
      
      // Invalidate related queries to trigger UI updates
      queryClient.invalidateQueries({ queryKey: applicationKeys.all });
      queryClient.invalidateQueries({ queryKey: applicationKeys.drive(variables.driveId) });
      
      // Also invalidate drives queries to update applicant counts
      queryClient.invalidateQueries({ queryKey: ['drives'] });
      queryClient.invalidateQueries({ queryKey: ['drive', variables.driveId] });
    },
    onError: (error: any) => {
      console.error('Failed to apply to drive:', error);
    },
  });
};

// Get applications by college
export const useCollegeApplications = (collegeId: string) => {
  return useQuery({
    queryKey: applicationKeys.college(collegeId),
    queryFn: () => applicationsService.getApplications({ collegeId, page: 1, limit: 100 }),
    select: (response) => response.data.data,
    enabled: !!collegeId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Recruiter Actions System Hooks

// Schedule interview mutation
export const useScheduleInterview = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      applicationId, 
      interviewData 
    }: { 
      applicationId: string; 
      interviewData: Omit<Interview, 'id' | 'createdAt' | 'updatedAt'>;
    }) => applicationsService.scheduleInterview(applicationId, interviewData),
    onSuccess: (response, variables) => {
      console.log('useScheduleInterview - interview scheduled successfully:', response.data);
      
      // Invalidate all relevant queries to trigger UI updates across all views
      queryClient.invalidateQueries({ queryKey: applicationKeys.all });
      
      // Invalidate specific queries if we have the related IDs
      if (response.data.studentId) {
        queryClient.invalidateQueries({ queryKey: applicationKeys.student(response.data.studentId) });
      }
      if (response.data.driveId) {
        queryClient.invalidateQueries({ queryKey: applicationKeys.drive(response.data.driveId) });
      }
      // Note: Interview doesn't have collegeId property, so we can't invalidate college queries
    },
    onError: (error: any) => {
      console.error('Failed to schedule interview:', error);
    },
  });
};
