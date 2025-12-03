-- Add missing profile fields to Student table
ALTER TABLE "Student" 
ADD COLUMN IF NOT EXISTS "resume" TEXT,
ADD COLUMN IF NOT EXISTS "portfolio" TEXT,
ADD COLUMN IF NOT EXISTS "linkedinProfile" TEXT,
ADD COLUMN IF NOT EXISTS "githubProfile" TEXT;
