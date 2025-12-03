import type { Router } from 'express';
import { Router as createRouter } from 'express';

import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { requireStudent, requireRecruiter, requireCollege } from '../middleware/authMiddleware.js';

const router = createRouter();

// Get all applications with pagination and filtering - role-based access
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 50, search, status, driveId, studentId, collegeId, sortBy, sortOrder } = req.query;
    const userRole = req.user?.role;
    const userId = req.user?.userId;
    
    const where: any = {};
    
    // Role-based filtering
    if (userRole === 'student') {
      // Students can only see their own applications
      where.studentId = userId;
    } else if (userRole === 'recruiter') {
      // Recruiters can only see applications for their drives
      const recruiterDrives = await prisma.drive.findMany({
        where: { recruiterId: userId },
        select: { id: true }
      });
      where.driveId = { in: recruiterDrives.map((drive: { id: string }) => drive.id) };
    } else if (userRole === 'college') {
      // Colleges can see applications from their students
      where.collegeId = userId;
    }
    
    // Apply additional filters
    if (search) {
      where.OR = [
        { student: { name: { contains: search as string, mode: 'insensitive' } } },
        { student: { email: { contains: search as string, mode: 'insensitive' } } },
        { drive: { position: { contains: search as string, mode: 'insensitive' } } },
        { drive: { recruiter: { company: { contains: search as string, mode: 'insensitive' } } } }
      ];
    }
    
    if (status) where.status = status;
    if (driveId) where.driveId = driveId;
    if (studentId && (userRole === 'recruiter' || userRole === 'college')) where.studentId = studentId;
    if (collegeId && (userRole === 'recruiter' || userRole === 'college')) where.collegeId = collegeId;
    
    const orderBy: any = {};
    if (sortBy) {
      orderBy[sortBy as string] = sortOrder === 'desc' ? 'desc' : 'asc';
    } else {
      orderBy.appliedDate = 'desc';
    }
    
    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where,
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        orderBy,
        include: {
          student: {
            select: { id: true, name: true, email: true, collegeId: true }
          },
          drive: {
            select: { id: true, position: true, recruiter: { select: { company: true } }, type: true, location: true }
          }
        }
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
    res.status(500).json({ success: false, message: 'Failed to fetch applications' });
  }
});

// Get application by ID
router.get('/:id', async (req, res) => {
  try {
    const application = await prisma.application.findUnique({
      where: { id: req.params.id },
      include: {
        student: true,
        drive: {
          include: {
            recruiter: {
              select: { id: true, name: true, company: true }
            }
          }
        },
        interviews: true
      }
    });
    
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }
    
    res.json({ success: true, data: application });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch application' });
  }
});

// Create application - only students can apply to drives
router.post('/', requireStudent, async (req, res) => {
  try {
    // Ensure the studentId matches the authenticated user
    const applicationData = {
      ...req.body,
      studentId: req.user?.userId // Use authenticated user's ID
    };
    
    const application = await prisma.application.create({
      data: applicationData,
      include: {
        student: {
          select: { id: true, name: true, email: true }
        },
        drive: {
          select: { id: true, position: true, recruiter: { select: { company: true } } }
        }
      }
    });
    
    res.json({ success: true, data: application });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create application' });
  }
});

// Update application - only drive creator or student can update
router.put('/:id', async (req, res) => {
  try {
    // First get the application to check ownership
    const existingApplication = await prisma.application.findUnique({
      where: { id: req.params.id },
      include: {
        drive: true
      }
    });
    
    if (!existingApplication) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }
    
    // Check if user is the drive creator or the student who applied
    const isDriveCreator = existingApplication.drive.recruiterId === req.user?.userId;
    const isStudent = existingApplication.studentId === req.user?.userId;
    
    if (!isDriveCreator && !isStudent) {
      return res.status(403).json({ success: false, message: 'You can only update your own application or applications for your drives' });
    }
    
    const application = await prisma.application.update({
      where: { id: req.params.id },
      data: req.body,
      include: {
        student: {
          select: { id: true, name: true, email: true }
        },
        drive: {
          select: { id: true, position: true }
        }
      }
    });
    
    res.json({ success: true, data: application });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update application' });
  }
});

// Update application status - only drive creator can change status
router.put('/:id/status', async (req, res) => {
  try {
    const { status, feedback } = req.body;
    
    // First get the application to check drive ownership
    const existingApplication = await prisma.application.findUnique({
      where: { id: req.params.id },
      include: {
        drive: true
      }
    });
    
    if (!existingApplication) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }
    
    // Only drive creator can change application status
    if (existingApplication.drive.recruiterId !== req.user?.userId) {
      return res.status(403).json({ success: false, message: 'Only drive creator can change application status' });
    }
    
    const application = await prisma.application.update({
      where: { id: req.params.id },
      data: {
        status
      }
    });
    
    res.json({ success: true, data: application });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update application status' });
  }
});

// Get application statistics
router.get('/stats', async (req, res) => {
  try {
    const { driveId, collegeId, studentId } = req.query;
    
    const where: any = {};
    if (driveId) where.driveId = driveId;
    if (studentId) where.studentId = studentId;
    if (collegeId) where.student = { collegeId };
    
    const [total, applied, underReview, shortlisted, rejected, scheduled, completed] = await Promise.all([
      prisma.application.count({ where }),
      prisma.application.count({ where: { ...where, status: 'applied' } }),
      prisma.application.count({ where: { ...where, status: 'under_review' } }),
      prisma.application.count({ where: { ...where, status: 'shortlisted' } }),
      prisma.application.count({ where: { ...where, status: 'rejected' } }),
      prisma.application.count({ where: { ...where, status: 'interview_scheduled' } }),
      prisma.application.count({ where: { ...where, status: 'accepted' } })
    ]);
    
    const stats = {
      total,
      applied,
      underReview,
      shortlisted,
      rejected,
      scheduled,
      completed
    };
    
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch application stats' });
  }
});

// Get student applications
router.get('/students/:studentId', async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    
    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where: { studentId: req.params.studentId },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        orderBy: { appliedDate: 'desc' },
        include: {
          drive: {
            select: { id: true, position: true, type: true, location: true }
          }
        }
      }),
      prisma.application.count({ where: { studentId: req.params.studentId } })
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
    res.status(500).json({ success: false, message: 'Failed to fetch student applications' });
  }
});

// Withdraw application
router.delete('/:id', async (req, res) => {
  try {
    await prisma.application.delete({
      where: { id: req.params.id }
    });
    
    res.json({ success: true, data: null });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to withdraw application' });
  }
});

export default router;