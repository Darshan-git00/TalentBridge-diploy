import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { HelpCircle, X, Info, CheckCircle, AlertCircle } from 'lucide-react';

interface HelpTooltipProps {
  title: string;
  content: string;
  type?: 'info' | 'tip' | 'warning';
  children?: React.ReactNode;
  className?: string;
}

export const HelpTooltip = ({ 
  title, 
  content, 
  type = 'info', 
  children, 
  className = '' 
}: HelpTooltipProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const getIcon = () => {
    switch (type) {
      case 'tip':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getColors = () => {
    switch (type) {
      case 'tip':
        return 'border-green-200 bg-green-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      default:
        return 'border-blue-200 bg-blue-50';
    }
  };

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Trigger */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="h-6 w-6 p-0 rounded-full"
      >
        {children || <HelpCircle className="w-4 h-4 text-muted-foreground" />}
      </Button>

      {/* Tooltip */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Tooltip Card */}
          <Card className={`absolute z-50 w-80 p-4 shadow-lg ${getColors()}`}>
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                {getIcon()}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-sm mb-1">{title}</h4>
                <p className="text-sm text-muted-foreground">{content}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-6 w-6 p-0 -mt-1 -mr-1"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </Card>
        </>
      )}
    </div>
  );
};

// Predefined help tooltips for common use cases
export const ProfileCompletionHelp = () => (
  <HelpTooltip
    title="Profile Completion"
    content="Complete your profile with education, skills, and experience to get better job matches and attract recruiters."
    type="tip"
  />
);

export const ApplicationStatusHelp = () => (
  <HelpTooltip
    title="Application Status"
    content="Applied → Shortlisted → Interview Scheduled → Hired. Check your notifications for updates."
    type="info"
  />
);

export const SkillsMatchingHelp = () => (
  <HelpTooltip
    title="Skills Matching"
    content="The more your skills match the requirements, the higher your chances of getting shortlisted."
    type="tip"
  />
);

export const InterviewSchedulingHelp = () => (
  <HelpTooltip
    title="Interview Scheduling"
    content="When shortlisted, you can schedule interviews directly with recruiters using our calendar integration."
    type="info"
  />
);
