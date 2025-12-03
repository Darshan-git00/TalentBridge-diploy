import { Card } from "@/components/ui/card";
import { InterviewDetails } from "@/services/types";
import { Calendar, Clock, Video, MapPin, ExternalLink } from "lucide-react";

interface InterviewDetailsCardProps {
  interviewDetails: InterviewDetails;
  className?: string;
}

export const InterviewDetailsCard = ({ interviewDetails, className = "" }: InterviewDetailsCardProps) => {
  return (
    <Card className={`p-3 bg-blue-50 border-blue-200 ${className}`}>
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="w-4 h-4 text-blue-600" />
          <span className="font-medium text-blue-800">Date:</span>
          <span className="text-blue-700">{interviewDetails.date}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4 text-blue-600" />
          <span className="font-medium text-blue-800">Time:</span>
          <span className="text-blue-700">{interviewDetails.time}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          {interviewDetails.mode === 'online' ? (
            <Video className="w-4 h-4 text-blue-600" />
          ) : (
            <MapPin className="w-4 h-4 text-blue-600" />
          )}
          <span className="font-medium text-blue-800">Mode:</span>
          <span className="text-blue-700 capitalize">{interviewDetails.mode}</span>
        </div>
        {interviewDetails.link && (
          <div className="flex items-center gap-2 text-sm">
            <ExternalLink className="w-4 h-4 text-blue-600" />
            <span className="font-medium text-blue-800">Link:</span>
            <a 
              href={interviewDetails.link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline flex items-center gap-1"
            >
              Join Interview
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}
      </div>
    </Card>
  );
};
