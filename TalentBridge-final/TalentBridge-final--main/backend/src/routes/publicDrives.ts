import { Router } from 'express';
import { prisma } from '../lib/prisma.js';

const router = Router();

// Get upcoming drives (public endpoint - no authentication required)
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

// Get all drives (public endpoint - no authentication required)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 50, search, type, status, location, sortBy, sortOrder } = req.query;
    
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

export default router;
