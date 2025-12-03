// Email Notifications - Application status updates system

export interface EmailNotification {
  id: string;
  to: string;
  subject: string;
  body: string;
  type: 'application-status' | 'interview-scheduled' | 'interview-reminder' | 'offer-letter' | 'rejection' | 'welcome';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  sentAt?: string;
  deliveredAt?: string;
  error?: string;
  metadata: {
    applicationId?: string;
    driveId?: string;
    candidateId?: string;
    recruiterId?: string;
    interviewId?: string;
    [key: string]: any;
  };
  createdAt: string;
  updatedAt: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  type: EmailNotification['type'];
  subject: string;
  htmlTemplate: string;
  textTemplate: string;
  variables: string[];
  isActive: boolean;
}

export interface NotificationPreferences {
  userId: string;
  email: string;
  enabled: boolean;
  preferences: {
    applicationStatus: boolean;
    interviewScheduled: boolean;
    interviewReminder: boolean;
    offerLetter: boolean;
    rejection: boolean;
    marketingEmails: boolean;
    weeklyDigest: boolean;
  };
  frequency: 'immediate' | 'daily' | 'weekly';
  quietHours: {
    enabled: boolean;
    start: string; // "22:00"
    end: string;   // "08:00"
  };
}

export class EmailNotificationService {
  private static notifications: EmailNotification[] = [];
  private static templates: EmailTemplate[] = [];
  private static preferences: Map<string, NotificationPreferences> = new Map();

  // Initialize default email templates
  static initializeTemplates() {
    this.templates = [
      {
        id: 'application-received',
        name: 'Application Received',
        type: 'application-status',
        subject: 'Application Received for {{position}} at {{company}}',
        htmlTemplate: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
              <h1 style="margin: 0; font-size: 28px;">Application Received! 🎉</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Thank you for your interest</p>
            </div>
            
            <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <p>Dear {{candidateName}},</p>
              
              <p>We're pleased to confirm that we've received your application for the <strong>{{position}}</strong> position at <strong>{{company}}</strong>.</p>
              
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin: 0 0 15px 0; color: #333;">Application Details</h3>
                <p style="margin: 5px 0;"><strong>Position:</strong> {{position}}</p>
                <p style="margin: 5px 0;"><strong>Company:</strong> {{company}}</p>
                <p style="margin: 5px 0;"><strong>Applied Date:</strong> {{appliedDate}}</p>
                <p style="margin: 5px 0;"><strong>Application ID:</strong> {{applicationId}}</p>
              </div>
              
              <p>Our team will review your application and contact you within 3-5 business days if your profile matches our requirements.</p>
              
              <p>You can track your application status by logging into your TalentBridge dashboard.</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="{{dashboardUrl}}" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; display: inline-block;">
                  View Application Status
                </a>
              </div>
              
              <p>Best regards,<br>The {{company}} Recruitment Team</p>
              
              <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
              <p style="font-size: 12px; color: #666;">
                This email was sent to {{email}} because you applied for a position through TalentBridge.<br>
                If you didn't expect this email, please contact our support team.
              </p>
            </div>
          </div>
        `,
        textTemplate: `
Application Received for {{position}} at {{company}}

Dear {{candidateName}},

We're pleased to confirm that we've received your application for the {{position}} position at {{company}}.

Application Details:
- Position: {{position}}
- Company: {{company}}
- Applied Date: {{appliedDate}}
- Application ID: {{applicationId}}

Our team will review your application and contact you within 3-5 business days if your profile matches our requirements.

You can track your application status by logging into your TalentBridge dashboard: {{dashboardUrl}}

Best regards,
The {{company}} Recruitment Team
        `,
        variables: ['candidateName', 'position', 'company', 'appliedDate', 'applicationId', 'dashboardUrl', 'email'],
        isActive: true
      },
      {
        id: 'interview-scheduled',
        name: 'Interview Scheduled',
        type: 'interview-scheduled',
        subject: 'Interview Scheduled: {{position}} at {{company}}',
        htmlTemplate: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
              <h1 style="margin: 0; font-size: 28px;">Interview Scheduled! 📅</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">You've been shortlisted</p>
            </div>
            
            <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <p>Dear {{candidateName}},</p>
              
              <p>Congratulations! Your application for <strong>{{position}}</strong> at <strong>{{company}}</strong> has been shortlisted, and we'd like to schedule an interview.</p>
              
              <div style="background: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 20px; margin: 20px 0;">
                <h3 style="margin: 0 0 15px 0; color: #0369a1;">Interview Details</h3>
                <p style="margin: 5px 0;"><strong>Date:</strong> {{interviewDate}}</p>
                <p style="margin: 5px 0;"><strong>Time:</strong> {{interviewTime}}</p>
                <p style="margin: 5px 0;"><strong>Duration:</strong> {{duration}} minutes</p>
                <p style="margin: 5px 0;"><strong>Type:</strong> {{interviewType}}</p>
                <p style="margin: 5px 0;"><strong>Interviewer:</strong> {{interviewer}}</p>
                {{#meetingLink}}
                <p style="margin: 5px 0;"><strong>Meeting Link:</strong> <a href="{{meetingLink}}" style="color: #0ea5e9;">Join Interview</a></p>
                {{/meetingLink}}
                {{#location}}
                <p style="margin: 5px 0;"><strong>Location:</strong> {{location}}</p>
                {{/location}}
              </div>
              
              <p>Please make sure to:</p>
              <ul style="margin: 15px 0; padding-left: 20px;">
                <li>Join the interview 5 minutes early</li>
                <li>Test your technical setup for virtual interviews</li>
                <li>Have your resume and portfolio ready</li>
                <li>Research about {{company}}</li>
              </ul>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="{{calendarUrl}}" style="background: #11998e; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; display: inline-block; margin-right: 10px;">
                  Add to Calendar
                </a>
                <a href="{{rescheduleUrl}}" style="background: #64748b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; display: inline-block;">
                  Reschedule
                </a>
              </div>
              
              <p>If you need to reschedule, please do so at least 24 hours in advance.</p>
              
              <p>Best regards,<br>The {{company}} Recruitment Team</p>
              
              <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
              <p style="font-size: 12px; color: #666;">
                This email contains confidential interview information. Please do not share it with others.
              </p>
            </div>
          </div>
        `,
        textTemplate: `
Interview Scheduled: {{position}} at {{company}}

Dear {{candidateName}},

Congratulations! Your application for {{position}} at {{company}} has been shortlisted, and we'd like to schedule an interview.

Interview Details:
- Date: {{interviewDate}}
- Time: {{interviewTime}}
- Duration: {{duration}} minutes
- Type: {{interviewType}}
- Interviewer: {{interviewer}}
{{#meetingLink}}
- Meeting Link: {{meetingLink}}
{{/meetingLink}}
{{#location}}
- Location: {{location}}
{{/location}}

Please make sure to:
- Join the interview 5 minutes early
- Test your technical setup for virtual interviews
- Have your resume and portfolio ready
- Research about {{company}}

Add to Calendar: {{calendarUrl}}
Reschedule: {{rescheduleUrl}}

If you need to reschedule, please do so at least 24 hours in advance.

Best regards,
The {{company}} Recruitment Team
        `,
        variables: ['candidateName', 'position', 'company', 'interviewDate', 'interviewTime', 'duration', 'interviewType', 'interviewer', 'meetingLink', 'location', 'calendarUrl', 'rescheduleUrl'],
        isActive: true
      },
      {
        id: 'interview-reminder',
        name: 'Interview Reminder',
        type: 'interview-reminder',
        subject: 'Reminder: Interview in {{hoursUntil}} hours',
        htmlTemplate: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
              <h1 style="margin: 0; font-size: 28px;">Interview Reminder ⏰</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Your interview is coming up soon</p>
            </div>
            
            <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <p>Hi {{candidateName}},</p>
              
              <p>This is a friendly reminder that you have an interview scheduled for <strong>{{position}}</strong> at <strong>{{company}}</strong> in <strong>{{hoursUntil}} hours</strong>.</p>
              
              <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin: 20px 0;">
                <h3 style="margin: 0 0 15px 0; color: #856404;">Quick Details</h3>
                <p style="margin: 5px 0;"><strong>Time:</strong> {{interviewTime}} ({{interviewDate}})</p>
                <p style="margin: 5px 0;"><strong>Duration:</strong> {{duration}} minutes</p>
                <p style="margin: 5px 0;"><strong>Type:</strong> {{interviewType}}</p>
                {{#meetingLink}}
                <p style="margin: 5px 0;"><strong>Join:</strong> <a href="{{meetingLink}}" style="color: #f5576c;">Click here to join</a></p>
                {{/meetingLink}}
              </div>
              
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin: 0 0 15px 0; color: #333;">Last Minute Checklist</h3>
                <ul style="margin: 0; padding-left: 20px;">
                  <li>Test your camera and microphone</li>
                  <li>Check your internet connection</li>
                  <li>Have your resume ready to share</li>
                  <li>Find a quiet, well-lit space</li>
                  <li>Keep a glass of water nearby</li>
                </ul>
              </div>
              
              <p>Good luck with your interview! 🤞</p>
              
              <p>Best regards,<br>TalentBridge Team</p>
            </div>
          </div>
        `,
        textTemplate: `
Interview Reminder: {{position}} at {{company}}

Hi {{candidateName}},

This is a friendly reminder that you have an interview scheduled for {{position}} at {{company}} in {{hoursUntil}} hours.

Quick Details:
- Time: {{interviewTime}} ({{interviewDate}})
- Duration: {{duration}} minutes
- Type: {{interviewType}}
{{#meetingLink}}
- Join: {{meetingLink}}
{{/meetingLink}}

Last Minute Checklist:
- Test your camera and microphone
- Check your internet connection
- Have your resume ready to share
- Find a quiet, well-lit space
- Keep a glass of water nearby

Good luck with your interview! 🤞

Best regards,
TalentBridge Team
        `,
        variables: ['candidateName', 'position', 'company', 'hoursUntil', 'interviewTime', 'interviewDate', 'duration', 'interviewType', 'meetingLink'],
        isActive: true
      },
      {
        id: 'application-status-update',
        name: 'Application Status Update',
        type: 'application-status',
        subject: 'Application Status Update: {{status}} for {{position}}',
        htmlTemplate: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
              <h1 style="margin: 0; font-size: 28px;">Status Update 📊</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Your application status has changed</p>
            </div>
            
            <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <p>Dear {{candidateName}},</p>
              
              <p>We're writing to update you on the status of your application for <strong>{{position}}</strong> at <strong>{{company}}</strong>.</p>
              
              <div style="background: #e8f5e8; border-left: 4px solid #28a745; padding: 20px; margin: 20px 0;">
                <h3 style="margin: 0 0 10px 0; color: #155724;">New Status: {{status}}</h3>
                <p style="margin: 0;">{{statusMessage}}</p>
              </div>
              
              {{#nextSteps}}
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin: 0 0 15px 0; color: #333;">Next Steps</h3>
                <p>{{nextSteps}}</p>
              </div>
              {{/nextSteps}}
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="{{dashboardUrl}}" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; display: inline-block;">
                  View Full Application
                </a>
              </div>
              
              <p>Thank you for your continued interest in this opportunity.</p>
              
              <p>Best regards,<br>The {{company}} Recruitment Team</p>
            </div>
          </div>
        `,
        textTemplate: `
Application Status Update: {{status}} for {{position}}

Dear {{candidateName}},

We're writing to update you on the status of your application for {{position}} at {{company}}.

New Status: {{status}}
{{statusMessage}}

{{#nextSteps}}
Next Steps:
{{nextSteps}}
{{/nextSteps}}

View Full Application: {{dashboardUrl}}

Thank you for your continued interest in this opportunity.

Best regards,
The {{company}} Recruitment Team
        `,
        variables: ['candidateName', 'position', 'company', 'status', 'statusMessage', 'nextSteps', 'dashboardUrl'],
        isActive: true
      }
    ];
  }

  // Send notification
  static async sendNotification(
    to: string,
    type: EmailNotification['type'],
    variables: Record<string, any>,
    metadata: Record<string, any> = {}
  ): Promise<{ success: boolean; notificationId?: string; error?: string }> {
    try {
      // Check user preferences
      const preferences = this.preferences.get(to);
      if (preferences && !preferences.enabled) {
        return { success: false, error: 'User has disabled notifications' };
      }

      if (preferences && !this.isNotificationAllowed(preferences, type)) {
        return { success: false, error: 'Notification type not allowed by user preferences' };
      }

      // Get template
      const template = this.templates.find(t => t.type === type && t.isActive);
      if (!template) {
        return { success: false, error: 'Template not found' };
      }

      // Process template
      const subject = this.processTemplate(template.subject, variables);
      const body = this.processTemplate(template.htmlTemplate, variables);

      // Create notification
      const notification: EmailNotification = {
        id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        to,
        subject,
        body,
        type,
        priority: this.getPriority(type),
        status: 'pending',
        metadata: {
          ...metadata,
          templateId: template.id
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Store notification
      this.notifications.push(notification);

      // Send email (mock implementation)
      const sendResult = await this.sendEmail(notification);
      
      if (sendResult.success) {
        notification.status = 'sent';
        notification.sentAt = new Date().toISOString();
        notification.updatedAt = new Date().toISOString();
      } else {
        notification.status = 'failed';
        notification.error = sendResult.error;
        notification.updatedAt = new Date().toISOString();
      }

      return {
        success: sendResult.success,
        notificationId: notification.id,
        error: sendResult.error
      };

    } catch (error) {
      console.error('Failed to send notification:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Send application status update
  static async sendApplicationStatusUpdate(
    to: string,
    candidateName: string,
    position: string,
    company: string,
    status: string,
    statusMessage: string,
    nextSteps?: string,
    applicationId?: string
  ) {
    return this.sendNotification(to, 'application-status', {
      candidateName,
      position,
      company,
      status,
      statusMessage,
      nextSteps,
      dashboardUrl: 'https://talentbridge.com/student/applications',
      applicationId
    }, {
      applicationId,
      driveId: applicationId
    });
  }

  // Send interview scheduled notification
  static async sendInterviewScheduled(
    to: string,
    candidateName: string,
    position: string,
    company: string,
    interviewDetails: {
      date: string;
      time: string;
      duration: number;
      type: string;
      interviewer: string;
      meetingLink?: string;
      location?: string;
    }
  ) {
    return this.sendNotification(to, 'interview-scheduled', {
      candidateName,
      position,
      company,
      interviewDate: interviewDetails.date,
      interviewTime: interviewDetails.time,
      duration: interviewDetails.duration,
      interviewType: interviewDetails.type,
      interviewer: interviewDetails.interviewer,
      meetingLink: interviewDetails.meetingLink,
      location: interviewDetails.location,
      calendarUrl: 'https://talentbridge.com/calendar/add',
      rescheduleUrl: 'https://talentbridge.com/interview/reschedule'
    }, {
      interviewId: `interview-${Date.now()}`
    });
  }

  // Send interview reminder
  static async sendInterviewReminder(
    to: string,
    candidateName: string,
    position: string,
    company: string,
    interviewDetails: {
      date: string;
      time: string;
      duration: number;
      type: string;
      meetingLink?: string;
    },
    hoursUntil: number
  ) {
    return this.sendNotification(to, 'interview-reminder', {
      candidateName,
      position,
      company,
      interviewDate: interviewDetails.date,
      interviewTime: interviewDetails.time,
      duration: interviewDetails.duration,
      interviewType: interviewDetails.type,
      meetingLink: interviewDetails.meetingLink,
      hoursUntil
    }, {
      interviewId: `interview-${Date.now()}`
    });
  }

  // Get notification history
  static getNotificationHistory(email: string, limit: number = 50): EmailNotification[] {
    return this.notifications
      .filter(n => n.to === email)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  // Get notification statistics
  static getNotificationStats(email?: string) {
    const notifications = email 
      ? this.notifications.filter(n => n.to === email)
      : this.notifications;

    const total = notifications.length;
    const sent = notifications.filter(n => n.status === 'sent').length;
    const failed = notifications.filter(n => n.status === 'failed').length;
    const pending = notifications.filter(n => n.status === 'pending').length;

    const byType = {
      'application-status': notifications.filter(n => n.type === 'application-status').length,
      'interview-scheduled': notifications.filter(n => n.type === 'interview-scheduled').length,
      'interview-reminder': notifications.filter(n => n.type === 'interview-reminder').length,
      'offer-letter': notifications.filter(n => n.type === 'offer-letter').length,
      'rejection': notifications.filter(n => n.type === 'rejection').length
    };

    const deliveryRate = total > 0 ? (sent / total) * 100 : 0;

    return {
      total,
      sent,
      failed,
      pending,
      byType,
      deliveryRate: Math.round(deliveryRate * 10) / 10
    };
  }

  // Set user preferences
  static setUserPreferences(preferences: NotificationPreferences) {
    this.preferences.set(preferences.email, preferences);
  }

  // Get user preferences
  static getUserPreferences(email: string): NotificationPreferences | undefined {
    return this.preferences.get(email);
  }

  // Private helper methods
  private static processTemplate(template: string, variables: Record<string, any>): string {
    let processed = template;
    
    // Simple variable substitution {{variable}}
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      processed = processed.replace(regex, String(value));
    });

    // Handle conditional blocks {{#variable}}content{{/variable}}
    processed = processed.replace(/{{#(\w+)}}([\s\S]*?){{\/\1}}/g, (match, key, content) => {
      return variables[key] ? content : '';
    });

    return processed;
  }

  private static getPriority(type: EmailNotification['type']): EmailNotification['priority'] {
    switch (type) {
      case 'interview-reminder':
        return 'high';
      case 'interview-scheduled':
      case 'offer-letter':
        return 'medium';
      case 'application-status':
      case 'rejection':
        return 'medium';
      case 'welcome':
      default:
        return 'low';
    }
  }

  private static isNotificationAllowed(preferences: NotificationPreferences, type: EmailNotification['type']): boolean {
    switch (type) {
      case 'application-status':
        return preferences.preferences.applicationStatus;
      case 'interview-scheduled':
        return preferences.preferences.interviewScheduled;
      case 'interview-reminder':
        return preferences.preferences.interviewReminder;
      case 'offer-letter':
        return preferences.preferences.offerLetter;
      case 'rejection':
        return preferences.preferences.rejection;
      default:
        return true;
    }
  }

  private static async sendEmail(notification: EmailNotification): Promise<{ success: boolean; error?: string }> {
    try {
      // Mock email sending - in production, this would integrate with:
      // - SendGrid, Mailgun, AWS SES, or SMTP
      // - Handle bounce detection
      // - Track delivery status
      // - Handle retries
      
      console.log(`Sending email to ${notification.to}:`, notification.subject);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock success (90% success rate for demo)
      if (Math.random() > 0.1) {
        return { success: true };
      } else {
        return { success: false, error: 'SMTP server unavailable' };
      }
    } catch (error) {
      console.error('Email sending failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

// Initialize templates on import
EmailNotificationService.initializeTemplates();
