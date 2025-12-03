import type { Express, Request, Response, NextFunction } from 'express';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireStudent, requireCollege, requireRecruiter } from './middleware/authMiddleware.js';
import { productionMiddleware, rateLimit } from './middleware/productionMiddleware.js';

// Load environment variables
dotenv.config();

const app: Express = express();
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

// API Documentation Route
app.get('/api', (req: Request, res: Response) => {
  res.json({
    message: 'Welcome to the TalentBridge API',
    version: '1.0.0',
    docs: 'Coming soon',
    endpoints: {
      auth: '/api/auth',
      students: '/api/students',
      colleges: '/api/colleges',
      recruiters: '/api/recruiters',
      drives: '/api/drives',
      applications: '/api/applications',
      interviews: '/api/interviews',
      public: {
        drives: '/api/public/drives'
      }
    }
  });
});

// Health check endpoint
app.get('/health', async (req: Request, res: Response) => {
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
    console.error('Database health check failed:', error);
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
app.use('/api/auth', (await import('./routes/auth.js')).default);
app.use('/api/public/drives', (await import('./routes/publicDrives.js')).default);

// Protected Routes
app.use('/api/students', authenticateToken, requireStudent, (await import('./routes/students.js')).default);
app.use('/api/colleges', authenticateToken, requireCollege, (await import('./routes/colleges.js')).default);
app.use('/api/recruiters', authenticateToken, requireRecruiter, (await import('./routes/recruiters.js')).default);
app.use('/api/drives', authenticateToken, (await import('./routes/drives.js')).default);
app.use('/api/applications', authenticateToken, (await import('./routes/applications.js')).default);
app.use('/api/interviews', authenticateToken, (await import('./routes/interviews.js')).default);

// 404 handler
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({ 
    status: 'error',
    message: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('=== GLOBAL ERROR HANDLER ===');
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    name: err.name,
    url: req.url,
    method: req.method,
    body: req.body,
    headers: req.headers
  });

  res.status(500).json({ 
    status: 'error',
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// Start server
async function startServer() {
  try {
    // Debug: Log masked DATABASE_URL
    const dbUrl = process.env.DATABASE_URL || '';
    console.log('🔍 DATABASE_URL:', dbUrl ? `${dbUrl.split('@')[1]?.split('/')[0] || 'unknown'}` : 'not set');
    
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    const server = app.listen(port, () => {
      const address = server.address();
      const host = typeof address === 'string' ? address : `${address?.address}:${address?.port}`;
      console.log(`✅ Server running on ${host}`);
      console.log(`🚀 API available at http://localhost:${port}/api`);
      console.log(`🏥 Health check at http://localhost:${port}/health`);
    });

    // Handle server errors
    server.on('error', (error: NodeJS.ErrnoException) => {
      if (error.syscall !== 'listen') throw error;
      
      switch (error.code) {
        case 'EACCES':
          console.error(`Port ${port} requires elevated privileges`);
          process.exit(1);
        case 'EADDRINUSE':
          console.error(`Port ${port} is already in use`);
          process.exit(1);
        default:
          throw error;
      }
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
const shutdown = async () => {
  console.log('🔄 Shutting down gracefully...');
  try {
    await prisma.$disconnect();
    console.log('✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// Start the server
startServer().catch(error => {
  console.error('❌ Fatal error during startup:', error);
  process.exit(1);
});