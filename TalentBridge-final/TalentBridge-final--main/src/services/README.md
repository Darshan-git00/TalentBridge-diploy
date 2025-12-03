# API Service Layer

This directory contains a complete API service layer for the TalentBridge application. The services are designed to work with React Query and provide a clean separation between UI and data fetching logic.

## 📁 Structure

```
src/services/
├── api.ts              # Base API configuration and utilities
├── types.ts             # Shared TypeScript interfaces
├── studentService.ts    # Student-related API functions
├── drivesService.ts     # Drive management API functions
├── applicationsService.ts # Application management API functions
├── recruitersService.ts  # Recruiter-related API functions
├── collegesService.ts    # College-related API functions
├── index.ts             # Main exports file
└── README.md            # This documentation
```

## 🚀 Features

### **Base API Layer (`api.ts`)**
- Generic HTTP client wrapper
- API response standardization
- Error handling with custom `ApiError` class
- Mock API call utilities for development
- Configurable base URL

### **Type Definitions (`types.ts`)**
- Comprehensive TypeScript interfaces
- Shared types across all services
- Pagination support
- API response wrappers

### **Service Modules**

#### **Student Service (`studentService.ts`)**
- Profile management (get, update)
- Drive browsing and filtering
- Application management (apply, withdraw)
- Interview scheduling and AI interviews
- Notifications management

#### **Drives Service (`drivesService.ts`)**
- CRUD operations for drives
- Advanced filtering and search
- Application management per drive
- Drive statistics and analytics
- Company-specific drive management

#### **Applications Service (`applicationsService.ts`)**
- Application lifecycle management
- Status tracking and updates
- Feedback management
- Interview scheduling
- Analytics and reporting

#### **Recruiters Service (`recruitersService.ts`)**
- Recruiter profile management
- Drive creation and management
- Student search and filtering
- Application review and status updates
- Dashboard analytics

#### **Colleges Service (`collegesService.ts`)**
- College profile management
- Student management and tracking
- Drive coordination
- Placement reports and analytics
- Bulk operations

## 🔧 Usage Examples

### **Basic Service Call**

```typescript
import { studentService } from '@/services';

// Get student profile
const profile = await studentService.getProfile('student_1');

// Apply to drive
const application = await studentService.applyToDrive('student_1', 'drive_1', {
  resume: '/path/to/resume.pdf'
});
```

### **With React Query**

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studentService } from '@/services';

// Query hook
export const useStudentProfile = (studentId: string) => {
  return useQuery({
    queryKey: ['student', 'profile', studentId],
    queryFn: () => studentService.getProfile(studentId),
    select: (response) => response.data
  });
};

// Mutation hook
export const useApplyToDrive = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ studentId, driveId, data }) => 
      studentService.applyToDrive(studentId, driveId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    }
  });
};
```

### **Advanced Filtering**

```typescript
import { drivesService } from '@/services';

// Get drives with filters
const drives = await drivesService.getDrives({
  page: 1,
  limit: 10,
  search: 'software engineer',
  status: 'active',
  type: 'on-campus',
  sortBy: 'deadline',
  sortOrder: 'asc'
});
```

## 📊 Response Format

All API functions return a standardized `ApiResponse<T>`:

```typescript
interface ApiResponse<T> {
  status: 'success' | 'error';
  data: T;
  message?: string;
}
```

### **Paginated Responses**

```typescript
interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
```

## 🔄 Real API Integration

The services are now fully integrated with the real backend API:

- **Authentication**: JWT-based authentication with role-based access control
- **Students**: Real student profiles, skills, certifications from database
- **Colleges**: Real college data with departments and student information
- **Recruiters**: Real recruiter profiles from different companies
- **Drives**: Real drive postings with various statuses and requirements
- **Applications**: Real application tracking with different statuses
- **Interviews**: Real interview data with AI analysis results

## 🛡️ Authentication & Security

All API calls now include:
- JWT token authentication
- Role-based access control (students, recruiters, colleges)
- Automatic token refresh
- Protected routes with middleware

## 🚀 API Configuration

The API is configured in (`api.ts`):
```typescript
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
```

## 📝 Service Functions

All service functions now use real API calls:
- `apiClient.get()`, `apiClient.post()`, `apiClient.put()`, `apiClient.delete()`
- Proper error handling with try-catch blocks
- Type-safe response handling
- Automatic authentication token inclusion

## 🛡️ Error Handling

All services include comprehensive error handling:

```typescript
try {
  const result = await studentService.getProfile('invalid_id');
} catch (error) {
  if (error instanceof ApiError) {
    console.error('API Error:', error.message, error.status);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## 📈 Performance Considerations

- **Mock Delays**: All API calls include 500ms delay to simulate network latency
- **Pagination**: Large datasets are properly paginated
- **Filtering**: Client-side filtering for development (server-side in production)
- **Caching**: Ready for React Query caching strategies

## 🔍 Testing

The mock data structure makes it easy to test:

```typescript
// Test data consistency
const mockStudents = require('./studentService').mockStudents;
console.log('Total mock students:', mockStudents.length);

// Test API responses
const response = await studentService.getProfile('student_1');
console.log('Profile response:', response.data.name);
```

## 📝 Development Notes

- **TypeScript**: Full type safety across all services
- **Async/Await**: Modern async patterns throughout
- **Consistency**: Uniform function signatures and response formats
- **Extensibility**: Easy to add new endpoints and services
- **Documentation**: Comprehensive JSDoc comments

## 🎯 Next Steps

1. **React Query Integration**: Create query and mutation hooks
2. **API Migration**: Replace mock calls with real API calls
3. **Error Boundaries**: Add proper error handling in UI
4. **Loading States**: Implement loading indicators
5. **Caching Strategy**: Optimize React Query cache configuration

This service layer provides a solid foundation for scalable data management in the TalentBridge application! 🚀
