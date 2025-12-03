import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Users, Video, Building, AlertCircle, CheckCircle } from 'lucide-react';
import { CalendarIntegration, InterviewSlot, ScheduledInterview } from '@/lib/calendarIntegration';
import { toast } from 'sonner';
import { format, addDays, isWeekend, isToday, isTomorrow } from 'date-fns';

interface InterviewSchedulerProps {
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  driveId: string;
  position: string;
  company: string;
  onInterviewScheduled?: (interview: ScheduledInterview) => void;
}

export const InterviewScheduler = ({
  candidateId,
  candidateName,
  candidateEmail,
  driveId,
  position,
  company,
  onInterviewScheduled
}: InterviewSchedulerProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [availableSlots, setAvailableSlots] = useState<InterviewSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<InterviewSlot | null>(null);
  const [interviewType, setInterviewType] = useState<InterviewSlot['type']>('technical');
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduledInterviews, setScheduledInterviews] = useState<ScheduledInterview[]>([]);
  const [showCalendar, setShowCalendar] = useState(true);

  // Generate available slots for the next 14 days
  useEffect(() => {
    const startDate = new Date();
    const endDate = addDays(startDate, 14);
    const workingHours = { start: '09:00', end: '17:00' };
    const slotDuration = 60; // 60 minutes
    const breakDuration = 15; // 15 minutes between slots
    
    const slots = CalendarIntegration.generateInterviewSlots(
      startDate,
      endDate,
      workingHours,
      slotDuration,
      breakDuration
    );
    
    // Since mock data is removed, generate all slots as available
    const availableSlotsList = slots.map(slot => ({
      ...slot,
      interviewer: 'John Smith',
      interviewerEmail: 'john.smith@company.com',
      location: Math.random() > 0.5 ? 'Virtual - Google Meet' : 'Office - Room 101'
    }));
    
    setAvailableSlots(availableSlotsList);
  }, []);

  // Load existing interviews for this candidate
  useEffect(() => {
    const existingInterviews = CalendarIntegration.getUpcomingInterviews(
      candidateEmail,
      scheduledInterviews,
      30
    );
    // In a real app, this would load from backend
  }, [candidateEmail, scheduledInterviews]);

  const handleDateSelect = (date: Date) => {
    if (isWeekend(date)) {
      toast.error('Interviews are not scheduled on weekends');
      return;
    }
    
    setSelectedDate(date);
    setSelectedSlot(null);
    
    const dateString = format(date, 'yyyy-MM-dd');
    const daySlots = CalendarIntegration.getAvailableSlots(availableSlots, dateString);
    
    if (daySlots.length === 0) {
      toast.info('No available slots for this date');
    }
  };

  const handleSlotSelect = (slot: InterviewSlot) => {
    // Check for conflicts
    const hasConflict = CalendarIntegration.hasConflict(
      candidateEmail,
      slot,
      scheduledInterviews
    );
    
    if (hasConflict) {
      toast.error('You already have an interview scheduled at this time');
      return;
    }
    
    setSelectedSlot(slot);
  };

  const handleScheduleInterview = async () => {
    if (!selectedSlot) {
      toast.error('Please select a time slot');
      return;
    }
    
    setIsScheduling(true);
    
    try {
      // Create the interview
      const interview = CalendarIntegration.scheduleInterview(
        { id: candidateId, name: candidateName, email: candidateEmail },
        { id: driveId, position, company },
        selectedSlot,
        interviewType
      );
      
      // Create calendar event
      const calendarEvent = CalendarIntegration.createCalendarEvent(interview);
      
      // Send calendar invitation
      const invitationResult = await CalendarIntegration.sendCalendarInvitation(
        calendarEvent,
        'google'
      );
      
      if (invitationResult.success) {
        interview.calendarEventId = invitationResult.eventId;
      }
      
      // Update local state
      setScheduledInterviews([...scheduledInterviews, interview]);
      
      // Mark slot as booked
      setAvailableSlots(availableSlots.map(slot => 
        slot.id === selectedSlot.id 
          ? { ...slot, status: 'booked' as const, currentCandidates: 1 }
          : slot
      ));
      
      // Reset form
      setSelectedDate(null);
      setSelectedSlot(null);
      setShowCalendar(false);
      
      onInterviewScheduled?.(interview);
      
      toast.success('Interview scheduled successfully! Check your email for calendar invitation.');
    } catch (error) {
      console.error('Failed to schedule interview:', error);
      toast.error('Failed to schedule interview. Please try again.');
    } finally {
      setIsScheduling(false);
    }
  };

  const getDateLabel = (date: Date) => {
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'MMM d');
  };

  const getInterviewTypeColor = (type: InterviewSlot['type']) => {
    switch (type) {
      case 'technical': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'hr': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'final': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'phone-screen': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  // Generate calendar days for the next 14 days
  const generateCalendarDays = () => {
    const days: Date[] = [];
    const startDate = new Date();
    
    for (let i = 0; i < 14; i++) {
      const date = addDays(startDate, i);
      if (!isWeekend(date)) {
        days.push(date);
      }
    }
    
    return days;
  };

  if (!showCalendar && scheduledInterviews.length > 0) {
    const latestInterview = scheduledInterviews[scheduledInterviews.length - 1];
    
    return (
      <Card className="p-6">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">Interview Scheduled!</h3>
            <p className="text-muted-foreground mb-4">
              Your interview has been scheduled successfully
            </p>
          </div>
          
          <div className="bg-muted/30 rounded-xl p-4 text-left max-w-sm mx-auto">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Building className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">{position}</p>
                  <p className="text-sm text-muted-foreground">{company}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">
                    {format(new Date(latestInterview.date), 'EEEE, MMMM d, yyyy')}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {latestInterview.startTime} - {latestInterview.endTime}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">{latestInterview.interviewer}</p>
                  <p className="text-sm text-muted-foreground">Interviewer</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {latestInterview.location.includes('Virtual') ? (
                  <Video className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                )}
                <div>
                  <p className="font-medium">{latestInterview.location}</p>
                  {latestInterview.meetingLink && (
                    <a 
                      href={latestInterview.meetingLink} 
                      className="text-sm text-primary hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Join Meeting
                    </a>
                  )}
                </div>
              </div>
              
              <div className="pt-2">
                <Badge className={getInterviewTypeColor(latestInterview.type)}>
                  {latestInterview.type.replace('-', ' ')}
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="text-sm text-muted-foreground">
            <p>Calendar invitation sent to {candidateEmail}</p>
            <p>You'll receive a reminder 1 hour before the interview</p>
          </div>
          
          <Button 
            variant="outline" 
            onClick={() => setShowCalendar(true)}
            className="mt-4"
          >
            Schedule Another Interview
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Schedule Interview</h3>
        <p className="text-muted-foreground">
          Select a preferred date and time for your {position} interview
        </p>
      </div>

      {/* Interview Type Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-3">Interview Type</label>
        <div className="flex flex-wrap gap-2">
          {(['technical', 'hr', 'final', 'phone-screen'] as const).map(type => (
            <button
              key={type}
              onClick={() => setInterviewType(type)}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${interviewType === type 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted hover:bg-muted/80'
                }
              `}
            >
              {type.replace('-', ' ').charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-3">Select Date</label>
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-7 gap-2">
          {generateCalendarDays().map(date => {
            const dateString = format(date, 'yyyy-MM-dd');
            const daySlots = CalendarIntegration.getAvailableSlots(availableSlots, dateString);
            const isSelected = selectedDate && format(selectedDate, 'yyyy-MM-dd') === dateString;
            
            return (
              <button
                key={dateString}
                onClick={() => handleDateSelect(date)}
                disabled={daySlots.length === 0}
                className={`
                  p-3 rounded-lg text-center transition-all
                  ${daySlots.length === 0 
                    ? 'bg-muted/30 text-muted-foreground cursor-not-allowed' 
                    : 'bg-background border hover:border-primary cursor-pointer'
                  }
                  ${isSelected ? 'border-primary bg-primary/10' : 'border-border'}
                `}
              >
                <div className="text-sm font-medium">{getDateLabel(date)}</div>
                <div className="text-xs text-muted-foreground">
                  {format(date, 'EEE')}
                </div>
                {daySlots.length > 0 && (
                  <div className="text-xs text-green-600 mt-1">
                    {daySlots.length} slots
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Time Slots */}
      {selectedDate && (
        <div className="mb-6">
          <label className="block text-sm font-medium mb-3">
            Available Times for {format(selectedDate, 'MMMM d, yyyy')}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {CalendarIntegration.getAvailableSlots(
              availableSlots, 
              format(selectedDate, 'yyyy-MM-dd')
            ).map(slot => (
              <button
                key={slot.id}
                onClick={() => handleSlotSelect(slot)}
                disabled={slot.status === 'booked'}
                className={`
                  p-3 rounded-lg text-center transition-all
                  ${slot.status === 'booked'
                    ? 'bg-red-50 text-red-600 cursor-not-allowed border border-red-200'
                    : selectedSlot?.id === slot.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-muted/80 cursor-pointer'
                  }
                `}
              >
                <div className="text-sm font-medium">
                  {slot.startTime} - {slot.endTime}
                </div>
                <div className="text-xs opacity-75">
                  {slot.interviewer}
                </div>
                <div className="text-xs opacity-75 mt-1">
                  {slot.location.includes('Virtual') ? (
                    <Video className="w-3 h-3 inline" />
                  ) : (
                    <MapPin className="w-3 h-3 inline" />
                  )}
                  {' '}
                  {slot.location.includes('Virtual') ? 'Virtual' : 'In-Person'}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Selected Slot Summary */}
      {selectedSlot && (
        <div className="bg-muted/30 rounded-xl p-4 mb-6">
          <h4 className="font-medium mb-3">Interview Details</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date:</span>
              <span className="font-medium">
                {format(new Date(selectedSlot.date), 'EEEE, MMMM d, yyyy')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Time:</span>
              <span className="font-medium">
                {selectedSlot.startTime} - {selectedSlot.endTime}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Interviewer:</span>
              <span className="font-medium">{selectedSlot.interviewer}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Location:</span>
              <span className="font-medium">{selectedSlot.location}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Type:</span>
              <Badge className={getInterviewTypeColor(interviewType)}>
                {interviewType.replace('-', ' ')}
              </Badge>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Button */}
      <Button 
        onClick={handleScheduleInterview}
        disabled={!selectedSlot || isScheduling}
        className="w-full"
        size="lg"
      >
        {isScheduling ? 'Scheduling...' : 'Schedule Interview'}
      </Button>

      {/* Info Message */}
      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800 dark:text-blue-200">
            <p className="font-medium mb-1">What happens next?</p>
            <ul className="space-y-1 text-xs">
              <li>• Calendar invitation will be sent to your email</li>
              <li>• You'll receive a reminder 1 hour before the interview</li>
              <li>• Meeting link will be provided for virtual interviews</li>
              <li>• You can reschedule if needed up to 24 hours before</li>
            </ul>
          </div>
        </div>
      </div>
    </Card>
  );
};
