import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  X, 
  TrendingUp, 
  Clock, 
  MapPin, 
  Briefcase, 
  DollarSign,
  ChevronDown,
  ChevronUp,
  Sparkles
} from 'lucide-react';
import { AdvancedSearch as SearchEngine, SearchQuery, SearchResult, SearchDocument } from '@/lib/advancedSearch';
import { toast } from 'sonner';

interface AdvancedSearchProps {
  onResults?: (results: SearchResult) => void;
  placeholder?: string;
  showFilters?: boolean;
  defaultType?: SearchDocument['type'] | 'all';
}

export const AdvancedSearch = ({ 
  onResults, 
  placeholder = "Search for jobs, companies, students, or more...",
  showFilters = true,
  defaultType = 'all'
}: AdvancedSearchProps) => {
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState<SearchDocument['type'] | 'all'>(defaultType);
  const [filters, setFilters] = useState({
    location: [] as string[],
    skills: [] as string[],
    experience: [] as string[],
    education: [] as string[],
    salary: [] as string[],
    category: [] as string[],
    status: [] as string[],
    dateRange: { start: '', end: '' }
  });
  const [sortBy, setSortBy] = useState<'relevance' | 'date' | 'title' | 'salary'>('relevance');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [results, setResults] = useState<SearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [popularTerms, setPopularTerms] = useState<string[]>([]);

  useEffect(() => {
    // Load popular search terms
    setPopularTerms(SearchEngine.getPopularTerms(5));
  }, []);

  const handleSearch = useCallback(async () => {
    if (!query.trim()) {
      toast.error('Please enter a search query');
      return;
    }

    setIsSearching(true);
    setShowSuggestions(false);

    try {
      const searchQuery: SearchQuery = {
        query,
        type: searchType,
        filters: {
          location: filters.location,
          skills: filters.skills,
          experience: filters.experience,
          education: filters.education,
          salary: filters.salary,
          category: filters.category,
          status: filters.status,
          dateRange: filters.dateRange.start && filters.dateRange.end ? filters.dateRange : undefined
        },
        sort: {
          field: sortBy,
          order: sortOrder
        },
        pagination: {
          page: 1,
          limit: 20
        }
      };

      const searchResults = SearchEngine.search(searchQuery);
      setResults(searchResults);
      onResults?.(searchResults);

      if (searchResults.documents.length === 0) {
        toast.info(`No results found for "${query}"`);
      } else {
        toast.success(`Found ${searchResults.total} results in ${searchResults.searchTime}ms`);
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Search failed. Please try again.');
    } finally {
      setIsSearching(false);
    }
  }, [query, searchType, filters, sortBy, sortOrder, onResults]);

  const handleInputChange = (value: string) => {
    setQuery(value);
    
    if (value.length > 2) {
      const searchSuggestions = SearchEngine.getSuggestions(value, 5);
      setSuggestions(searchSuggestions);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    handleSearch();
  };

  const addFilter = (type: keyof typeof filters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [type]: Array.isArray(prev[type]) 
        ? [...prev[type], value] 
        : prev[type]
    }));
  };

  const removeFilter = (type: keyof typeof filters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [type]: Array.isArray(prev[type]) 
        ? (prev[type] as string[]).filter(v => v !== value)
        : prev[type]
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      location: [],
      skills: [],
      experience: [],
      education: [],
      salary: [],
      category: [],
      status: [],
      dateRange: { start: '', end: '' }
    });
  };

  const hasActiveFilters = () => {
    return Object.values(filters).some(f => 
      Array.isArray(f) ? f.length > 0 : f.start && f.end
    );
  };

  const getDocumentIcon = (type: SearchDocument['type']) => {
    switch (type) {
      case 'drive':
        return <Briefcase className="w-4 h-4" />;
      case 'student':
        return <Sparkles className="w-4 h-4" />;
      case 'company':
        return <TrendingUp className="w-4 h-4" />;
      case 'application':
        return <Clock className="w-4 h-4" />;
      default:
        return <Search className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: SearchDocument['type']) => {
    switch (type) {
      case 'drive':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'student':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'company':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'application':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const highlightText = (text: string, highlights: string[]) => {
    if (!highlights.length) return text;
    
    let highlightedText = text;
    highlights.forEach(highlight => {
      const regex = new RegExp(`(${highlight})`, 'gi');
      highlightedText = highlightedText.replace(regex, '<mark>$1</mark>');
    });
    
    return highlightedText;
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <Card className="p-6">
        <div className="space-y-4">
          {/* Main Search Input */}
          <div className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder={placeholder}
                value={query}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10 pr-12 h-12 text-lg"
              />
              <Button
                onClick={handleSearch}
                disabled={isSearching}
                className="absolute right-1 top-1/2 -translate-y-1/2 h-10"
              >
                {isSearching ? 'Searching...' : 'Search'}
              </Button>
            </div>
            
            {/* Search Suggestions */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-lg shadow-lg z-50">
                {suggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full px-4 py-2 text-left hover:bg-muted/50 transition-colors flex items-center gap-2"
                  >
                    <Search className="w-4 h-4 text-muted-foreground" />
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search Type Selection */}
          <div className="flex flex-wrap gap-2">
            {(['all', 'drive', 'student', 'company', 'application'] as const).map(type => (
              <button
                key={type}
                onClick={() => setSearchType(type)}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition-all
                  ${searchType === type 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted hover:bg-muted/80'
                  }
                `}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>

          {/* Popular Search Terms */}
          {popularTerms.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Popular:</span>
              {popularTerms.map((term, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSuggestionClick(term)}
                  className="text-sm text-primary hover:underline"
                >
                  {term}
                </button>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Filters */}
      {showFilters && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filters
            </h3>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              >
                {showAdvancedFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                Advanced
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllFilters}
              >
                Clear All
              </Button>
            </div>
          </div>

          {/* Active Filters */}
          {hasActiveFilters() && (
            <div className="flex flex-wrap gap-2 mb-4">
              {filters.location.map(loc => (
                <Badge key={loc} variant="secondary" className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {loc}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => removeFilter('location', loc)} />
                </Badge>
              ))}
              {filters.skills.map(skill => (
                <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                  <Briefcase className="w-3 h-3" />
                  {skill}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => removeFilter('skills', skill)} />
                </Badge>
              ))}
              {filters.experience.map(exp => (
                <Badge key={exp} variant="secondary" className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {exp}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => removeFilter('experience', exp)} />
                </Badge>
              ))}
              {filters.salary.map(sal => (
                <Badge key={sal} variant="secondary" className="flex items-center gap-1">
                  <DollarSign className="w-3 h-3" />
                  {sal}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => removeFilter('salary', sal)} />
                </Badge>
              ))}
            </div>
          )}

          {/* Filter Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Location</label>
              <div className="space-y-2">
                {['San Francisco', 'New York', 'Boston', 'Seattle'].map(loc => (
                  <label key={loc} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={filters.location.includes(loc)}
                      onChange={(e) => e.target.checked ? addFilter('location', loc) : removeFilter('location', loc)}
                    />
                    <span className="text-sm">{loc}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Skills</label>
              <div className="space-y-2">
                {['React', 'Node.js', 'Python', 'Machine Learning'].map(skill => (
                  <label key={skill} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={filters.skills.includes(skill)}
                      onChange={(e) => e.target.checked ? addFilter('skills', skill) : removeFilter('skills', skill)}
                    />
                    <span className="text-sm">{skill}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Experience</label>
              <div className="space-y-2">
                {['Entry Level', '1-3 years', '3-5 years', '5+ years'].map(exp => (
                  <label key={exp} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={filters.experience.includes(exp)}
                      onChange={(e) => e.target.checked ? addFilter('experience', exp) : removeFilter('experience', exp)}
                    />
                    <span className="text-sm">{exp}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Education</label>
                <div className="space-y-2">
                  {["Bachelor's", "Master's", "PhD"].map(edu => (
                    <label key={edu} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={filters.education.includes(edu)}
                        onChange={(e) => e.target.checked ? addFilter('education', edu) : removeFilter('education', edu)}
                      />
                      <span className="text-sm">{edu}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Salary Range</label>
                <div className="space-y-2">
                  {['$50k-75k', '$75k-100k', '$100k-150k', '$150k+'].map(sal => (
                    <label key={sal} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={filters.salary.includes(sal)}
                        onChange={(e) => e.target.checked ? addFilter('salary', sal) : removeFilter('salary', sal)}
                      />
                      <span className="text-sm">{sal}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Date Range</label>
                <div className="space-y-2">
                  <input
                    type="date"
                    value={filters.dateRange.start}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      dateRange: { ...prev.dateRange, start: e.target.value }
                    }))}
                    className="w-full p-2 border rounded text-sm"
                  />
                  <input
                    type="date"
                    value={filters.dateRange.end}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      dateRange: { ...prev.dateRange, end: e.target.value }
                    }))}
                    className="w-full p-2 border rounded text-sm"
                  />
                </div>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Sort Options */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">Sort by:</span>
            <div className="flex gap-2">
              {[
                { value: 'relevance', label: 'Relevance' },
                { value: 'date', label: 'Date' },
                { value: 'title', label: 'Title' },
                { value: 'salary', label: 'Salary' }
              ].map(sort => (
                <button
                  key={sort.value}
                  onClick={() => setSortBy(sort.value as any)}
                  className={`
                    px-3 py-1 rounded text-sm transition-all
                    ${sortBy === sort.value 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted hover:bg-muted/80'
                    }
                  `}
                >
                  {sort.label}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </Card>

      {/* Search Results */}
      {results && (
        <Card className="p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">
              Search Results ({results.total} found)
            </h3>
            {results.searchTime > 0 && (
              <p className="text-sm text-muted-foreground">
                Search completed in {results.searchTime}ms
              </p>
            )}
          </div>

          {results.documents.length > 0 ? (
            <div className="space-y-4">
              {results.documents.map((doc) => (
                <div key={doc.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getDocumentIcon(doc.type)}
                      <h4 className="font-semibold">{doc.title}</h4>
                      <Badge className={getTypeColor(doc.type)} variant="outline">
                        {doc.type}
                      </Badge>
                      {doc.score && (
                        <Badge variant="secondary" className="text-xs">
                          Score: {doc.score}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <p 
                    className="text-sm text-muted-foreground mb-3"
                    dangerouslySetInnerHTML={{ 
                      __html: highlightText(
                        doc.content.substring(0, 200) + (doc.content.length > 200 ? '...' : ''),
                        doc.highlights || []
                      )
                    }}
                  />
                  
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    {doc.metadata.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {doc.metadata.location}
                      </span>
                    )}
                    {doc.metadata.date && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(doc.metadata.date).toLocaleDateString()}
                      </span>
                    )}
                    {doc.metadata.salary && (
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        {doc.metadata.salary}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No results found</p>
              {results.suggestions && results.suggestions.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground mb-2">Did you mean:</p>
                  <div className="flex justify-center gap-2">
                    {results.suggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="text-sm text-primary hover:underline"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>
      )}
    </div>
  );
};
