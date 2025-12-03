import type { Router } from 'express';
import { Router as createRouter } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { requireRecruiter } from '../middleware/authMiddleware.js';

const router = createRouter();

// Public routes (no authentication required)
// Get upcoming drives - public endpoint
router.get('/upcoming', async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    
    const where = {
      status: 'active'
    };
    
    const [drives, total] = await Promise.all([
      prisma.drive.findMany({
        where,
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        orderBy: { postedDate: 'asc' },
        include: {
          recruiter: {
            select: { id: true, name: true, company: true }
          }
        }
      }),
      prisma.drive.count({ where })
    ]);
    
    res.json({
      success: true,
      data: {
        data: drives,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Failed to fetch upcoming drives:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch upcoming drives' });
  }
});

// Get all drives - public endpoint
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 50, search, type, status, location, companyId, sortBy, sortOrder } = req.query;
    
    const where: any = {};
    
    if (search) {
      where.OR = [
        { position: { contains: search as string, mode: 'insensitive' } },
        { recruiter: { company: { contains: search as string, mode: 'insensitive' } } },
        { location: { contains: search as string, mode: 'insensitive' } }
      ];
    }
    
    if (type) where.type = type;
    if (status) where.status = status;
    if (location) where.location = { contains: location as string, mode: 'insensitive' };
    if (companyId) where.companyId = companyId;
    
    const orderBy: any = {};
    if (sortBy) {
      orderBy[sortBy as string] = sortOrder === 'desc' ? 'desc' : 'asc';
    } else {
      orderBy.postedDate = 'desc';
    }
    
    const [drives, total] = await Promise.all([
      prisma.drive.findMany({
        where,
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        orderBy,
        include: {
          recruiter: {
            select: { id: true, name: true, company: true }
          }
        }
      }),
      prisma.drive.count({ where })
    ]);
    
    res.json({
      success: true,
      data: {
        data: drives,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Failed to fetch drives:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch drives' });
  }
});

// Protected routes (require authentication)
// Get all drives with pagination and filtering (authenticated version)
router.get('/auth', async (req, res) => {
  try {
    const { page = 1, limit = 50, search, type, status, location, companyId, sortBy, sortOrder } = req.query;
    
    const where: any = {};
    
    if (search) {
      where.OR = [
        { position: { contains: search as string, mode: 'insensitive' } },
        { recruiter: { company: { contains: search as string, mode: 'insensitive' } } },
        { location: { contains: search as string, mode: 'insensitive' } }
      ];
    }
    
    if (type) where.type = type;
    if (status) where.status = status;
    if (location) where.location = { contains: location as string, mode: 'insensitive' };
    if (companyId) where.companyId = companyId;
    
    const orderBy: any = {};
    if (sortBy) {
      orderBy[sortBy as string] = sortOrder === 'desc' ? 'desc' : 'asc';
    } else {
      orderBy.postedDate = 'desc';
    }
    
    const [drives, total] = await Promise.all([
      prisma.drive.findMany({
        where,
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        orderBy,
        include: {
          recruiter: {
            select: { id: true, name: true, company: true }
          }
        }
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
    res.status(500).json({ success: false, message: 'Failed to fetch drives' });
  }
});

// Get drive by ID
router.get('/:id', async (req, res) => {
  try {
    const drive = await prisma.drive.findUnique({
      where: { id: req.params.id },
      include: {
        recruiter: true,
        applications: {
          take: 50,
          orderBy: { appliedDate: 'desc' }
        }
      }
    });
    
    if (!drive) {
      return res.status(404).json({ success: false, message: 'Drive not found' });
    }
    
    res.json({ success: true, data: drive });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch drive' });
  }
});

// Create new drive - only recruiters can create drives
router.post('/', requireRecruiter, async (req, res) => {
  try {
    // Ensure the recruiterId matches the authenticated user
    const driveData = {
      ...req.body,
      recruiterId: req.user?.userId // Use authenticated user's ID
    };
    
    const drive = await prisma.drive.create({
      data: driveData,
      include: {
        recruiter: {
          select: { id: true, name: true, company: true }
        }
      }
    });
    
    res.json({ success: true, data: drive });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create drive' });
  }
});

// Update drive - only recruiters can update drives
router.put('/:id', requireRecruiter, async (req, res) => {
  try {
    // First check if the drive exists and belongs to this recruiter
    const existingDrive = await prisma.drive.findUnique({
      where: { id: req.params.id }
    });
    
    if (!existingDrive) {
      return res.status(404).json({ success: false, message: 'Drive not found' });
    }
    
    if (existingDrive.recruiterId !== req.user?.userId) {
      return res.status(403).json({ success: false, message: 'You can only update your own drives' });
    }
    
    const drive = await prisma.drive.update({
      where: { id: req.params.id },
      data: req.body,
      include: {
        recruiter: {
          select: { id: true, name: true, company: true }
        }
      }
    });
    
    res.json({ success: true, data: drive });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update drive' });
  }
});

// Delete drive - only recruiters can delete drives
router.delete('/:id', requireRecruiter, async (req, res) => {
  try {
    // First check if the drive exists and belongs to this recruiter
    const existingDrive = await prisma.drive.findUnique({
      where: { id: req.params.id }
    });
    
    if (!existingDrive) {
      return res.status(404).json({ success: false, message: 'Drive not found' });
    }
    
    if (existingDrive.recruiterId !== req.user?.userId) {
      return res.status(403).json({ success: false, message: 'You can only delete your own drives' });
    }
    
    await prisma.drive.delete({
      where: { id: req.params.id }
    });
    
    res.json({ success: true, data: null });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete drive' });
  }
});

// Get drive applications - only drive creator can see applications
router.get('/:id/applications', requireRecruiter, async (req, res) => {
  try {
    const { page = 1, limit = 50, status, search } = req.query;
    
    // First check if the drive exists and belongs to this recruiter
    const existingDrive = await prisma.drive.findUnique({
      where: { id: req.params.id }
    });
    
    if (!existingDrive) {
      return res.status(404).json({ success: false, message: 'Drive not found' });
    }
    
    if (existingDrive.recruiterId !== req.user?.userId) {
      return res.status(403).json({ success: false, message: 'You can only view applications for your own drives' });
    }
    
    const where: any = { driveId: req.params.id };
    
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

// Get drive statistics
router.get('/:id/stats', async (req, res) => {
  try {
    const driveId = req.params.id;
    
    const [totalApplications, pendingApplications, shortlistedApplications, rejectedApplications, interviewsScheduled] = await Promise.all([
      prisma.application.count({ where: { driveId } }),
      prisma.application.count({ where: { driveId, status: 'applied' } }),
      prisma.application.count({ where: { driveId, status: 'shortlisted' } }),
      prisma.application.count({ where: { driveId, status: 'rejected' } }),
      prisma.interview.count({ where: { application: { driveId } } })
    ]);
    
    const stats = {
      totalApplications,
      pendingApplications,
      shortlistedApplications,
      rejectedApplications,
      interviewsScheduled
    };
    
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch drive stats' });
  }
});

// Get upcoming drives
router.get('/upcoming', async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    
    const where = {
      status: 'active'
    };
    
    const [drives, total] = await Promise.all([
      prisma.drive.findMany({
        where,
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        orderBy: { postedDate: 'asc' },
        include: {
          recruiter: {
            select: { id: true, name: true, company: true }
          }
        }
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
    res.status(500).json({ success: false, message: 'Failed to fetch upcoming drives' });
  }
});

// Close drive
router.put('/:id/close', async (req, res) => {
  try {
    const drive = await prisma.drive.update({
      where: { id: req.params.id },
      data: { status: 'closed' }
    });
    
    res.json({ success: true, data: drive });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to close drive' });
  }
});

export default router;
