// Main service exports
export * from './api';
export * from './types';
export * from './studentService';
export * from './drivesService';
export * from './applicationsService';
export * from './recruitersService';
export * from './collegesService';

// Re-export commonly used types and utilities
export type {
  User,
  Student,
  College,
  Recruiter,
  Drive,
  Application,
  Interview,
  Notification,
  Certification,
  ApplicationFeedback,
  InterviewFeedback,
  AIInterviewAnalysis,
  PaginationParams,
  PaginatedResponse,
  ApiResponse
} from './types';

// Re-export API utilities
export {
  apiClient,
  ApiError,
  API_BASE_URL
} from './api';

// Re-export all services
export { studentService } from './studentService';
export { drivesService } from './drivesService';
export { applicationsService } from './applicationsService';
export { recruitersService } from './recruitersService';
export { collegesService } from './collegesService';
