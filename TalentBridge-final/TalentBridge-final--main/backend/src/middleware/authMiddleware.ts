import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        role: string;
      };
    }
  }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  console.log('=== AUTH MIDDLEWARE CALLED ===');
  console.log('Request URL:', req.url);
  console.log('Request method:', req.method);
  console.log('Auth header:', req.headers['authorization']);
  
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  console.log('Extracted token:', token ? 'exists' : 'missing');

  if (!token) {
    console.log('ERROR: No token found');
    return res.status(401).json({ 
      success: false, 
      message: 'Access token required' 
    });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret', (err, decoded) => {
    console.log('JWT verification result:', err ? 'failed' : 'success');
    
    if (err) {
      console.log('JWT error:', err);
      return res.status(403).json({ 
        success: false, 
        message: 'Invalid or expired token' 
      });
    }

    // Attach decoded user to request
    req.user = decoded as { userId: string; role: string };
    console.log('User attached to request:', req.user);
    next();
  });
};

// Role-based middleware factory
export const requireRole = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    console.log('=== REQUIRE ROLE MIDDLEWARE CALLED ===');
    console.log('Allowed roles:', allowedRoles);
    console.log('User from request:', req.user);
    
    if (!req.user) {
      console.log('ERROR: No user found in request');
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    console.log('User role:', req.user.role);
    console.log('Role check:', allowedRoles.includes(req.user.role));

    if (!allowedRoles.includes(req.user.role)) {
      console.log('ERROR: Insufficient permissions');
      return res.status(403).json({ 
        success: false, 
        message: 'Insufficient permissions' 
      });
    }

    console.log('Role check passed, proceeding...');
    next();
  };
};

// Convenience middleware for specific roles
export const requireStudent = requireRole('student');
export const requireCollege = requireRole('college');
export const requireRecruiter = requireRole('recruiter');
