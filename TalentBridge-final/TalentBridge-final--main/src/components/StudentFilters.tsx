import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface StudentFiltersProps {
  filters: {
    course: string;
    branch: string;
    status: string;
    year: string;
  };
  onFilterChange: (key: string, value: string) => void;
  onClearFilters: () => void;
}

const StudentFilters = ({ filters, onFilterChange, onClearFilters }: StudentFiltersProps) => {
  const hasActiveFilters = Object.values(filters).some(v => v !== "all");

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select value={filters.course} onValueChange={(value) => onFilterChange("course", value)}>
        <SelectTrigger className="w-[180px] bg-background">
          <SelectValue placeholder="Course" />
        </SelectTrigger>
        <SelectContent className="bg-background z-50">
          <SelectItem value="all">All Courses</SelectItem>
          <SelectItem value="btech">B.Tech</SelectItem>
          <SelectItem value="mtech">M.Tech</SelectItem>
          <SelectItem value="mca">MCA</SelectItem>
          <SelectItem value="bca">BCA</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filters.branch} onValueChange={(value) => onFilterChange("branch", value)}>
        <SelectTrigger className="w-[180px] bg-background">
          <SelectValue placeholder="Branch" />
        </SelectTrigger>
        <SelectContent className="bg-background z-50">
          <SelectItem value="all">All Branches</SelectItem>
          <SelectItem value="cse">Computer Science</SelectItem>
          <SelectItem value="it">Information Technology</SelectItem>
          <SelectItem value="ece">Electronics</SelectItem>
          <SelectItem value="mechanical">Mechanical</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filters.status} onValueChange={(value) => onFilterChange("status", value)}>
        <SelectTrigger className="w-[180px] bg-background">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent className="bg-background z-50">
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="available">Available</SelectItem>
          <SelectItem value="placed">Placed</SelectItem>
          <SelectItem value="on-hold">On Hold</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filters.year} onValueChange={(value) => onFilterChange("year", value)}>
        <SelectTrigger className="w-[180px] bg-background">
          <SelectValue placeholder="Year" />
        </SelectTrigger>
        <SelectContent className="bg-background z-50">
          <SelectItem value="all">All Years</SelectItem>
          <SelectItem value="1">1st Year</SelectItem>
          <SelectItem value="2">2nd Year</SelectItem>
          <SelectItem value="3">3rd Year</SelectItem>
          <SelectItem value="4">4th Year</SelectItem>
        </SelectContent>
      </Select>

      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearFilters}
          className="h-10 px-3"
        >
          <X className="w-4 h-4 mr-2" />
          Clear Filters
        </Button>
      )}
    </div>
  );
};

export default StudentFilters;
