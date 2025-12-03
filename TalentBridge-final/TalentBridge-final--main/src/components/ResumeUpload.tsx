import { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, CheckCircle, AlertCircle, X, Download } from 'lucide-react';
import { ResumeParser, ParsedResume } from '@/lib/resumeParser';
import { toast } from 'sonner';

interface ResumeUploadProps {
  onResumeParsed?: (resume: ParsedResume) => void;
  maxFileSize?: number; // in MB
}

export const ResumeUpload = ({ onResumeParsed, maxFileSize = 5 }: ResumeUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [parsedResume, setParsedResume] = useState<ParsedResume | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, []);

  const handleFileUpload = async (file: File) => {
    setError(null);
    
    // Validate file type
    const validTypes = ['.txt', '.pdf', '.doc', '.docx'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!validTypes.includes(fileExtension)) {
      setError('Please upload a valid resume file (TXT, PDF, DOC, or DOCX)');
      toast.error('Invalid file type');
      return;
    }
    
    // Validate file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxFileSize) {
      setError(`File size must be less than ${maxFileSize}MB`);
      toast.error(`File too large. Maximum size is ${maxFileSize}MB`);
      return;
    }
    
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);
      
      // Parse the resume
      const parsed = await ResumeParser.parseResume(file);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      setTimeout(() => {
        setParsedResume(parsed);
        setIsUploading(false);
        onResumeParsed?.(parsed);
        toast.success('Resume parsed successfully!');
      }, 500);
      
    } catch (err) {
      setIsUploading(false);
      setError('Failed to parse resume. Please try again.');
      toast.error('Resume parsing failed');
      console.error('Resume parsing error:', err);
    }
  };

  const clearResume = () => {
    setParsedResume(null);
    setError(null);
    setUploadProgress(0);
  };

  const downloadResumeReport = () => {
    if (!parsedResume) return;
    
    const report = `
Resume Analysis Report
=====================

Personal Information:
- Name: ${parsedResume.personalInfo.name}
- Email: ${parsedResume.personalInfo.email}
- Phone: ${parsedResume.personalInfo.phone}
- Location: ${parsedResume.personalInfo.location || 'Not specified'}

Education:
${parsedResume.education.map(edu => `- ${edu.degree} from ${edu.institution} (${edu.year})`).join('\n')}

Experience:
${parsedResume.experience.map(exp => `- ${exp.position} at ${exp.company} (${exp.duration})`).join('\n')}

Technical Skills: ${parsedResume.skills.technical.join(', ')}
Soft Skills: ${parsedResume.skills.soft.join(', ')}
Tools: ${parsedResume.skills.tools.join(', ')}

Projects:
${parsedResume.projects.map(proj => `- ${proj.name}: ${proj.description}`).join('\n')}

Certifications:
${parsedResume.certifications.map(cert => `- ${cert.name} from ${cert.issuer}`).join('\n')}

Summary:
${parsedResume.summary}

Resume Score: ${parsedResume.score}/100

Recommendations:
${parsedResume.recommendations.map(rec => `- ${rec}`).join('\n')}
    `.trim();
    
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'resume-analysis-report.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Resume report downloaded');
  };

  if (parsedResume) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-500" />
            <h3 className="text-xl font-semibold">Resume Analysis Complete</h3>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={downloadResumeReport}>
              <Download className="w-4 h-4 mr-2" />
              Download Report
            </Button>
            <Button variant="ghost" size="sm" onClick={clearResume}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <div className="space-y-6">
          {/* Resume Score */}
          <div className="text-center p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl">
            <div className="text-3xl font-bold text-primary mb-2">{parsedResume.score}/100</div>
            <div className="text-sm text-muted-foreground">Resume Score</div>
            <Progress value={parsedResume.score} className="mt-2" />
          </div>
          
          {/* Personal Info */}
          <div>
            <h4 className="font-semibold mb-3">Personal Information</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Name:</span>
                <span className="ml-2 font-medium">{parsedResume.personalInfo.name}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Email:</span>
                <span className="ml-2 font-medium">{parsedResume.personalInfo.email}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Phone:</span>
                <span className="ml-2 font-medium">{parsedResume.personalInfo.phone}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Experience:</span>
                <span className="ml-2 font-medium">{parsedResume.totalExperience} years</span>
              </div>
            </div>
          </div>
          
          {/* Skills */}
          <div>
            <h4 className="font-semibold mb-3">Skills</h4>
            <div className="space-y-2">
              {parsedResume.skills.technical.length > 0 && (
                <div>
                  <span className="text-sm text-muted-foreground">Technical:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {parsedResume.skills.technical.map((skill, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {parsedResume.skills.soft.length > 0 && (
                <div>
                  <span className="text-sm text-muted-foreground">Soft Skills:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {parsedResume.skills.soft.map((skill, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Experience */}
          {parsedResume.experience.length > 0 && (
            <div>
              <h4 className="font-semibold mb-3">Experience</h4>
              <div className="space-y-2">
                {parsedResume.experience.slice(0, 3).map((exp, idx) => (
                  <div key={idx} className="text-sm border-l-2 border-primary/20 pl-3">
                    <div className="font-medium">{exp.position}</div>
                    <div className="text-muted-foreground">{exp.company} • {exp.duration}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Education */}
          {parsedResume.education.length > 0 && (
            <div>
              <h4 className="font-semibold mb-3">Education</h4>
              <div className="space-y-2">
                {parsedResume.education.map((edu, idx) => (
                  <div key={idx} className="text-sm">
                    <div className="font-medium">{edu.degree}</div>
                    <div className="text-muted-foreground">{edu.institution} • {edu.year}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Recommendations */}
          {parsedResume.recommendations.length > 0 && (
            <div>
              <h4 className="font-semibold mb-3">Recommendations</h4>
              <div className="space-y-2">
                {parsedResume.recommendations.map((rec, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm">
                    <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold mb-2">Upload Your Resume</h3>
        <p className="text-sm text-muted-foreground">
          Get instant AI-powered analysis of your resume
        </p>
      </div>
      
      {/* Upload Area */}
      <div
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center transition-all
          ${isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
          ${isUploading ? 'pointer-events-none opacity-50' : 'hover:border-primary hover:bg-primary/5'}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept=".txt,.pdf,.doc,.docx"
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isUploading}
        />
        
        <div className="space-y-4">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            {isUploading ? (
              <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
            ) : (
              <Upload className="w-6 h-6 text-primary" />
            )}
          </div>
          
          <div>
            <p className="font-medium">
              {isUploading ? 'Analyzing your resume...' : 'Drop your resume here or click to browse'}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Supports TXT, PDF, DOC, DOCX (Max {maxFileSize}MB)
            </p>
          </div>
          
          {isUploading && (
            <div className="space-y-2">
              <Progress value={uploadProgress} className="w-full" />
              <p className="text-xs text-muted-foreground">{uploadProgress}% complete</p>
            </div>
          )}
        </div>
      </div>
      
      {error && (
        <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        </div>
      )}
      
      {/* Sample Resume Info */}
      <div className="mt-6 p-4 bg-muted/30 rounded-lg">
        <div className="flex items-start gap-3">
          <FileText className="w-5 h-5 text-muted-foreground mt-0.5" />
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-1">What we analyze:</p>
            <ul className="space-y-1">
              <li>• Personal information and contact details</li>
              <li>• Educational background and qualifications</li>
              <li>• Work experience and duration</li>
              <li>• Technical skills, tools, and technologies</li>
              <li>• Projects and certifications</li>
              <li>• Overall resume score and improvement suggestions</li>
            </ul>
          </div>
        </div>
      </div>
    </Card>
  );
};
