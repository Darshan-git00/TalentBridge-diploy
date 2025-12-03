import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireStudent, requireCollege, requireRecruiter } from './middleware/authMiddleware';
import { productionMiddleware, rateLimit } from './middleware/productionMiddleware';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;
const prisma = new PrismaClient();

// Middleware
const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? (process.env.CORS_ORIGINS?.split(',') || [])
  : ['http://localhost:8080', 'http://localhost:8081', 'http://localhost:8082', 'http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());
app.use(productionMiddleware);
app.use(rateLimit());

// Health check endpoint
app.get('/health', async (req, res) => {
  console.log('=== HEALTH ENDPOINT CALLED ===');
  
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    
    res.json({ 
      status: 'ok', 
      message: 'Server is running',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
      database: 'connected'
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      message: 'Database connection failed',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
      database: 'disconnected'
    });
  }
});

// API Routes
// Auth routes - public (login/signup don't require authentication)
app.use('/api/auth', (await import('./routes/auth')).default);

// Public drives routes - no authentication required (add to drives.ts before auth middleware)
app.use('/api/public/drives', (await import('./routes/drives')).default);

// Student routes - require student authentication
app.use('/api/students', authenticateToken, requireStudent, (await import('./routes/students')).default);

// College routes - require college authentication  
app.use('/api/colleges', authenticateToken, requireCollege, (await import('./routes/colleges')).default);

// Recruiter routes - require recruiter authentication
app.use('/api/recruiters', authenticateToken, requireRecruiter, (await import('./routes/recruiters')).default);

// Drive routes - require authentication (any role can view, but only recruiters can create/update)
app.use('/api/drives', authenticateToken, (await import('./routes/drives')).default);

// Application routes - require authentication (students apply, recruiters/colleges review)
app.use('/api/applications', authenticateToken, (await import('./routes/applications')).default);

// Interview routes - require authentication
app.use('/api/interviews', authenticateToken, (await import('./routes/interviews')).default);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('=== GLOBAL ERROR HANDLER ===');
  console.error('Error stack:', err.stack);
  console.error('Error message:', err.message);
  console.error('Error name:', err.name);
  console.error('Request URL:', req.url);
  console.error('Request method:', req.method);
  console.error('Request body:', req.body);
  console.error('Request headers:', req.headers);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
async function startServer() {
  try {
    // Debug: Log DATABASE_URL (masked for security)
    const dbUrl = process.env.DATABASE_URL || '';
    console.log('🔍 DATABASE_URL:', dbUrl.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));
    
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    app.listen(port, () => {
      console.log(`✅ Server running on port ${port}`);
      console.log(`🚀 API available at http://localhost:${port}/api`);
      console.log(`🏥 Health check at http://localhost:${port}/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('🔄 Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

startServer();
