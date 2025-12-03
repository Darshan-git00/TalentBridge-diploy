import { useState, useEffect, useRef } from "react";
import StudentLayout from "@/components/layouts/StudentLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  Brain, 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  MessageSquare, 
  Send, 
  RotateCcw,
  Clock,
  CheckCircle,
  AlertCircle,
  Play,
  Pause,
  Square
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSubmitAIInterview } from "@/hooks";

interface Message {
  id: string;
  type: "user" | "ai" | "system";
  content: string;
  timestamp: Date;
}

interface Question {
  id: string;
  question: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  timeLimit: number; // in seconds
}

const AIInterview = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const submitAIInterview = useSubmitAIInterview();
  
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  const [isInterviewPaused, setIsInterviewPaused] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(300); // 5 minutes
  const [overallProgress, setOverallProgress] = useState(0);
  const [interviewScore, setInterviewScore] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Mock interview questions
  const questions: Question[] = [
    {
      id: "1",
      question: "Tell me about yourself and your background.",
      category: "Introduction",
      difficulty: "easy",
      timeLimit: 120
    },
    {
      id: "2", 
      question: "What are your key strengths and how do they apply to this role?",
      category: "Skills Assessment",
      difficulty: "medium",
      timeLimit: 90
    },
    {
      id: "3",
      question: "Describe a challenging project you worked on and how you overcame obstacles.",
      category: "Problem Solving",
      difficulty: "hard", 
      timeLimit: 150
    },
    {
      id: "4",
      question: "Where do you see yourself in 5 years?",
      category: "Career Goals",
      difficulty: "medium",
      timeLimit: 60
    },
    {
      id: "5",
      question: "Do you have any questions for us?",
      category: "Closing",
      difficulty: "easy",
      timeLimit: 60
    }
  ];

  const currentQuestion = questions[currentQuestionIndex];

  useEffect(() => {
    if (isInterviewStarted && !isInterviewPaused && timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0) {
      endInterview();
    }
  }, [isInterviewStarted, isInterviewPaused, timeRemaining]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const startInterview = () => {
    setIsInterviewStarted(true);
    setOverallProgress(0);
    setCurrentQuestionIndex(0);
    setTimeRemaining(300);
    setMessages([
      {
        id: "welcome",
        type: "ai",
        content: "Hello! I'm your AI interviewer. I'll be asking you 5 questions to assess your skills and fit for the role. Take your time to answer each question thoughtfully. Are you ready to begin?",
        timestamp: new Date()
      }
    ]);
  };

  const endInterview = () => {
    setIsInterviewStarted(false);
    setIsInterviewPaused(false);
    const finalScore = Math.floor(Math.random() * 30) + 70; // Mock score between 70-100
    setInterviewScore(finalScore);
    
    // Save interview result to student profile
    const interviewResult = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      duration: Math.floor((300 - timeRemaining) / 60), // Duration in minutes
      type: "General Technical Interview",
      overallScore: finalScore,
      verified: true, // AI interviews are automatically verified
      scores: {
        communication: Math.floor(Math.random() * 20) + 75, // 75-95
        problemSolving: Math.floor(Math.random() * 25) + 70, // 70-95
        technical: Math.floor(Math.random() * 30) + 65, // 65-95
      },
      feedback: {
        strengths: [
          "Clear communication skills",
          "Good technical foundation", 
          "Well-structured responses",
          "Strong problem-solving approach"
        ].slice(0, Math.floor(Math.random() * 3) + 2), // Random 2-4 strengths
        improvements: [
          "Provide more specific examples",
          "Elaborate on technical concepts",
          "Practice behavioral questions",
          "Add more detail to problem-solving explanations"
        ].slice(0, Math.floor(Math.random() * 2) + 1), // Random 1-2 improvements
      }
    };
    
    // For now, store the interview result locally since this is a mock interview
    // In a real implementation, you would have an interviewId from starting an AI interview
    console.log('AI interview completed:', interviewResult);
    
    // TODO: When implementing real AI interviews, use:
    // submitAIInterview.mutate({ 
    //   interviewId: 'real-interview-id', 
    //   responses: interviewResult 
    // }, {
    //   onSuccess: () => {
    //     console.log('AI interview result submitted successfully');
    //   },
    //   onError: (error) => {
    //     console.error('Failed to submit AI interview result:', error);
    //   }
    // });
    
    setMessages([
      ...messages,
      {
        id: "end",
        type: "ai",
        content: "Thank you for completing the interview! Your responses have been analyzed. You can view your results and feedback below.",
        timestamp: new Date()
      }
    ]);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setOverallProgress(((currentQuestionIndex + 1) / questions.length) * 100);
      setMessages([
        ...messages,
        {
          id: `question-${currentQuestionIndex + 1}`,
          type: "ai",
          content: currentQuestion.question,
          timestamp: new Date()
        }
      ]);
    } else {
      endInterview();
    }
  };

  const sendMessage = () => {
    if (userInput.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        type: "user",
        content: userInput,
        timestamp: new Date()
      };
      
      setMessages([...messages, newMessage]);
      setUserInput("");

      // Simulate AI response
      setTimeout(() => {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          type: "ai",
          content: "Thank you for your response. Let me analyze that and move to the next question.",
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiResponse]);
        
        setTimeout(() => {
          nextQuestion();
        }, 2000);
      }, 1500);
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  const toggleVideo = () => {
    setIsVideoEnabled(!isVideoEnabled);
  };

  const toggleAudio = () => {
    setIsAudioEnabled(!isAudioEnabled);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "bg-green-100 text-green-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "hard": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <StudentLayout>
      <div className="container mx-auto px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-3">AI Interview Practice</h1>
          <p className="text-lg text-muted-foreground font-medium">
            Practice your interview skills with our AI interviewer
          </p>
        </div>

        {!isInterviewStarted && interviewScore === null && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid lg:grid-cols-3 gap-8"
          >
            {/* Interview Setup Card */}
            <Card className="lg:col-span-2 p-8 rounded-2xl shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <Brain className="w-8 h-8 text-primary" />
                <h2 className="text-2xl font-bold">Interview Setup</h2>
              </div>
              
              <div className="space-y-6 mb-8">
                <div>
                  <h3 className="font-semibold mb-3">What to Expect</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      5 comprehensive interview questions
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      AI-powered analysis of your responses
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Real-time feedback and scoring
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      30-minute interview session
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Technical Requirements</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-yellow-500" />
                      Working microphone for voice responses
                    </li>
                    <li className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-yellow-500" />
                      Webcam (optional, for video interviews)
                    </li>
                    <li className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-yellow-500" />
                      Quiet environment for best results
                    </li>
                  </ul>
                </div>
              </div>

              <Button 
                onClick={startInterview}
                variant="glowPrimary" 
                size="lg"
                className="w-full rounded-xl font-semibold"
              >
                <Play className="w-5 h-5 mr-2" />
                Start Interview
              </Button>
            </Card>

            {/* Tips Card */}
            <Card className="p-8 rounded-2xl shadow-xl">
              <h3 className="text-xl font-bold mb-4">Pro Tips</h3>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-xl">
                  <h4 className="font-semibold text-blue-900 mb-2">Be Authentic</h4>
                  <p className="text-sm text-blue-700">
                    Answer honestly and be yourself. Authentic responses are easier to analyze.
                  </p>
                </div>
                <div className="p-4 bg-green-50 rounded-xl">
                  <h4 className="font-semibold text-green-900 mb-2">STAR Method</h4>
                  <p className="text-sm text-green-700">
                    Use Situation, Task, Action, Result structure for behavioral questions.
                  </p>
                </div>
                <div className="p-4 bg-purple-50 rounded-xl">
                  <h4 className="font-semibold text-purple-900 mb-2">Practice First</h4>
                  <p className="text-sm text-purple-700">
                    Test your microphone and camera before starting the interview.
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Interview Interface */}
        {isInterviewStarted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid lg:grid-cols-3 gap-8"
          >
            {/* Main Interview Area */}
            <div className="lg:col-span-2 space-y-6">
              {/* Video/Interview Area */}
              <Card className="p-6 rounded-2xl shadow-xl">
                <div className="aspect-video bg-gray-900 rounded-xl mb-4 flex items-center justify-center overflow-hidden">
                  {isVideoEnabled ? (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                      <Video className="w-16 h-16 text-primary/50" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <p className="text-white/70 text-lg">Camera Feed</p>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                      <VideoOff className="w-16 h-16 text-gray-600" />
                    </div>
                  )}
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-4">
                  <Button
                    variant={isRecording ? "destructive" : "outline"}
                    size="lg"
                    onClick={toggleRecording}
                    className="rounded-full"
                  >
                    {isRecording ? <Square className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </Button>
                  <Button
                    variant={isAudioEnabled ? "outline" : "destructive"}
                    size="lg"
                    onClick={toggleAudio}
                    className="rounded-full"
                  >
                    {isAudioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                  </Button>
                  <Button
                    variant={isVideoEnabled ? "outline" : "destructive"}
                    size="lg"
                    onClick={toggleVideo}
                    className="rounded-full"
                  >
                    {isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setIsInterviewPaused(!isInterviewPaused)}
                    className="rounded-full"
                  >
                    {isInterviewPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                  </Button>
                </div>
              </Card>

              {/* Chat Interface */}
              <Card className="p-6 rounded-2xl shadow-xl">
                <div className="flex items-center gap-2 mb-4">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold">Interview Conversation</h3>
                </div>

                <div className="h-80 overflow-y-auto mb-4 space-y-4 p-4 bg-gray-50 rounded-xl">
                  <AnimatePresence>
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-3 rounded-xl ${
                            message.type === "user"
                              ? "bg-primary text-primary-foreground"
                              : message.type === "ai"
                              ? "bg-secondary text-secondary-foreground"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {message.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                    placeholder="Type your response..."
                    className="flex-1 px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                    disabled={!isInterviewStarted || isInterviewPaused}
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={!userInput.trim() || !isInterviewStarted || isInterviewPaused}
                    className="rounded-xl"
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                </div>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Progress Card */}
              <Card className="p-6 rounded-2xl shadow-xl">
                <h3 className="text-lg font-semibold mb-4">Interview Progress</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Overall Progress</span>
                      <span>{Math.round(overallProgress)}%</span>
                    </div>
                    <Progress value={overallProgress} className="h-2" />
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>Time Remaining: {formatTime(timeRemaining)}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Question:</span>
                    <span className="ml-2 font-semibold">
                      {currentQuestionIndex + 1} of {questions.length}
                    </span>
                  </div>
                </div>
              </Card>

              {/* Current Question Card */}
              <Card className="p-6 rounded-2xl shadow-xl">
                <h3 className="text-lg font-semibold mb-4">Current Question</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge className={getDifficultyColor(currentQuestion.difficulty)}>
                      {currentQuestion.difficulty}
                    </Badge>
                    <Badge variant="outline">{currentQuestion.category}</Badge>
                  </div>
                  <p className="text-sm leading-relaxed">
                    {currentQuestion.question}
                  </p>
                  <div className="text-xs text-muted-foreground">
                    Time limit: {currentQuestion.timeLimit / 60} minutes
                  </div>
                </div>
              </Card>

              {/* End Interview Button */}
              <Button
                onClick={endInterview}
                variant="outline"
                className="w-full rounded-xl"
              >
                End Interview Early
              </Button>
            </div>
          </motion.div>
        )}

        {/* Results Screen */}
        {interviewScore !== null && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            <Card className="p-8 rounded-2xl shadow-xl text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              
              <h2 className="text-3xl font-bold mb-4">Interview Completed!</h2>
              
              <div className="mb-8">
                <div className="text-6xl font-bold text-primary mb-2">{interviewScore}%</div>
                <p className="text-lg text-muted-foreground">Overall Score</p>
              </div>

              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="p-4 bg-blue-50 rounded-xl">
                  <h4 className="font-semibold text-blue-900 mb-2">Communication</h4>
                  <p className="text-2xl font-bold text-blue-600 mb-1">85%</p>
                  <p className="text-sm text-blue-700">Clear and articulate responses</p>
                </div>
                <div className="p-4 bg-green-50 rounded-xl">
                  <h4 className="font-semibold text-green-900 mb-2">Problem Solving</h4>
                  <p className="text-2xl font-bold text-green-600 mb-1">78%</p>
                  <p className="text-sm text-green-700">Good analytical thinking</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-xl">
                  <h4 className="font-semibold text-purple-900 mb-2">Technical Skills</h4>
                  <p className="text-2xl font-bold text-purple-600 mb-1">92%</p>
                  <p className="text-sm text-purple-700">Strong technical knowledge</p>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4">Feedback & Recommendations</h3>
                <div className="text-left space-y-3 max-w-2xl mx-auto">
                  <div className="p-4 bg-green-50 rounded-xl">
                    <h4 className="font-semibold text-green-900 mb-1">Strengths</h4>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• Excellent communication skills</li>
                      <li>• Strong technical foundation</li>
                      <li>• Well-structured responses</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-yellow-50 rounded-xl">
                    <h4 className="font-semibold text-yellow-900 mb-1">Areas for Improvement</h4>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      <li>• Provide more specific examples</li>
                      <li>• Elaborate on problem-solving approach</li>
                      <li>• Practice behavioral questions</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                <Button
                  onClick={() => navigate("/student/profile")}
                  variant="outline"
                  className="rounded-xl"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  View in Profile
                </Button>
                <Button
                  onClick={() => window.print()}
                  variant="glowPrimary"
                  className="rounded-xl"
                >
                  Download Report
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </StudentLayout>
  );
};

export default AIInterview;
