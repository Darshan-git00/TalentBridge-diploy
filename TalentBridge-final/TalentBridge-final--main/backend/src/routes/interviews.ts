import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { requireStudent, requireRecruiter, requireCollege } from '../middleware/authMiddleware';

const router = Router();

// Get all interviews with pagination and filtering - role-based access
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 50, search, status, applicationId, studentId, recruiterId } = req.query;
    const userRole = req.user?.role;
    const userId = req.user?.userId;
    
    const where: any = {};
    
    // Role-based filtering
    if (userRole === 'student') {
      // Students can only see their own interviews
      where.application = { studentId: userId };
    } else if (userRole === 'recruiter') {
      // Recruiters can only see interviews for their drives
      where.application = { drive: { recruiterId: userId } };
    } else if (userRole === 'college') {
      // Colleges can see interviews for their students
      where.application = { student: { collegeId: userId } };
    }
    
    // Apply additional filters
    if (search) {
      where.OR = [
        { application: { student: { name: { contains: search as string, mode: 'insensitive' } } } },
        { application: { drive: { position: { contains: search as string, mode: 'insensitive' } } } },
        { type: { contains: search as string, mode: 'insensitive' } }
      ];
    }
    
    if (status) where.status = status;
    if (applicationId && (userRole === 'recruiter' || userRole === 'college')) where.applicationId = applicationId;
    if (studentId && (userRole === 'recruiter' || userRole === 'college')) where.application = { studentId };
    if (recruiterId && (userRole === 'college')) where.application = { drive: { recruiterId } };
    
    const [interviews, total] = await Promise.all([
      prisma.interview.findMany({
        where,
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          application: {
            include: {
              student: {
                select: { id: true, name: true, email: true }
              },
              drive: {
                select: { id: true, position: true }
              }
            }
          }
        }
      }),
      prisma.interview.count({ where })
    ]);
    
    res.json({
      success: true,
      data: {
        interviews,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch interviews' });
  }
});

// Get interview by ID
router.get('/:id', async (req, res) => {
  try {
    const interview = await prisma.interview.findUnique({
      where: { id: req.params.id },
      include: {
        application: {
          include: {
            student: true,
            drive: {
              include: {
                recruiter: {
                  select: { id: true, name: true, company: true }
                }
              }
            }
          }
        }
      }
    });
    
    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview not found' });
    }
    
    res.json({ success: true, data: interview });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch interview' });
  }
});

// Get application interviews
router.get('/applications/:applicationId', async (req, res) => {
  try {
    const interviews = await prisma.interview.findMany({
      where: { applicationId: req.params.applicationId },
      orderBy: { createdAt: 'desc' },
      include: {
        application: {
          include: {
            student: {
              select: { id: true, name: true, email: true }
            },
            drive: {
              select: { id: true, position: true, recruiter: { select: { company: true } } }
            }
          }
        }
      }
    });
    
    res.json({ success: true, data: interviews });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch application interviews' });
  }
});

// Schedule interview
router.post('/applications/:applicationId', async (req, res) => {
  try {
    const interviewData = {
      ...req.body,
      applicationId: req.params.applicationId
    };
    
    const interview = await prisma.interview.create({
      data: interviewData,
      include: {
        application: {
          include: {
            student: {
              select: { id: true, name: true, email: true }
            },
            drive: {
              select: { id: true, position: true, recruiter: { select: { company: true } } }
            }
          }
        }
      }
    });
    
    res.json({ success: true, data: interview });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to schedule interview' });
  }
});

// Update interview status
router.put('/:id', async (req, res) => {
  try {
    const { status, feedback, scheduledAt, meetLink } = req.body;
    
    const interview = await prisma.interview.update({
      where: { id: req.params.id },
      data: {
        status: status || undefined,
        feedback: feedback || undefined,
        date: scheduledAt || undefined,
        location: meetLink || undefined
      },
      include: {
        application: {
          include: {
            student: {
              select: { id: true, name: true, email: true }
            },
            drive: {
              select: { id: true, position: true, recruiter: { select: { company: true } } }
            }
          }
        }
      }
    });
    
    res.json({ success: true, data: interview });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update interview status' });
  }
});

// Update interview status (alternative endpoint)
router.put('/applications/:applicationId/:interviewId', async (req, res) => {
  try {
    const { status } = req.body;
    
    const interview = await prisma.interview.update({
      where: { 
        id: req.params.interviewId,
        applicationId: req.params.applicationId
      },
      data: { 
        mode: status || undefined
      },
      include: {
        application: {
          include: {
            student: {
              select: { id: true, name: true, email: true }
            },
            drive: {
              select: { id: true, position: true, recruiter: { select: { company: true } } }
            }
          }
        }
      }
    });
    
    res.json({ success: true, data: interview });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update interview status' });
  }
});

export default router;
