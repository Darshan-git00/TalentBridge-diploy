import { Badge } from "@/components/ui/badge";
import { Application } from "@/services/types";

interface StatusChipProps {
  status: Application['status'];
  className?: string;
}

export const StatusChip = ({ status, className = "" }: StatusChipProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "applied":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "shortlisted":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "on_hold":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      case "accepted":
        return "bg-green-100 text-green-800 border-green-200";
      case "interview_scheduled":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "under_review":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "selected":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "withdrawn":
        return "bg-slate-100 text-slate-800 border-slate-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatStatus = (status: string) => {
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <Badge className={`text-xs font-medium px-2 py-1 ${getStatusColor(status)} ${className}`}>
      {formatStatus(status)}
    </Badge>
  );
};
