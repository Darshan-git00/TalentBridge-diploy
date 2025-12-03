import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';

const router = Router();

// Search students (for recruiters)
router.get('/:recruiterId/students/search', async (req, res) => {
  try {
    const { recruiterId } = req.params;
    const { page = 1, limit = 50, search, skills, college, course, minCGPA, branch } = req.query;
    
    // Build where clause
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
        { skills: { contains: search as string, mode: 'insensitive' } }
      ];
    }
    
    if (skills) {
      const skillsArray = (skills as string).split(',');
      where.skills = { hasEvery: skillsArray };
    }
    
    if (college) {
      where.college = { name: { contains: college as string, mode: 'insensitive' } };
    }
    
    if (course) {
      where.course = course;
    }
    
    if (branch) {
      where.branch = branch;
    }
    
    if (minCGPA) {
      where.cgpa = { gte: parseFloat(minCGPA as string) };
    }
    
    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where,
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          college: {
            select: { id: true, name: true }
          }
        }
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
    console.error('Failed to search students:', error);
    res.status(500).json({ success: false, message: 'Failed to search students' });
  }
});

// Get all recruiters
router.get('/', async (req, res) => {
  try {
    const recruiters = await prisma.recruiter.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    res.json({ success: true, data: recruiters });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch recruiters' });
  }
});

// Get recruiter by ID
router.get('/:id', async (req, res) => {
  try {
    const recruiter = await prisma.recruiter.findUnique({
      where: { id: req.params.id },
      include: {
        drives: {
          take: 10,
          orderBy: { postedDate: 'desc' }
        }
      }
    });
    
    if (!recruiter) {
      return res.status(404).json({ success: false, message: 'Recruiter not found' });
    }
    
    res.json({ success: true, data: recruiter });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch recruiter' });
  }
});

// Update recruiter profile
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const recruiter = await prisma.recruiter.update({
      where: { id },
      data: updateData
    });
    
    res.json({ success: true, data: recruiter });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update recruiter' });
  }
});

// Get recruiter drives
router.get('/:id/drives', async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, type } = req.query;
    
    const where: any = { recruiterId: req.params.id };
    
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { company: { contains: search as string, mode: 'insensitive' } },
        { location: { contains: search as string, mode: 'insensitive' } }
      ];
    }
    
    if (status) where.status = status;
    if (type) where.type = type;
    
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
    res.status(500).json({ success: false, message: 'Failed to fetch recruiter drives' });
  }
});

// Create recruiter drive
router.post('/:id/drives', async (req, res) => {
  try {
    const driveData = {
      ...req.body,
      recruiterId: req.params.id
    };
    
    const drive = await prisma.drive.create({
      data: driveData
    });
    
    res.json({ success: true, data: drive });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create drive' });
  }
});

// Get recruiter drive applications
router.get('/:id/drives/:driveId/applications', async (req, res) => {
  try {
    const { page = 1, limit = 50, status, search } = req.query;
    
    const where: any = { 
      driveId: req.params.driveId,
      drive: { recruiterId: req.params.id }
    };
    
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { student: { name: { contains: search as string, mode: 'insensitive' } } },
        { student: { email: { contains: search as string, mode: 'insensitive' } } }
      ];
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
    res.status(500).json({ success: false, message: 'Failed to fetch drive applications' });
  }
});

// Update application status
router.put('/:id/applications/:applicationId', async (req, res) => {
  try {
    const { status, feedback } = req.body;
    
    const application = await prisma.application.update({
      where: { 
        id: req.params.applicationId,
        drive: { recruiterId: req.params.id }
      },
      data: {
        status
      }
    });
    
    res.json({ success: true, data: application });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update application status' });
  }
});

// Get recruiter dashboard stats
router.get('/:id/dashboard/stats', async (req, res) => {
  try {
    const recruiterId = req.params.id;
    
    const [totalDrives, activeDrives, totalApplications, pendingApplications, shortlistedApplications, scheduledInterviews] = await Promise.all([
      prisma.drive.count({ where: { recruiterId } }),
      prisma.drive.count({ where: { recruiterId, status: 'active' } }),
      prisma.application.count({ where: { drive: { recruiterId } } }),
      prisma.application.count({ where: { drive: { recruiterId }, status: 'applied' } }),
      prisma.application.count({ where: { drive: { recruiterId }, status: 'shortlisted' } }),
      prisma.interview.count({ where: { application: { drive: { recruiterId } } } })
    ]);
    
    const stats = {
      totalDrives,
      activeDrives,
      totalApplications,
      pendingApplications,
      shortlistedApplications,
      scheduledInterviews,
      conversionRate: totalApplications > 0 ? (shortlistedApplications / totalApplications) * 100 : 0
    };
    
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch recruiter stats' });
  }
});

export default router;
