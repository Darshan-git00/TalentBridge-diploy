import React, { createContext, useState } from 'react';

// Types
export type Student = {
  id: number;
  name: string;
  branch: string;
  status: 'available' | 'placed' | 'on-hold';
  year: string;
  shortlisted: boolean;
  cgpa: number;
  details: {
    academics: string;
    skills: string[];
    resumeUrl: string;
    appliedDrives: number[];
  };
};

export type CollegeDrive = {
  id: number;
  title: string;
  company: string;
  logo: string;
  salary: string;
  location: string;
  type: 'Job' | 'Internship';
  requirements: string[];
  status: 'active' | 'closed';
  openings: number;
  interviews: number;
  applicants: number[]; // Student IDs
  description: string;
};

export type Company = {
  id: number;
  name: string;
  logo: string;
  description: string;
  status: 'active' | 'pending';
  activePositions: number;
  totalHires: number;
  driveIds: number[];
};

export type Profile = {
  id: number;
  name: string;
  email: string;
  phone: string;
  location: string;
  website: string;
};

export type Settings = {
  darkMode: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
};

export type Activity = {
  time: string;
  message: string;
  type: 'drive' | 'placement' | 'company' | 'student';
};

export type CollegeStats = {
  totalStudents: number;
  activeCompanies: number;
  totalPositions: number;
  placedStudents: number;
  activeDrives: number;
};

// Context interface
export const CollegeDataContext = createContext<any>(null);

export const CollegeDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Dummy initial data
  const [drives, setDrives] = useState<CollegeDrive[]>([/* ...drives here... */]);
  const [companies, setCompanies] = useState<Company[]>([/* ...companies here... */]);
  const [students, setStudents] = useState<Student[]>([/* ...students here... */]);
  const [profile, setProfile] = useState<Profile>({
    id: 1,
    name: 'RVCE College',
    email: 'admin@rvce.edu',
    phone: '+91 98765 43210',
    location: 'Bangalore',
    website: 'https://rvce.edu',
  });
  const [settings, setSettings] = useState<Settings>({
    darkMode: false,
    emailNotifications: true,
    pushNotifications: true,
  });
  const [activities, setActivities] = useState<Activity[]>([/* ...activities here... */]);
  const [stats, setStats] = useState<CollegeStats>({
    totalStudents: 459,
    activeCompanies: 46,
    totalPositions: 57,
    placedStudents: 312,
    activeDrives: 5,
  });

  // Nav state (current College module page, or which detailed item view)
  const [activePage, setActivePage] = useState<'dashboard'|'drives'|'companies'|'students'|'profile'|'settings'|'driveDetail'|'companyDetail'|'studentDetail'>('dashboard');
  const [viewDrive, setViewDrive] = useState<CollegeDrive|null>(null);
  const [viewStudent, setViewStudent] = useState<Student|null>(null);
  const [viewCompany, setViewCompany] = useState<Company|null>(null);

  // Add all CRUD and toggle actions here: addDrive, editDrive, closeDrive, addCompany, editCompany, addStudent, shortlistStudent, updateProfile, updateSettings, etc.

  // Return provider
  return (
    <CollegeDataContext.Provider
      value={{
        drives, setDrives,
        companies, setCompanies,
        students, setStudents,
        profile, setProfile,
        settings, setSettings,
        activities, setActivities,
        stats, setStats,
        activePage, setActivePage,
        viewDrive, setViewDrive,
        viewStudent, setViewStudent,
        viewCompany, setViewCompany
        // ...add methods for all actions as needed
      }}
    >
      {children}
    </CollegeDataContext.Provider>
  );
};
