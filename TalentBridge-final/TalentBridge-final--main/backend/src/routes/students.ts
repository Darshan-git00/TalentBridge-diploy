import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';

const router = Router();

// Get all students with pagination and filtering
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 50, search, course, branch, year, minCGPA, skills } = req.query;
    
    const where: any = {};
    
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
    res.status(500).json({ success: false, message: 'Failed to fetch students' });
  }
});

// Get current student profile (authenticated user)
router.get('/me', async (req, res) => {
  try {
    const studentId = req.user?.userId; // Get from authenticated user
    
    if (!studentId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }
    
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        applications: true
      }
    });
    
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    
    res.json({ success: true, data: student });
  } catch (error) {
    console.error('Get student profile error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch student profile' });
  }
});

// Get student by ID
router.get('/:id', async (req, res) => {
  try {
    const student = await prisma.student.findUnique({
      where: { id: req.params.id },
      include: {
        applications: true
      }
    });
    
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    
    res.json({ success: true, data: student });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch student' });
  }
});

// Get student applications
router.get('/:id/applications', async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    
    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where: { studentId: req.params.id },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        include: {
          drive: true
        },
        orderBy: { appliedDate: 'desc' }
      }),
      prisma.application.count({ where: { studentId: req.params.id } })
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
    console.error('Get student applications error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch applications' });
  }
});

// Update current student profile (authenticated user)
router.put('/me', async (req, res) => {
  try {
    const studentId = req.user?.userId; // Get from authenticated user
    const updateData = req.body;
    
    if (!studentId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated'
      });
    }
    
    // Filter only allowed fields that exist in the schema
    const allowedFields = [
      'name', 'email', 'course', 'branch', 'year', 'cgpa',
      'skills', 'certifications', 'resume', 'portfolio', 'linkedinProfile', 'githubProfile'
    ];
    
    const filteredData: any = {};
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        filteredData[field] = updateData[field];
      }
    });
    
    // Check if student exists first
    const existingStudent = await prisma.student.findUnique({
      where: { id: studentId }
    });
    
    if (!existingStudent) {
      return res.status(404).json({ 
        success: false, 
        message: 'Student not found'
      });
    }
    
    // Try the update
    const student = await prisma.student.update({
      where: { id: studentId },
      data: filteredData
    });
    
    res.json({ success: true, data: student });
  } catch (error: any) {
    console.error('Profile update error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update student profile'
    });
  }
});

// Update student profile (admin/college only)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const student = await prisma.student.update({
      where: { id },
      data: updateData
    });
    
    res.json({ success: true, data: student });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update student' });
  }
});

export default router;
