import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';

const router = Router();

// Get all colleges
router.get('/', async (req, res) => {
  try {
    const colleges = await prisma.college.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    res.json({ success: true, data: colleges });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch colleges' });
  }
});

// Get college by ID
router.get('/:id', async (req, res) => {
  try {
    const college = await prisma.college.findUnique({
      where: { id: req.params.id },
      include: {
        students: {
          take: 50,
          orderBy: { createdAt: 'desc' }
        },
        drives: {
          take: 10,
          orderBy: { postedDate: 'desc' }
        }
      }
    });
    
    if (!college) {
      return res.status(404).json({ success: false, message: 'College not found' });
    }
    
    res.json({ success: true, data: college });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch college' });
  }
});

// Get college students
router.get('/:id/students', async (req, res) => {
  try {
    const { page = 1, limit = 50, search, course, branch, year, minCGPA, skills } = req.query;
    
    const where: any = { collegeId: req.params.id };
    
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } }
      ];
    }
    
    if (course) where.course = course;
    if (branch) where.branch = branch;
    if (year) where.year = year;
    if (minCGPA) where.cgpa = { gte: parseFloat(minCGPA as string) };
    if (skills) {
      const skillsArray = (skills as string).split(',');
      where.skills = { hasEvery: skillsArray };
    }
    
    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where,
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.student.count({ where })
    ]);
    
    res.json({
      success: true,
      data: {
        students,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch college students' });
  }
});

// Get college drives
router.get('/:id/drives', async (req, res) => {
  try {
    const { page = 1, limit = 10, status, type, location } = req.query;
    
    const where: any = { collegeId: req.params.id };
    
    if (status) where.status = status;
    if (type) where.type = type;
    if (location) where.location = { contains: location as string, mode: 'insensitive' };
    
    const [drives, total] = await Promise.all([
      prisma.drive.findMany({
        where,
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        orderBy: { postedDate: 'desc' }
      }),
      prisma.drive.count({ where })
    ]);
    
    res.json({
      success: true,
      data: {
        drives,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch college drives' });
  }
});

// Get college applications
router.get('/:id/applications', async (req, res) => {
  try {
    const { page = 1, limit = 50, status, driveId, studentId } = req.query;
    const collegeId = req.params.id;
    
    const where: any = {};
    
    if (status) where.status = status;
    if (driveId) where.driveId = driveId;
    if (studentId) where.studentId = studentId;
    
    // Filter by college through the student relationship
    if (collegeId) {
      where.student = { collegeId };
    }
    
    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where,
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        include: {
          student: true,
          drive: true
        },
        orderBy: { appliedDate: 'desc' }
      }),
      prisma.application.count({ where })
    ]);
    
    res.json({
      success: true,
      data: {
        applications,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch college applications' });
  }
});

// Get college dashboard stats
router.get('/:id/dashboard/stats', async (req, res) => {
  try {
    const collegeId = req.params.id;
    
    const [totalStudents, activeDrives, totalApplications, pendingApplications, shortlistedApplications, scheduledInterviews] = await Promise.all([
      prisma.student.count({ where: { collegeId } }),
      prisma.drive.count({ where: { collegeId, status: 'active' } }),
      prisma.application.count({ where: { student: { collegeId } } }),
      prisma.application.count({ where: { student: { collegeId }, status: 'applied' } }),
      prisma.application.count({ where: { student: { collegeId }, status: 'shortlisted' } }),
      prisma.interview.count({ where: { application: { student: { collegeId } }, status: 'scheduled' } })
    ]);
    
    const stats = {
      totalStudents,
      activeDrives,
      totalApplications,
      pendingApplications,
      shortlistedApplications,
      scheduledInterviews,
      placementRate: totalStudents > 0 ? (shortlistedApplications / totalStudents) * 100 : 0
    };
    
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch college stats' });
  }
});

export default router;
