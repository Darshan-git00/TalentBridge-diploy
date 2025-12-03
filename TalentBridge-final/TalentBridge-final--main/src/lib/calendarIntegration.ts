// Calendar Integration - Interview scheduling system

export interface InterviewSlot {
  id: string;
  date: string; // ISO date string
  startTime: string; // "09:00"
  endTime: string; // "10:00"
  duration: number; // in minutes
  type: 'technical' | 'hr' | 'final' | 'phone-screen';
  interviewer: string;
  interviewerEmail: string;
  location: string; // physical location or meeting link
  maxCandidates: number;
  currentCandidates: number;
  status: 'available' | 'booked' | 'completed' | 'cancelled';
  notes?: string;
}

export interface ScheduledInterview {
  id: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  driveId: string;
  position: string;
  company: string;
  slotId: string;
  date: string;
  startTime: string;
  endTime: string;
  type: 'technical' | 'hr' | 'final' | 'phone-screen';
  interviewer: string;
  interviewerEmail: string;
  location: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled';
  meetingLink?: string;
  calendarEventId?: string;
  reminderSent: boolean;
  feedback?: {
    rating: number;
    comments: string;
    recommended: boolean;
    nextStep?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  attendees: Array<{
    email: string;
    name: string;
    status: 'accepted' | 'declined' | 'tentative' | 'needsAction';
  }>;
  location?: string;
  meetingLink?: string;
  reminders: Array<{
    method: 'email' | 'popup';
    minutes: number;
  }>;
}

export class CalendarIntegration {
  // Generate available time slots for interviews
  static generateInterviewSlots(
    startDate: Date,
    endDate: Date,
    workingHours: { start: string; end: string },
    slotDuration: number,
    breakDuration: number,
    excludeDates: string[] = []
  ): InterviewSlot[] {
    const slots: InterviewSlot[] = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      // Skip weekends and excluded dates
      const dayOfWeek = currentDate.getDay();
      const dateString = currentDate.toISOString().split('T')[0];
      
      if (dayOfWeek !== 0 && dayOfWeek !== 6 && !excludeDates.includes(dateString)) {
        const [startHour, startMinute] = workingHours.start.split(':').map(Number);
        const [endHour, endMinute] = workingHours.end.split(':').map(Number);
        
        let currentTime = new Date(currentDate);
        currentTime.setHours(startHour, startMinute, 0, 0);
        
        const endTime = new Date(currentDate);
        endTime.setHours(endHour, endMinute, 0, 0);
        
        while (currentTime < endTime) {
          const slotEndTime = new Date(currentTime);
          slotEndTime.setMinutes(slotEndTime.getMinutes() + slotDuration);
          
          if (slotEndTime <= endTime) {
            slots.push({
              id: `slot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              date: dateString,
              startTime: this.formatTime(currentTime),
              endTime: this.formatTime(slotEndTime),
              duration: slotDuration,
              type: 'technical', // Default type, can be overridden
              interviewer: 'TBD',
              interviewerEmail: '',
              location: 'TBD',
              maxCandidates: 1,
              currentCandidates: 0,
              status: 'available'
            });
          }
          
          // Add break time between slots
          currentTime.setMinutes(currentTime.getMinutes() + slotDuration + breakDuration);
        }
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return slots;
  }

  // Schedule an interview
  static scheduleInterview(
    candidate: {
      id: string;
      name: string;
      email: string;
    },
    drive: {
      id: string;
      position: string;
      company: string;
    },
    slot: InterviewSlot,
    interviewType: InterviewSlot['type']
  ): ScheduledInterview {
    const interview: ScheduledInterview = {
      id: `interview-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      candidateId: candidate.id,
      candidateName: candidate.name,
      candidateEmail: candidate.email,
      driveId: drive.id,
      position: drive.position,
      company: drive.company,
      slotId: slot.id,
      date: slot.date,
      startTime: slot.startTime,
      endTime: slot.endTime,
      type: interviewType,
      interviewer: slot.interviewer,
      interviewerEmail: slot.interviewerEmail,
      location: slot.location,
      status: 'scheduled',
      reminderSent: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Generate meeting link for virtual interviews
    if (slot.location.includes('Virtual') || slot.location.includes('Online')) {
      interview.meetingLink = this.generateMeetingLink(interview);
    }

    return interview;
  }

  // Generate Google Meet/Zoom meeting link
  static generateMeetingLink(interview: ScheduledInterview): string {
    // In a real implementation, this would integrate with Google Meet API or Zoom API
    // For now, return a mock meeting link
    const meetId = Math.random().toString(36).substr(2, 10);
    return `https://meet.google.com/${meetId}`;
  }

  // Create calendar event
  static createCalendarEvent(interview: ScheduledInterview): CalendarEvent {
    const startTime = new Date(`${interview.date}T${interview.startTime}:00`);
    const endTime = new Date(`${interview.date}T${interview.endTime}:00`);
    
    const event: CalendarEvent = {
      id: interview.id,
      title: `Interview: ${interview.position} at ${interview.company}`,
      description: `
Interview Details:
- Position: ${interview.position}
- Company: ${interview.company}
- Type: ${interview.type}
- Candidate: ${interview.candidateName}
- Interviewer: ${interview.interviewer}

${interview.meetingLink ? `Meeting Link: ${interview.meetingLink}` : `Location: ${interview.location}`}
      `.trim(),
      startTime,
      endTime,
      attendees: [
        {
          email: interview.candidateEmail,
          name: interview.candidateName,
          status: 'needsAction'
        },
        {
          email: interview.interviewerEmail,
          name: interview.interviewer,
          status: 'accepted'
        }
      ],
      location: interview.location,
      meetingLink: interview.meetingLink,
      reminders: [
        { method: 'email', minutes: 60 },
        { method: 'popup', minutes: 15 }
      ]
    };

    return event;
  }

  // Send calendar invitation (mock implementation)
  static async sendCalendarInvitation(
    event: CalendarEvent,
    provider: 'google' | 'outlook' | 'apple' = 'google'
  ): Promise<{ success: boolean; eventId?: string; error?: string }> {
    try {
      // In a real implementation, this would:
      // 1. Authenticate with the calendar provider
      // 2. Create the event using their API
      // 3. Send invitations to all attendees
      
      // Mock implementation
      console.log(`Sending calendar invitation via ${provider}:`, event);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock success response
      return {
        success: true,
        eventId: `${provider}-event-${Date.now()}`
      };
    } catch (error) {
      console.error('Failed to send calendar invitation:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Reschedule interview
  static rescheduleInterview(
    interview: ScheduledInterview,
    newSlot: InterviewSlot
  ): ScheduledInterview {
    const updatedInterview: ScheduledInterview = {
      ...interview,
      slotId: newSlot.id,
      date: newSlot.date,
      startTime: newSlot.startTime,
      endTime: newSlot.endTime,
      interviewer: newSlot.interviewer,
      interviewerEmail: newSlot.interviewerEmail,
      location: newSlot.location,
      status: 'rescheduled',
      updatedAt: new Date().toISOString()
    };

    // Generate new meeting link if needed
    if (newSlot.location.includes('Virtual') || newSlot.location.includes('Online')) {
      updatedInterview.meetingLink = this.generateMeetingLink(updatedInterview);
    }

    return updatedInterview;
  }

  // Cancel interview
  static cancelInterview(
    interview: ScheduledInterview,
    reason?: string
  ): ScheduledInterview {
    return {
      ...interview,
      status: 'cancelled',
      updatedAt: new Date().toISOString()
    };
  }

  // Get available slots for a specific date
  static getAvailableSlots(slots: InterviewSlot[], date: string): InterviewSlot[] {
    return slots.filter(slot => 
      slot.date === date && 
      slot.status === 'available' && 
      slot.currentCandidates < slot.maxCandidates
    );
  }

  // Check for scheduling conflicts
  static hasConflict(
    candidateEmail: string,
    newSlot: InterviewSlot,
    existingInterviews: ScheduledInterview[]
  ): boolean {
    return existingInterviews.some(interview => {
      if (interview.candidateEmail !== candidateEmail) return false;
      if (interview.date !== newSlot.date) return false;
      
      const existingStart = this.timeToMinutes(interview.startTime);
      const existingEnd = this.timeToMinutes(interview.endTime);
      const newStart = this.timeToMinutes(newSlot.startTime);
      const newEnd = this.timeToMinutes(newSlot.endTime);
      
      return (newStart < existingEnd && newEnd > existingStart);
    });
  }

  // Get upcoming interviews for a candidate
  static getUpcomingInterviews(
    candidateEmail: string,
    interviews: ScheduledInterview[],
    days: number = 7
  ): ScheduledInterview[] {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(now.getDate() + days);
    
    return interviews
      .filter(interview => 
        interview.candidateEmail === candidateEmail &&
        interview.status !== 'cancelled' &&
        interview.status !== 'completed' &&
        new Date(`${interview.date}T${interview.startTime}`) >= now &&
        new Date(`${interview.date}T${interview.startTime}`) <= futureDate
      )
      .sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.startTime}`);
        const dateB = new Date(`${b.date}T${b.startTime}`);
        return dateA.getTime() - dateB.getTime();
      });
  }

  // Send interview reminder
  static async sendReminder(
    interview: ScheduledInterview,
    reminderType: 'email' | 'sms' = 'email'
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // In a real implementation, this would integrate with email/SMS services
      console.log(`Sending ${reminderType} reminder for interview:`, interview);
      
      // Mock sending
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return { success: true };
    } catch (error) {
      console.error('Failed to send reminder:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Helper methods
  private static formatTime(date: Date): string {
    return date.toTimeString().slice(0, 5);
  }

  private static timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  // Get interview statistics
  static getInterviewStatistics(interviews: ScheduledInterview[]) {
    const total = interviews.length;
    const scheduled = interviews.filter(i => i.status === 'scheduled').length;
    const completed = interviews.filter(i => i.status === 'completed').length;
    const cancelled = interviews.filter(i => i.status === 'cancelled').length;
    const rescheduled = interviews.filter(i => i.status === 'rescheduled').length;
    
    const byType = {
      technical: interviews.filter(i => i.type === 'technical').length,
      hr: interviews.filter(i => i.type === 'hr').length,
      final: interviews.filter(i => i.type === 'final').length,
      phoneScreen: interviews.filter(i => i.type === 'phone-screen').length
    };
    
    const completionRate = total > 0 ? (completed / total) * 100 : 0;
    
    return {
      total,
      scheduled,
      completed,
      cancelled,
      rescheduled,
      byType,
      completionRate: Math.round(completionRate * 10) / 10
    };
  }
}
