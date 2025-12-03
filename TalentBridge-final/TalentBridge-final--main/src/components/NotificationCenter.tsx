import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Bell, 
  Mail, 
  Calendar, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Settings,
  Trash2,
  RefreshCw,
  Filter
} from 'lucide-react';
import { EmailNotificationService, EmailNotification, NotificationPreferences } from '@/lib/emailNotifications';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface NotificationCenterProps {
  userEmail: string;
  userName?: string;
}

export const NotificationCenter = ({ userEmail, userName }: NotificationCenterProps) => {
  const [notifications, setNotifications] = useState<EmailNotification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [selectedTab, setSelectedTab] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    loadNotifications();
    loadPreferences();
    loadStats();
  }, [userEmail]);

  const loadNotifications = () => {
    setIsLoading(true);
    try {
      const notificationHistory = EmailNotificationService.getNotificationHistory(userEmail, 20);
      setNotifications(notificationHistory);
    } catch (error) {
      toast.error('Failed to load notifications');
      console.error('Error loading notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadPreferences = () => {
    try {
      const userPrefs = EmailNotificationService.getUserPreferences(userEmail);
      if (userPrefs) {
        setPreferences(userPrefs);
      } else {
        // Set default preferences
        const defaultPrefs: NotificationPreferences = {
          userId: 'current-user',
          email: userEmail,
          enabled: true,
          preferences: {
            applicationStatus: true,
            interviewScheduled: true,
            interviewReminder: true,
            offerLetter: true,
            rejection: true,
            marketingEmails: false,
            weeklyDigest: true
          },
          frequency: 'immediate',
          quietHours: {
            enabled: false,
            start: '22:00',
            end: '08:00'
          }
        };
        setPreferences(defaultPrefs);
        EmailNotificationService.setUserPreferences(defaultPrefs);
      }
    } catch (error) {
      toast.error('Failed to load preferences');
      console.error('Error loading preferences:', error);
    }
  };

  const loadStats = () => {
    try {
      const notificationStats = EmailNotificationService.getNotificationStats(userEmail);
      setStats(notificationStats);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const updatePreferences = (newPreferences: NotificationPreferences) => {
    try {
      EmailNotificationService.setUserPreferences(newPreferences);
      setPreferences(newPreferences);
      toast.success('Preferences updated successfully');
    } catch (error) {
      toast.error('Failed to update preferences');
      console.error('Error updating preferences:', error);
    }
  };

  const markAsRead = (notificationId: string) => {
    // In a real implementation, this would update the notification status
    setNotifications(prev => prev.map(n => 
      n.id === notificationId ? { ...n, status: 'delivered' as const } : n
    ));
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    toast.success('Notification deleted');
  };

  const getNotificationIcon = (type: EmailNotification['type']) => {
    switch (type) {
      case 'application-status':
        return <Mail className="w-4 h-4" />;
      case 'interview-scheduled':
        return <Calendar className="w-4 h-4" />;
      case 'interview-reminder':
        return <Clock className="w-4 h-4" />;
      case 'offer-letter':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejection':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: EmailNotification['status']) => {
    switch (status) {
      case 'sent':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'delivered':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatStatus = (status: EmailNotification['status']) => {
    return status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const getFilteredNotifications = () => {
    if (selectedTab === 'all') return notifications;
    return notifications.filter(n => n.type === selectedTab);
  };

  const getUnreadCount = () => {
    return notifications.filter(n => n.status === 'sent').length;
  };

  if (!preferences) {
    return (
      <Card className="p-6">
        <div className="text-center py-8">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading notification center...</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.sent}</div>
            <div className="text-sm text-muted-foreground">Sent</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-sm text-muted-foreground">Pending</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{Math.round(stats.deliveryRate)}%</div>
            <div className="text-sm text-muted-foreground">Delivery Rate</div>
          </Card>
        </div>
      )}

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="all">All ({notifications.length})</TabsTrigger>
            <TabsTrigger value="application-status">Applications ({stats?.byType['application-status'] || 0})</TabsTrigger>
            <TabsTrigger value="interview-scheduled">Interviews ({stats?.byType['interview-scheduled'] || 0})</TabsTrigger>
            <TabsTrigger value="interview-reminder">Reminders ({stats?.byType['interview-reminder'] || 0})</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={loadNotifications}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <TabsContent value={selectedTab} className="space-y-4">
          {selectedTab === 'settings' ? (
            <NotificationSettings 
              preferences={preferences} 
              onUpdate={updatePreferences}
            />
          ) : (
            <div className="space-y-4">
              {isLoading ? (
                <Card className="p-8 text-center">
                  <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading notifications...</p>
                </Card>
              ) : getFilteredNotifications().length > 0 ? (
                getFilteredNotifications().map((notification) => (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={() => markAsRead(notification.id)}
                    onDelete={() => deleteNotification(notification.id)}
                  />
                ))
              ) : (
                <Card className="p-8 text-center">
                  <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No notifications found</p>
                </Card>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

const NotificationCard = ({ 
  notification, 
  onMarkAsRead, 
  onDelete 
}: { 
  notification: EmailNotification;
  onMarkAsRead: () => void;
  onDelete: () => void;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <Card className={`p-4 transition-all ${
      notification.status === 'sent' ? 'border-primary/20 bg-primary/5' : ''
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            {(() => {
              switch (notification.type) {
                case 'application-status':
                  return <Mail className="w-4 h-4 text-primary" />;
                case 'interview-scheduled':
                  return <Calendar className="w-4 h-4 text-primary" />;
                case 'interview-reminder':
                  return <Clock className="w-4 h-4 text-primary" />;
                case 'offer-letter':
                  return <CheckCircle className="w-4 h-4 text-primary" />;
                case 'rejection':
                  return <AlertCircle className="w-4 h-4 text-primary" />;
                default:
                  return <Bell className="w-4 h-4 text-primary" />;
              }
            })()}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium truncate">{notification.subject}</h4>
              <Badge className={getStatusColor(notification.status)} variant="outline">
                {formatStatus(notification.status)}
              </Badge>
            </div>
            
            <p className={`text-sm text-muted-foreground ${
              isExpanded ? '' : 'line-clamp-2'
            }`}>
              {notification.body.replace(/<[^>]*>/g, '').substring(0, isExpanded ? 1000 : 150)}
              {!isExpanded && notification.body.replace(/<[^>]*>/g, '').length > 150 && '...'}
            </p>
            
            {notification.body.replace(/<[^>]*>/g, '').length > 150 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-xs text-primary hover:underline mt-1"
              >
                {isExpanded ? 'Show less' : 'Show more'}
              </button>
            )}
            
            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
              <span>{format(new Date(notification.createdAt), 'MMM d, yyyy')}</span>
              <span>{format(new Date(notification.createdAt), 'h:mm a')}</span>
              {notification.priority === 'high' && (
                <Badge variant="secondary" className="text-xs">High Priority</Badge>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 ml-4">
          {notification.status === 'sent' && (
            <Button variant="ghost" size="sm" onClick={onMarkAsRead}>
              <CheckCircle className="w-4 h-4" />
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onDelete}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

const NotificationSettings = ({ 
  preferences, 
  onUpdate 
}: { 
  preferences: NotificationPreferences;
  onUpdate: (prefs: NotificationPreferences) => void;
}) => {
  const [localPrefs, setLocalPrefs] = useState(preferences);

  const handleToggle = (key: keyof NotificationPreferences['preferences']) => {
    const updated = {
      ...localPrefs,
      preferences: {
        ...localPrefs.preferences,
        [key]: !localPrefs.preferences[key]
      }
    };
    setLocalPrefs(updated);
    onUpdate(updated);
  };

  const handleFrequencyChange = (frequency: NotificationPreferences['frequency']) => {
    const updated = { ...localPrefs, frequency };
    setLocalPrefs(updated);
    onUpdate(updated);
  };

  const handleQuietHoursToggle = (enabled: boolean) => {
    const updated = {
      ...localPrefs,
      quietHours: {
        ...localPrefs.quietHours,
        enabled
      }
    };
    setLocalPrefs(updated);
    onUpdate(updated);
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Notification Preferences</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="application-status">Application Status Updates</Label>
                <p className="text-sm text-muted-foreground">Get notified when your application status changes</p>
              </div>
              <Switch
                id="application-status"
                checked={localPrefs.preferences.applicationStatus}
                onCheckedChange={() => handleToggle('applicationStatus')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="interview-scheduled">Interview Scheduled</Label>
                <p className="text-sm text-muted-foreground">Receive notifications when interviews are scheduled</p>
              </div>
              <Switch
                id="interview-scheduled"
                checked={localPrefs.preferences.interviewScheduled}
                onCheckedChange={() => handleToggle('interviewScheduled')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="interview-reminder">Interview Reminders</Label>
                <p className="text-sm text-muted-foreground">Get reminder notifications before interviews</p>
              </div>
              <Switch
                id="interview-reminder"
                checked={localPrefs.preferences.interviewReminder}
                onCheckedChange={() => handleToggle('interviewReminder')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="offer-letter">Offer Letters</Label>
                <p className="text-sm text-muted-foreground">Receive notifications about job offers</p>
              </div>
              <Switch
                id="offer-letter"
                checked={localPrefs.preferences.offerLetter}
                onCheckedChange={() => handleToggle('offerLetter')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="rejection">Rejection Notices</Label>
                <p className="text-sm text-muted-foreground">Get notified when applications are rejected</p>
              </div>
              <Switch
                id="rejection"
                checked={localPrefs.preferences.rejection}
                onCheckedChange={() => handleToggle('rejection')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="marketing">Marketing Emails</Label>
                <p className="text-sm text-muted-foreground">Receive promotional and marketing emails</p>
              </div>
              <Switch
                id="marketing"
                checked={localPrefs.preferences.marketingEmails}
                onCheckedChange={() => handleToggle('marketingEmails')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="weekly-digest">Weekly Digest</Label>
                <p className="text-sm text-muted-foreground">Get a weekly summary of your activities</p>
              </div>
              <Switch
                id="weekly-digest"
                checked={localPrefs.preferences.weeklyDigest}
                onCheckedChange={() => handleToggle('weeklyDigest')}
              />
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-4">Delivery Frequency</h3>
          <div className="grid grid-cols-3 gap-2">
            {(['immediate', 'daily', 'weekly'] as const).map(freq => (
              <button
                key={freq}
                onClick={() => handleFrequencyChange(freq)}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition-all
                  ${localPrefs.frequency === freq 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted hover:bg-muted/80'
                  }
                `}
              >
                {freq.charAt(0).toUpperCase() + freq.slice(1)}
              </button>
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-4">Quiet Hours</h3>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="quiet-hours">Enable Quiet Hours</Label>
              <p className="text-sm text-muted-foreground">
                Don't send notifications between {localPrefs.quietHours.start} and {localPrefs.quietHours.end}
              </p>
            </div>
            <Switch
              id="quiet-hours"
              checked={localPrefs.quietHours.enabled}
              onCheckedChange={handleQuietHoursToggle}
            />
          </div>
        </div>
      </div>
    </Card>
  );
};

const getStatusColor = (status: EmailNotification['status']) => {
  switch (status) {
    case 'sent':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'delivered':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'failed':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const formatStatus = (status: EmailNotification['status']) => {
  return status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};
