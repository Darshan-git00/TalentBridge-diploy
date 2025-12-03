// Resume Parser - Automated resume analysis and skill extraction

export interface ParsedResume {
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    location?: string;
    linkedin?: string;
    github?: string;
  };
  education: Array<{
    degree: string;
    institution: string;
    year: string;
    cgpa?: string;
  }>;
  experience: Array<{
    company: string;
    position: string;
    duration: string;
    description: string[];
  }>;
  skills: {
    technical: string[];
    soft: string[];
    tools: string[];
    languages: string[];
  };
  projects: Array<{
    name: string;
    description: string;
    technologies: string[];
    duration?: string;
  }>;
  certifications: Array<{
    name: string;
    issuer: string;
    date: string;
  }>;
  summary: string;
  totalExperience: number; // in years
  score: number; // overall resume score (0-100)
  recommendations: string[];
}

// Common technical skills for matching
const TECHNICAL_SKILLS = [
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust',
  'React', 'Vue', 'Angular', 'Node.js', 'Express', 'Django', 'Flask', 'Spring',
  'HTML', 'CSS', 'SASS', 'Tailwind', 'Bootstrap', 'Material-UI',
  'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Elasticsearch', 'Firebase',
  'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Jenkins', 'CI/CD',
  'Git', 'GitHub', 'GitLab', 'Jira', 'Confluence', 'Figma', 'Adobe XD',
  'Machine Learning', 'AI', 'Data Science', 'TensorFlow', 'PyTorch', 'Scikit-learn',
  'Mobile Development', 'React Native', 'Flutter', 'iOS', 'Android',
  'DevOps', 'Microservices', 'REST APIs', 'GraphQL', 'WebSocket'
];

// Common soft skills
const SOFT_SKILLS = [
  'Leadership', 'Communication', 'Teamwork', 'Problem Solving', 'Critical Thinking',
  'Time Management', 'Project Management', 'Adaptability', 'Creativity', 'Analytical Skills',
  'Attention to Detail', 'Collaboration', 'Interpersonal Skills', 'Presentation Skills',
  'Negotiation', 'Decision Making', 'Strategic Planning', 'Mentoring', 'Conflict Resolution'
];

// Common tools and platforms
const TOOLS = [
  'VS Code', 'IntelliJ', 'Eclipse', 'Xcode', 'Android Studio', 'Postman',
  'Chrome DevTools', 'Webpack', 'Babel', 'ESLint', 'Prettier', 'Slack',
  'Microsoft Office', 'Google Workspace', 'Notion', 'Trello', 'Asana',
  'Kaggle', 'LeetCode', 'HackerRank', 'Tableau', 'Power BI', 'Excel'
];

export class ResumeParser {
  static parseResume(file: File): Promise<ParsedResume> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const parsed = this.extractResumeData(text);
          resolve(parsed);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  private static extractResumeData(text: string): ParsedResume {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    // Extract personal information
    const personalInfo = this.extractPersonalInfo(lines);
    
    // Extract education
    const education = this.extractEducation(lines);
    
    // Extract experience
    const experience = this.extractExperience(lines);
    
    // Extract skills
    const skills = this.extractSkills(text);
    
    // Extract projects
    const projects = this.extractProjects(lines);
    
    // Extract certifications
    const certifications = this.extractCertifications(lines);
    
    // Calculate total experience
    const totalExperience = this.calculateTotalExperience(experience);
    
    // Generate summary
    const summary = this.generateSummary(personalInfo, experience, skills, education);
    
    // Calculate resume score
    const score = this.calculateResumeScore(personalInfo, education, experience, skills, projects, certifications);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(personalInfo, education, experience, skills, projects, certifications);

    return {
      personalInfo,
      education,
      experience,
      skills,
      projects,
      certifications,
      summary,
      totalExperience,
      score,
      recommendations
    };
  }

  private static extractPersonalInfo(lines: string[]) {
    const personalInfo = {
      name: '',
      email: '',
      phone: '',
      location: '',
      linkedin: '',
      github: ''
    };

    // Email regex
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
    // Phone regex
    const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
    // LinkedIn regex
    const linkedinRegex = /linkedin\.com\/in\/[\w-]+/i;
    // GitHub regex
    const githubRegex = /github\.com\/[\w-]+/i;

    for (let i = 0; i < Math.min(lines.length, 10); i++) {
      const line = lines[i];
      
      // Extract email
      const emailMatch = line.match(emailRegex);
      if (emailMatch && !personalInfo.email) {
        personalInfo.email = emailMatch[0];
      }
      
      // Extract phone
      const phoneMatch = line.match(phoneRegex);
      if (phoneMatch && !personalInfo.phone) {
        personalInfo.phone = phoneMatch[0];
      }
      
      // Extract LinkedIn
      const linkedinMatch = line.match(linkedinRegex);
      if (linkedinMatch && !personalInfo.linkedin) {
        personalInfo.linkedin = 'https://' + linkedinMatch[0];
      }
      
      // Extract GitHub
      const githubMatch = line.match(githubRegex);
      if (githubMatch && !personalInfo.github) {
        personalInfo.github = 'https://' + githubMatch[0];
      }
      
      // Extract name (usually first line with no special characters)
      if (!personalInfo.name && i === 0 && line.length < 50 && !line.includes('@') && !line.includes('http')) {
        personalInfo.name = line;
      }
      
      // Extract location
      if (!personalInfo.location && (line.includes(',') || line.includes('City') || line.includes('Location'))) {
        personalInfo.location = line;
      }
    }

    return personalInfo;
  }

  private static extractEducation(lines: string[]) {
    const education: Array<{degree: string; institution: string; year: string; cgpa?: string}> = [];
    const educationKeywords = ['B.Tech', 'M.Tech', 'B.E', 'M.E', 'B.Sc', 'M.Sc', 'BCA', 'MCA', 'BBA', 'MBA', 'PhD', 'College', 'University', 'Institute'];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lowerLine = line.toLowerCase();
      
      if (educationKeywords.some(keyword => lowerLine.includes(keyword.toLowerCase()))) {
        const degree = line;
        let institution = '';
        let year = '';
        let cgpa = '';
        
        // Look for institution in next few lines
        for (let j = i + 1; j < Math.min(i + 3, lines.length); j++) {
          const nextLine = lines[j];
          if (nextLine.match(/\d{4}/)) {
            year = nextLine.match(/\d{4}/)?.[0] || '';
          }
          if (nextLine.includes('CGPA') || nextLine.includes('GPA')) {
            cgpa = nextLine;
          } else if (!year && !cgpa && nextLine.length > 10) {
            institution = nextLine;
          }
        }
        
        if (degree && (institution || year)) {
          education.push({ degree, institution, year, cgpa });
        }
      }
    }
    
    return education;
  }

  private static extractExperience(lines: string[]) {
    const experience: Array<{company: string; position: string; duration: string; description: string[]}> = [];
    const experienceKeywords = ['Experience', 'Work History', 'Employment', 'Professional Experience'];
    
    let inExperienceSection = false;
    let currentEntry: Partial<typeof experience[0]> = {};
    let descriptionLines: string[] = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lowerLine = line.toLowerCase();
      
      // Check if we're entering experience section
      if (experienceKeywords.some(keyword => lowerLine.includes(keyword.toLowerCase()))) {
        inExperienceSection = true;
        continue;
      }
      
      // Check for date patterns (start/end dates)
      const datePattern = /\d{4}|\d{1,2}\/\d{1,2}|\d{1,2}-\d{1,2}|Present|Current/;
      if (inExperienceSection && line.match(datePattern)) {
        // Save previous entry if exists
        if (currentEntry.position && currentEntry.company) {
          experience.push({
            company: currentEntry.company,
            position: currentEntry.position,
            duration: currentEntry.duration || '',
            description: descriptionLines
          });
        }
        
        // Start new entry
        currentEntry = {};
        descriptionLines = [];
        
        // Extract position and company from this line or previous line
        const prevLine = lines[i - 1] || '';
        currentEntry.position = prevLine;
        currentEntry.duration = line;
        
        // Look for company in next line
        if (i + 1 < lines.length) {
          currentEntry.company = lines[i + 1];
        }
      }
      
      // Collect description lines (bullet points)
      if (inExperienceSection && currentEntry.position && (line.startsWith('•') || line.startsWith('-') || line.startsWith('*'))) {
        descriptionLines.push(line.replace(/^[•\-\*]\s*/, ''));
      }
    }
    
    // Add last entry
    if (currentEntry.position && currentEntry.company) {
      experience.push({
        company: currentEntry.company,
        position: currentEntry.position,
        duration: currentEntry.duration || '',
        description: descriptionLines
      });
    }
    
    return experience;
  }

  private static extractSkills(text: string) {
    const skills = {
      technical: [] as string[],
      soft: [] as string[],
      tools: [] as string[],
      languages: [] as string[]
    };
    
    const textLower = text.toLowerCase();
    
    // Extract technical skills
    TECHNICAL_SKILLS.forEach(skill => {
      if (textLower.includes(skill.toLowerCase())) {
        skills.technical.push(skill);
      }
    });
    
    // Extract soft skills
    SOFT_SKILLS.forEach(skill => {
      if (textLower.includes(skill.toLowerCase())) {
        skills.soft.push(skill);
      }
    });
    
    // Extract tools
    TOOLS.forEach(tool => {
      if (textLower.includes(tool.toLowerCase())) {
        skills.tools.push(tool);
      }
    });
    
    // Extract languages (common programming and spoken languages)
    const languages = ['English', 'Hindi', 'Spanish', 'French', 'German', 'Chinese', 'Japanese', 'Korean'];
    languages.forEach(lang => {
      if (textLower.includes(lang.toLowerCase())) {
        skills.languages.push(lang);
      }
    });
    
    return skills;
  }

  private static extractProjects(lines: string[]) {
    const projects: Array<{name: string; description: string; technologies: string[]; duration?: string}> = [];
    const projectKeywords = ['Projects', 'Project Experience', 'Personal Projects', 'Academic Projects'];
    
    let inProjectsSection = false;
    let currentProject: Partial<typeof projects[0]> = {};
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lowerLine = line.toLowerCase();
      
      if (projectKeywords.some(keyword => lowerLine.includes(keyword.toLowerCase()))) {
        inProjectsSection = true;
        continue;
      }
      
      if (inProjectsSection && line.length > 10 && !line.startsWith('•') && !line.startsWith('-')) {
        // Save previous project if exists
        if (currentProject.name && currentProject.description) {
          projects.push({
            name: currentProject.name,
            description: currentProject.description,
            technologies: currentProject.technologies || [],
            duration: currentProject.duration
          });
        }
        
        // Start new project
        currentProject = {
          name: line,
          description: '',
          technologies: []
        };
        
        // Look for description and technologies in next few lines
        for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
          const nextLine = lines[j];
          if (nextLine.startsWith('•') || nextLine.startsWith('-')) {
            const cleanLine = nextLine.replace(/^[•\-\*]\s*/, '');
            if (!currentProject.description) {
              currentProject.description = cleanLine;
            } else {
              // Extract technologies from description
              const techs = TECHNICAL_SKILLS.filter(skill => 
                cleanLine.toLowerCase().includes(skill.toLowerCase())
              );
              currentProject.technologies = [...(currentProject.technologies || []), ...techs];
            }
          }
        }
      }
    }
    
    // Add last project
    if (currentProject.name && currentProject.description) {
      projects.push({
        name: currentProject.name,
        description: currentProject.description,
        technologies: currentProject.technologies || [],
        duration: currentProject.duration
      });
    }
    
    return projects;
  }

  private static extractCertifications(lines: string[]) {
    const certifications: Array<{name: string; issuer: string; date: string}> = [];
    const certKeywords = ['Certification', 'Certificate', 'Certified', 'AWS', 'Google', 'Microsoft', 'Oracle'];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lowerLine = line.toLowerCase();
      
      if (certKeywords.some(keyword => lowerLine.includes(keyword.toLowerCase()))) {
        const name = line;
        let issuer = '';
        let date = '';
        
        // Look for issuer and date in next lines
        for (let j = i + 1; j < Math.min(i + 3, lines.length); j++) {
          const nextLine = lines[j];
          if (nextLine.match(/\d{4}/)) {
            date = nextLine;
          } else if (!date && nextLine.length > 5) {
            issuer = nextLine;
          }
        }
        
        if (name) {
          certifications.push({ name, issuer, date });
        }
      }
    }
    
    return certifications;
  }

  private static calculateTotalExperience(experience: Array<{duration: string}>): number {
    let totalYears = 0;
    
    experience.forEach(exp => {
      const duration = exp.duration.toLowerCase();
      
      // Extract years from duration
      const yearMatch = duration.match(/(\d+)\s*year/);
      if (yearMatch) {
        totalYears += parseInt(yearMatch[1]);
      }
      
      // Extract months and convert to years
      const monthMatch = duration.match(/(\d+)\s*month/);
      if (monthMatch) {
        totalYears += parseInt(monthMatch[1]) / 12;
      }
    });
    
    return Math.round(totalYears * 10) / 10; // Round to 1 decimal place
  }

  private static generateSummary(personalInfo: any, experience: any[], skills: any, education: any[]) {
    const yearsExp = experience.length;
    const techSkills = skills.technical.length;
    const topSkills = skills.technical.slice(0, 3).join(', ');
    
    return `${personalInfo.name} is a ${education[0]?.degree || 'professional'} with ${yearsExp} years of experience. ` +
           `Proficient in ${topSkills} and ${techSkills} other technical skills. ` +
           `Has worked at ${experience.map(e => e.company).join(', ')} and completed ${education.length} educational programs.`;
  }

  private static calculateResumeScore(personalInfo: any, education: any[], experience: any[], skills: any, projects: any[], certifications: any[]): number {
    let score = 0;
    
    // Personal info (20 points)
    if (personalInfo.name) score += 5;
    if (personalInfo.email) score += 5;
    if (personalInfo.phone) score += 5;
    if (personalInfo.linkedin || personalInfo.github) score += 5;
    
    // Education (20 points)
    score += Math.min(education.length * 5, 20);
    
    // Experience (25 points)
    score += Math.min(experience.length * 8, 25);
    
    // Skills (20 points)
    score += Math.min(skills.technical.length * 2, 15);
    score += Math.min(skills.soft.length, 5);
    
    // Projects (10 points)
    score += Math.min(projects.length * 3, 10);
    
    // Certifications (5 points)
    score += Math.min(certifications.length * 2, 5);
    
    return Math.min(score, 100);
  }

  private static generateRecommendations(personalInfo: any, education: any[], experience: any[], skills: any, projects: any[], certifications: any[]): string[] {
    const recommendations: string[] = [];
    
    if (!personalInfo.linkedin) {
      recommendations.push('Add your LinkedIn profile to increase visibility');
    }
    
    if (!personalInfo.github && skills.technical.length > 0) {
      recommendations.push('Add your GitHub profile to showcase your coding projects');
    }
    
    if (skills.technical.length < 5) {
      recommendations.push('Consider adding more technical skills to your resume');
    }
    
    if (experience.length === 0) {
      recommendations.push('Add your work experience, even internships or freelance projects');
    }
    
    if (projects.length < 2) {
      recommendations.push('Include more projects to demonstrate your practical skills');
    }
    
    if (certifications.length === 0) {
      recommendations.push('Consider obtaining relevant certifications to boost your profile');
    }
    
    if (education.length === 0) {
      recommendations.push('Add your educational background');
    }
    
    return recommendations;
  }
}
