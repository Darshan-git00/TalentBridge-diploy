import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../lib/prisma';

const router = Router();

// Validation schemas
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['student', 'college', 'recruiter'])
});

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  role: z.enum(['student', 'college', 'recruiter']),
  // Role-specific fields
  collegeId: z.string().optional(),
  phone: z.string().optional(),
  company: z.string().optional(),
});

const forgotPasswordSchema = z.object({
  email: z.string().email(),
  role: z.enum(['student', 'college', 'recruiter'])
});

const resetPasswordSchema = z.object({
  token: z.string(),
  newPassword: z.string().min(6)
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(6)
});

// Helper functions
const generateToken = (userId: string, role: string) => {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET || 'fallback-secret', { expiresIn: '7d' });
};

const generateResetToken = (userId: string, role: string) => {
  return jwt.sign({ userId, role, type: 'password-reset' }, process.env.JWT_SECRET || 'fallback-secret', { expiresIn: '1h' });
};

// Auth routes
router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = loginSchema.parse(req.body);
    
    let user;
    switch (role) {
      case 'student':
        user = await prisma.student.findUnique({ where: { email } });
        break;
      case 'college':
        user = await prisma.college.findUnique({ where: { email } });
        break;
      case 'recruiter':
        user = await prisma.recruiter.findUnique({ where: { email } });
        break;
    }
    
    if (!user || !await bcrypt.compare(password, user.passwordHash)) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    const token = generateToken(user.id, role);
    const { passwordHash: _, ...userWithoutPassword } = user;
    
    res.json({
      success: true,
      data: { user: { ...userWithoutPassword, role }, token }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Login failed' });
  }
});

router.post('/signup', async (req, res) => {
  try {
    const data = signupSchema.parse(req.body);
    const hashedPassword = await bcrypt.hash(data.password, 10);
    
    let user;
    switch (data.role) {
      case 'student':
        const studentData: any = {
          email: data.email,
          passwordHash: hashedPassword,
          name: data.name,
          course: "Computer Science",
          branch: "CS",
          year: "3",
          status: "available",
          cgpa: 8.0,
          skills: "JavaScript,React",
          certifications: "",
          aiInterviewScore: 0,
          skillMatchPercentage: 0,
          projectExperience: 0
        };
        
        if (data.collegeId) {
          // Check if college exists before using it
          const college = await prisma.college.findUnique({
            where: { id: data.collegeId }
          });
          
          if (college) {
            studentData.collegeId = data.collegeId;
          } else {
            // Use default college if provided collegeId doesn't exist
            studentData.collegeId = 'default-college-id';
          }
        } else {
          // Use default college if no collegeId provided
          studentData.collegeId = 'default-college-id';
        }
        
        user = await prisma.student.create({ data: studentData });
        break;
      case 'college':
        user = await prisma.college.create({
          data: {
            email: data.email,
            passwordHash: hashedPassword,
            name: data.name,
            code: "COLLEGE_" + Math.random().toString(36).substr(2, 9).toUpperCase(),
            location: "Default Location",
            isVerified: false
          }
        });
        break;
      case 'recruiter':
        const recruiterData: any = {
          email: data.email,
          passwordHash: hashedPassword,
          name: data.name,
          company: data.company || "Default Company",
          status: "active"
        };
        
        if (data.collegeId) {
          // Check if college exists before using it
          const college = await prisma.college.findUnique({
            where: { id: data.collegeId }
          });
          
          if (college) {
            recruiterData.collegeId = data.collegeId;
          }
          // If college doesn't exist, don't set collegeId (it's optional for recruiters)
        }
        
        user = await prisma.recruiter.create({ data: recruiterData });
        break;
    }
    
    const token = generateToken(user.id, data.role);
    const { passwordHash: _, ...userWithoutPassword } = user;
    
    res.json({
      success: true,
      data: { user: { ...userWithoutPassword, role: data.role }, token }
    });
  } catch (error) {
    console.error('Signup error:', error);
    
    // Handle specific database errors
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return res.status(400).json({ 
          success: false, 
          message: 'Email already exists in database' 
        });
      }
      return res.status(500).json({ success: false, message: error.message });
    }
    
    res.status(500).json({ success: false, message: 'Signup failed' });
  }
});

// Forgot Password route
router.post('/forgot-password', async (req, res) => {
  try {
    const { email, role } = forgotPasswordSchema.parse(req.body);
    
    let user;
    switch (role) {
      case 'student':
        user = await prisma.student.findUnique({ where: { email } });
        break;
      case 'college':
        user = await prisma.college.findUnique({ where: { email } });
        break;
      case 'recruiter':
        user = await prisma.recruiter.findUnique({ where: { email } });
        break;
    }
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Generate reset token
    const resetToken = generateResetToken(user.id, role);
    
    // In a real application, you would send this via email
    // For now, we'll just return success (in development, you can log the token)
    console.log(`Password reset token for ${email}: ${resetToken}`);
    
    res.json({
      success: true,
      message: 'Password reset link sent to your email',
      data: { resetToken } // Only for development - remove in production
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, message: 'Failed to process request' });
  }
});

// Reset Password route
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = resetPasswordSchema.parse(req.body);
    
    // Verify the reset token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    } catch (error) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }
    
    if (decoded.type !== 'password-reset') {
      return res.status(400).json({ success: false, message: 'Invalid token type' });
    }
    
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password based on role
    let user;
    switch (decoded.role) {
      case 'student':
        user = await prisma.student.update({
          where: { id: decoded.userId },
          data: { passwordHash: hashedPassword }
        });
        break;
      case 'college':
        user = await prisma.college.update({
          where: { id: decoded.userId },
          data: { passwordHash: hashedPassword }
        });
        break;
      case 'recruiter':
        user = await prisma.recruiter.update({
          where: { id: decoded.userId },
          data: { passwordHash: hashedPassword }
        });
        break;
    }
    
    res.json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, message: 'Failed to reset password' });
  }
});

// Change Password route (for logged-in users)
router.post('/change-password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);
    
    // Get user info from JWT token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }
    
    const token = authHeader.substring(7);
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }
    
    // Get user based on role
    let user;
    switch (decoded.role) {
      case 'student':
        user = await prisma.student.findUnique({ where: { id: decoded.userId } });
        break;
      case 'college':
        user = await prisma.college.findUnique({ where: { id: decoded.userId } });
        break;
      case 'recruiter':
        user = await prisma.recruiter.findUnique({ where: { id: decoded.userId } });
        break;
    }
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }
    
    // Hash the new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password based on role
    switch (decoded.role) {
      case 'student':
        await prisma.student.update({
          where: { id: decoded.userId },
          data: { passwordHash: hashedNewPassword }
        });
        break;
      case 'college':
        await prisma.college.update({
          where: { id: decoded.userId },
          data: { passwordHash: hashedNewPassword }
        });
        break;
      case 'recruiter':
        await prisma.recruiter.update({
          where: { id: decoded.userId },
          data: { passwordHash: hashedNewPassword }
        });
        break;
    }
    
    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ success: false, message: 'Failed to change password' });
  }
});

export default router;
