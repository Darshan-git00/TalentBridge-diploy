import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  try {
    // Create default college if it doesn't exist
    const existingCollege = await prisma.college.findUnique({
      where: { id: 'default-college-id' }
    });

    let college;
    if (!existingCollege) {
      college = await prisma.college.create({
        data: {
          id: 'default-college-id',
          name: 'Default Test College',
          code: 'DEFAULT_001',
          email: 'admin@defaultcollege.edu',
          passwordHash: await bcrypt.hash('admin123', 10),
          location: 'Test Location',
          isVerified: true,
        },
      });
      console.log('✅ Default college created:', college.name);
    } else {
      college = existingCollege;
      console.log('✅ Default college already exists:', college.name);
    }

    // Create sample student
    const existingStudent = await prisma.student.findUnique({
      where: { email: 'student@test.com' }
    });

    if (!existingStudent) {
      const student = await prisma.student.create({
        data: {
          collegeId: college.id,
          name: 'Test Student',
          email: 'student@test.com',
          passwordHash: await bcrypt.hash('student123', 10),
          course: 'Computer Science',
          branch: 'CS',
          year: '3',
          status: 'active',
          cgpa: 8.5,
          skills: 'JavaScript, React, Node.js, Python',
          certifications: 'AWS Certified Developer, React Certification',
          aiInterviewScore: 85,
          skillMatchPercentage: 90,
          projectExperience: 2,
        },
      });
      console.log('✅ Sample student created:', student.email);
    } else {
      console.log('✅ Sample student already exists');
    }

    // Create sample recruiter
    const existingRecruiter = await prisma.recruiter.findUnique({
      where: { email: 'recruiter@testcompany.com' }
    });

    if (!existingRecruiter) {
      const recruiter = await prisma.recruiter.create({
        data: {
          collegeId: college.id,
          name: 'Test Recruiter',
          company: 'Test Company Inc.',
          email: 'recruiter@testcompany.com',
          passwordHash: await bcrypt.hash('recruiter123', 10),
          status: 'active',
        },
      });
      console.log('✅ Sample recruiter created:', recruiter.email);
    } else {
      console.log('✅ Sample recruiter already exists');
    }

    console.log('\n🎉 Sample users created successfully!');
    console.log('\nLogin credentials:');
    console.log('🎓 Student: student@test.com / student123');
    console.log('👔 Recruiter: recruiter@testcompany.com / recruiter123');
    console.log('🏫 College: admin@defaultcollege.edu / admin123');

  } catch (error) {
    console.error('❌ Error seeding data:');
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
