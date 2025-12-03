import CollegeLayout from "@/components/layouts/CollegeLayout";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Search, Brain, Award, Code, Eye, Filter, TrendingUp, Star, Target, Zap, Calendar, MapPin } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { collegesService } from "@/services/collegesService";
import { Student } from "@/services/types";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Checkbox 
} from "@/components/ui/checkbox";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";

const StudentsList = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // AI Filtering States
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [aiSortMode, setAiSortMode] = useState("ai_score");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [minAiScore, setMinAiScore] = useState(0);
  const [minSkillMatch, setMinSkillMatch] = useState(0);
  const [showAIPoweredOnly, setShowAIPoweredOnly] = useState(false);
  
  // Student Details Dialog State
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showStudentDetails, setShowStudentDetails] = useState(false);

  // Helper function to safely parse skills from JSON string
  const parseSkills = (skills: any): string[] => {
    if (Array.isArray(skills)) return skills;
    if (typeof skills === 'string') {
      try {
        return JSON.parse(skills);
      } catch {
        return [];
      }
    }
    return [];
  };

  // Helper function to safely parse certifications from JSON string
  const parseCertifications = (certifications: any): any[] => {
    if (Array.isArray(certifications)) return certifications;
    if (typeof certifications === 'string') {
      try {
        return JSON.parse(certifications);
      } catch {
        return [];
      }
    }
    return [];
  };

  // Get all unique skills from students
  const getAllSkills = (): string[] => {
    const allSkills = students.flatMap(student => parseSkills(student.skills));
    return [...new Set(allSkills)].sort();
  };

  // AI-powered filtering and sorting
  const getFilteredAndSortedStudents = () => {
    let filtered = students.filter(student =>
      student.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.branch?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.course?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Apply skill filtering
    if (selectedSkills.length > 0) {
      filtered = filtered.filter(student => {
        const studentSkills = parseSkills(student.skills);
        return selectedSkills.some(skill => studentSkills.includes(skill));
      });
    }

    // Apply AI score filtering
    if (minAiScore > 0) {
      filtered = filtered.filter(student => (student as any).aiScore >= minAiScore);
    }

    // Apply skill match filtering
    if (minSkillMatch > 0) {
      filtered = filtered.filter(student => (student as any).skillMatch >= minSkillMatch);
    }

    // Show only AI-powered students
    if (showAIPoweredOnly) {
      filtered = filtered.filter(student => (student as any).aiScore > 0);
    }

    // AI-powered sorting
    return filtered.sort((a, b) => {
      switch (aiSortMode) {
        case "ai_score":
          return ((b as any).aiScore || 0) - ((a as any).aiScore || 0);
        case "skill_match":
          return ((b as any).skillMatch || 0) - ((a as any).skillMatch || 0);
        case "certifications":
          return parseCertifications(b.certifications).length - parseCertifications(a.certifications).length;
        case "cgpa":
          return (b.cgpa || 0) - (a.cgpa || 0);
        case "hybrid":
          // AI-powered hybrid scoring
          const scoreA = ((a as any).aiScore || 0) * 0.4 + ((a as any).skillMatch || 0) * 0.3 + (a.cgpa || 0) * 10 * 0.3;
          const scoreB = ((b as any).aiScore || 0) * 0.4 + ((b as any).skillMatch || 0) * 0.3 + (b.cgpa || 0) * 10 * 0.3;
          return scoreB - scoreA;
        default:
          return 0;
      }
    });
  };

  // Fetch real students data
  useEffect(() => {
    const fetchStudents = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        const response = await collegesService.getStudents(user.id, {
          search: searchQuery,
          page: 1,
          limit: 50
        });
        
        // The service returns { students, pagination } directly
        if (response && response.students) {
          setStudents(response.students);
        } else {
          setError('Failed to fetch students');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch students');
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [user?.id, searchQuery]);

  const filteredStudents = getFilteredAndSortedStudents();

  const handleViewStudentDetails = (student: Student) => {
    setSelectedStudent(student);
    setShowStudentDetails(true);
  };

  return (
    <CollegeLayout>
      <div className="container mx-auto px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-3">Student Intelligence & Filtering</h1>
          <p className="text-lg text-muted-foreground font-medium">Filter and evaluate students by skills, certifications, and AI interview results</p>
          
          {/* AI Insights Summary */}
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
              <div className="flex items-center gap-2 mb-1">
                <Brain className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">AI-Powered</span>
              </div>
              <p className="text-2xl font-bold text-primary">
                {students.filter(s => (s as any).aiScore > 0).length}
              </p>
              <p className="text-xs text-muted-foreground">Students with AI scores</p>
            </div>
            
            <div className="bg-success/10 p-4 rounded-lg border border-success/20">
              <div className="flex items-center gap-2 mb-1">
                <Target className="w-4 h-4 text-success" />
                <span className="text-sm font-medium">High Match</span>
              </div>
              <p className="text-2xl font-bold text-success">
                {students.filter(s => (s as any).skillMatch >= 80).length}
              </p>
              <p className="text-xs text-muted-foreground">80%+ skill match</p>
            </div>
            
            <div className="bg-warning/10 p-4 rounded-lg border border-warning/20">
              <div className="flex items-center gap-2 mb-1">
                <Award className="w-4 h-4 text-warning" />
                <span className="text-sm font-medium">Certified</span>
              </div>
              <p className="text-2xl font-bold text-warning">
                {students.filter(s => parseCertifications(s.certifications).length > 0).length}
              </p>
              <p className="text-xs text-muted-foreground">With certifications</p>
            </div>
            
            <div className="bg-secondary/10 p-4 rounded-lg border border-secondary/20">
              <div className="flex items-center gap-2 mb-1">
                <Star className="w-4 h-4 text-secondary" />
                <span className="text-sm font-medium">Top Performers</span>
              </div>
              <p className="text-2xl font-bold text-secondary">
                {students.filter(s => (s.cgpa || 0) >= 8.0).length}
              </p>
              <p className="text-xs text-muted-foreground">8.0+ CGPA</p>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <Card className="p-6 mb-6 rounded-2xl bg-card/70 dark:bg-card backdrop-blur shadow-xl">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search students by name, branch, or course..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                variant={showAdvancedFilters ? "default" : "outline"}
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                AI Filters
                {showAdvancedFilters && <Zap className="w-4 h-4" />}
              </Button>
              
              <Select value={aiSortMode} onValueChange={setAiSortMode}>
                <SelectTrigger className="w-48">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    <SelectValue placeholder="AI Sort" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ai_score">
                    <div className="flex items-center gap-2">
                      <Brain className="w-4 h-4" />
                      AI Score
                    </div>
                  </SelectItem>
                  <SelectItem value="skill_match">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Skill Match
                    </div>
                  </SelectItem>
                  <SelectItem value="certifications">
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4" />
                      Certifications
                    </div>
                  </SelectItem>
                  <SelectItem value="cgpa">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4" />
                      CGPA
                    </div>
                  </SelectItem>
                  <SelectItem value="hybrid">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      AI Hybrid Score
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Advanced AI Filters */}
          {showAdvancedFilters && (
            <div className="mt-6 p-4 border rounded-lg bg-muted/50 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Skills Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Required Skills</label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {getAllSkills().slice(0, 10).map(skill => (
                      <div key={skill} className="flex items-center space-x-2">
                        <Checkbox
                          id={`skill-${skill}`}
                          checked={selectedSkills.includes(skill)}
                          onCheckedChange={(checked) => {
                            if (checked === true) {
                              setSelectedSkills([...selectedSkills, skill]);
                            } else {
                              setSelectedSkills(selectedSkills.filter(s => s !== skill));
                            }
                          }}
                        />
                        <label htmlFor={`skill-${skill}`} className="text-sm">
                          {skill}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Score Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Min AI Score: {minAiScore}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={minAiScore}
                    onChange={(e) => setMinAiScore(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                {/* Skill Match Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Min Skill Match: {minSkillMatch}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={minSkillMatch}
                    onChange={(e) => setMinSkillMatch(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-4 pt-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="ai-powered-only"
                    checked={showAIPoweredOnly}
                    onCheckedChange={(checked) => {
                      setShowAIPoweredOnly(checked === true);
                    }}
                  />
                  <label htmlFor="ai-powered-only" className="text-sm font-medium">
                    Show AI-powered students only
                  </label>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedSkills([]);
                    setMinAiScore(0);
                    setMinSkillMatch(0);
                    setShowAIPoweredOnly(false);
                  }}
                >
                  Clear Filters
                </Button>
              </div>

              {/* AI Insights */}
              <div className="pt-2 border-t">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Brain className="w-4 h-4" />
                  <span>AI Insights: {filteredStudents.length} students match your criteria</span>
                  {aiSortMode === "hybrid" && (
                    <span className="text-primary font-medium">
                      • Ranked by AI Hybrid Score
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Students Grid */}
        <div className="grid gap-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading students...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No students found matching your search.</p>
            </div>
          ) : (
            filteredStudents.map((student, index) => (
              <Card key={student.id} className="p-6 rounded-xl hover:shadow-xl transition-all relative overflow-hidden">
                {/* AI Ranking Badge */}
                {aiSortMode !== "default" && (
                  <div className="absolute top-2 right-2 z-10">
                    <div className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-medium">
                      <Zap className="w-3 h-3" />
                      #{index + 1}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <Avatar className="w-14 h-14">
                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${student.name}`} />
                      <AvatarFallback>{student.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-bold text-lg">{student.name}</h3>
                        <Badge variant="outline" className="bg-green-100 text-green-800">
                          {student.status || 'Available'}
                        </Badge>
                        <span className="text-sm text-muted-foreground">{student.branch} • {student.year}</span>
                        
                        {/* AI-powered indicator */}
                        {(student as any).aiScore > 0 && (
                          <div className="flex items-center gap-1 text-xs text-primary">
                            <Brain className="w-3 h-3" />
                            <span>AI</span>
                          </div>
                        )}
                      </div>

                      <div className="mb-3">
                        <p className="text-sm text-muted-foreground mb-1">{student.course}</p>
                        <p className="text-sm font-medium">CGPA: {student.cgpa}</p>
                      </div>

                      <div className="mb-3">
                        <p className="text-sm text-muted-foreground mb-2">Skills:</p>
                        <div className="flex flex-wrap gap-1">
                          {parseSkills(student.skills).slice(0, 5).map((skill, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">{skill}</Badge>
                          ))}
                          {parseSkills(student.skills).length > 5 && (
                            <Badge variant="outline" className="text-xs">+{parseSkills(student.skills).length - 5} more</Badge>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Brain className="w-3 h-3" />
                            AI Score
                          </div>
                          <div className="flex items-center gap-2">
                            <Progress value={(student as any).aiScore || 85} className="h-2 flex-1" />
                            <span className="text-sm font-bold text-primary">{(student as any).aiScore || 85}%</span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Code className="w-3 h-3" />
                            Skill Match
                          </div>
                          <div className="flex items-center gap-2">
                            <Progress value={(student as any).skillMatch || 90} className="h-2 flex-1" />
                            <span className="text-sm font-bold text-secondary">{(student as any).skillMatch || 90}%</span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Award className="w-3 h-3" />
                            Certifications
                          </div>
                          <div className="flex items-center gap-2">
                            <Progress value={(parseCertifications(student.certifications).length || 3) * 20} className="h-2 flex-1" />
                            <span className="text-sm font-bold text-warning">{parseCertifications(student.certifications).length || 3}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2 ml-4">
                    <Button 
                      className="flex items-center gap-2"
                      onClick={() => handleViewStudentDetails(student)}
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </Button>
                    
                    {/* AI Recommendation */}
                    {aiSortMode === "hybrid" && index < 3 && (
                      <div className="text-center">
                        <div className="flex items-center gap-1 text-xs text-primary font-medium">
                          <Star className="w-3 h-3 fill-current" />
                          Top Match
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Student Details Dialog */}
      <Dialog open={showStudentDetails} onOpenChange={setShowStudentDetails}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedStudent && (
            <>
              <DialogHeader>
                <div className="flex items-start gap-4 mb-4">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedStudent.name}`} />
                    <AvatarFallback className="text-lg">
                      {selectedStudent.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <DialogTitle className="text-2xl mb-2">{selectedStudent.name}</DialogTitle>
                    <DialogDescription className="text-base flex items-center gap-2">
                      <span>{selectedStudent.branch} • {selectedStudent.year}</span>
                      <span>•</span>
                      <span>{selectedStudent.course}</span>
                    </DialogDescription>
                    
                    {/* AI-Powered Badge */}
                    {(selectedStudent as any).aiScore && (selectedStudent as any).aiScore > 0 && (
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-medium">
                          <Brain className="w-3 h-3" />
                          AI-Powered
                        </div>
                        <Badge variant="outline" className="bg-green-100 text-green-800">
                          {selectedStudent.status || 'Available'}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* Academic Performance */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg bg-muted">
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="w-4 h-4 text-primary" />
                      <p className="text-sm font-semibold">CGPA</p>
                    </div>
                    <p className="text-2xl font-bold text-primary">{selectedStudent.cgpa}</p>
                    <p className="text-xs text-muted-foreground">Academic Performance</p>
                  </div>

                  <div className="p-4 rounded-lg bg-muted">
                    <div className="flex items-center gap-2 mb-2">
                      <Brain className="w-4 h-4 text-success" />
                      <p className="text-sm font-semibold">AI Score</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={(selectedStudent as any).aiScore || 85} className="h-2 flex-1" />
                      <span className="text-lg font-bold text-success">{(selectedStudent as any).aiScore || 85}%</span>
                    </div>
                    <p className="text-xs text-muted-foreground">AI Interview Assessment</p>
                  </div>

                  <div className="p-4 rounded-lg bg-muted">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-4 h-4 text-warning" />
                      <p className="text-sm font-semibold">Skill Match</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={(selectedStudent as any).skillMatch || 90} className="h-2 flex-1" />
                      <span className="text-lg font-bold text-warning">{(selectedStudent as any).skillMatch || 90}%</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Job Requirements Match</p>
                  </div>
                </div>

                {/* Skills Section */}
                <div className="p-4 rounded-lg border border-border">
                  <div className="flex items-center gap-2 mb-3">
                    <Code className="w-4 h-4 text-primary" />
                    <p className="text-sm font-semibold">Technical Skills</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {parseSkills(selectedStudent.skills).length > 0 ? (
                      parseSkills(selectedStudent.skills).map((skill, idx) => (
                        <Badge key={idx} variant="secondary" className="text-sm px-3 py-1">
                          {skill}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No skills listed</p>
                    )}
                  </div>
                </div>

                {/* Certifications Section */}
                <div className="p-4 rounded-lg border border-border">
                  <div className="flex items-center gap-2 mb-3">
                    <Award className="w-4 h-4 text-warning" />
                    <p className="text-sm font-semibold">Certifications</p>
                    <Badge variant="outline" className="text-xs">
                      {parseCertifications(selectedStudent.certifications).length} total
                    </Badge>
                  </div>
                  {parseCertifications(selectedStudent.certifications).length > 0 ? (
                    <div className="space-y-2">
                      {parseCertifications(selectedStudent.certifications).map((cert, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-sm p-2 bg-muted/50 rounded">
                          <span className="text-primary mt-1">•</span>
                          <span>{cert}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No certifications listed</p>
                  )}
                </div>

                {/* Additional Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg border border-border">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <p className="text-sm font-semibold">Contact Information</p>
                    </div>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-medium">Email:</span> {selectedStudent.email || 'Not provided'}</p>
                      <p><span className="font-medium">Phone:</span> {selectedStudent.phone || 'Not provided'}</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg border border-border">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <p className="text-sm font-semibold">College</p>
                    </div>
                    <p className="text-sm">{selectedStudent.collegeName || 'Not provided'}</p>
                  </div>
                </div>

                {/* AI Insights */}
                {(selectedStudent as any).aiScore && (selectedStudent as any).aiScore > 0 && (
                  <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                    <div className="flex items-center gap-2 mb-3">
                      <Brain className="w-4 h-4 text-primary" />
                      <p className="text-sm font-semibold">AI Insights</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium mb-1">Interview Performance:</p>
                        <p>Student scored {(selectedStudent as any).aiScore}% in AI-powered interview assessment, demonstrating strong communication and problem-solving skills.</p>
                      </div>
                      <div>
                        <p className="font-medium mb-1">Skill Match Analysis:</p>
                        <p>Student's skills match {(selectedStudent as any).skillMatch || 90}% with current job requirements, making them a strong candidate for technical roles.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </CollegeLayout>
  );
};

export default StudentsList;
