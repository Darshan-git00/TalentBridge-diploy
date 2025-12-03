import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    // First, check if it exists
    const existing = await prisma.college.findUnique({
      where: { id: 'default-college-id' }
    });

    if (existing) {
      console.log('✅ Default college already exists.');
      return;
    }

    const defaultCollege = await prisma.college.create({
      data: {
        id: 'default-college-id',
        name: 'Default Test College',
        code: 'DEFAULT_001',
        email: 'admin@defaultcollege.edu',
        passwordHash: 'hashed_password_placeholder',
        location: 'Test Location',
        isVerified: true,
      },
    });
    console.log('✅ Default college created:', defaultCollege);
  } catch (error) {
    console.error('❌ Error seeding default college:');
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
