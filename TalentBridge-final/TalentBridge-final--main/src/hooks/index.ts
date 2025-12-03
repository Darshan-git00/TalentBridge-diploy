// Export all hooks
export * from './useStudents';
export * from './useDrives';
export * from './useApplications';
export * from './useRecruiters';
export * from './useColleges';

// Re-export commonly used hooks for convenience
export {
  // Student hooks
  useStudentProfile,
  useStudentDrives,
  useWithdrawApplication,
  useStudentInterviews,
  useStudentNotifications,
  useStartAIInterview,
  useSubmitAIInterview,
} from './useStudents';

export {
  // Drive hooks
  useDrives,
  useDriveById,
  useCreateDrive,
  useUpdateDrive,
  useDeleteDrive,
  useDriveStats,
  useUpcomingDrives,
  useCloseDrive,
  useDuplicateDrive,
} from './useDrives';

export {
  // Application hooks
  useApplications,
  useApplicationById,
  useCreateApplication,
  useUpdateApplication,
  useApplicationFeedback,
  useApplicationsStats,
  useApplicationInterviews,
  useUpdateInterviewStatus,
  // Application Workflow Foundation Hooks
  useApplyToDrive,
  useStudentApplications,
  useDriveApplications,
  useCollegeApplications,
  // Recruiter Actions System Hooks
  useUpdateApplicationStatus,
  useScheduleInterview,
} from './useApplications';

export {
  // Recruiter hooks
  useRecruiterProfile,
  useRecruiterDrives,
  useCreateRecruiterDrive,
  useUpdateRecruiterDrive,
  useDeleteRecruiterDrive,
  useRecruiterDriveApplications,
  useUpdateRecruiterApplicationStatus,
  useSearchStudents,
  useRecruiterDashboardStats,
  useBulkUpdateApplicationStatus,
  useExportApplications,
} from './useRecruiters';

export {
  // College hooks
  useCollegeProfile,
  useCollegeStudents,
  useCollegeStudentById,
  useAddStudent,
  useUpdateStudent,
  useCollegeDrives,
  useCollegeDashboardStats,
  usePlacementReport,
  useBulkUpdateStudents,
  useExportStudents,
  useFilteredStudents,
} from './useColleges';
