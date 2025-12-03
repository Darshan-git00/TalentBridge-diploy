// Advanced Search - Full-text search capabilities

export interface SearchDocument {
  id: string;
  type: 'drive' | 'student' | 'company' | 'application' | 'job' | 'resume';
  title: string;
  content: string;
  metadata: {
    [key: string]: any;
    tags?: string[];
    category?: string;
    location?: string;
    skills?: string[];
    experience?: string;
    education?: string;
    salary?: string;
    date?: string;
    author?: string;
    status?: string;
  };
  score?: number;
  highlights?: string[];
}

export interface SearchQuery {
  query: string;
  type?: SearchDocument['type'] | 'all';
  filters: {
    location?: string[];
    skills?: string[];
    experience?: string[];
    education?: string[];
    salary?: string[];
    dateRange?: {
      start: string;
      end: string;
    };
    category?: string[];
    status?: string[];
  };
  sort: {
    field: 'relevance' | 'date' | 'title' | 'salary';
    order: 'asc' | 'desc';
  };
  pagination: {
    page: number;
    limit: number;
  };
}

export interface SearchResult {
  documents: SearchDocument[];
  total: number;
  page: number;
  totalPages: number;
  facets: {
    [key: string]: {
      [value: string]: number;
    };
  };
  suggestions?: string[];
  searchTime: number;
}

export class AdvancedSearch {
  private static documents: Map<string, SearchDocument> = new Map();
  private static index: Map<string, Set<string>> = new Map(); // word -> document IDs
  private static stopWords = new Set([
    'a', 'an', 'and', 'are', 'as', 'at', 'be', 'but', 'by', 'for', 'if',
    'in', 'into', 'is', 'it', 'no', 'not', 'of', 'on', 'or', 'such',
    'that', 'the', 'their', 'then', 'there', 'these', 'they', 'this',
    'to', 'was', 'will', 'with', 'have', 'has', 'had', 'been', 'being'
  ]);

  // Add document to search index
  static addDocument(document: SearchDocument) {
    this.documents.set(document.id, document);
    this.indexDocument(document);
  }

  // Add multiple documents
  static addDocuments(documents: SearchDocument[]) {
    documents.forEach(doc => this.addDocument(doc));
  }

  // Remove document from index
  static removeDocument(documentId: string) {
    const document = this.documents.get(documentId);
    if (document) {
      this.unindexDocument(document);
      this.documents.delete(documentId);
    }
  }

  // Update document in index
  static updateDocument(document: SearchDocument) {
    this.removeDocument(document.id);
    this.addDocument(document);
  }

  // Main search function
  static search(query: SearchQuery): SearchResult {
    const startTime = performance.now();
    
    // Parse and process query
    const processedQuery = this.processQuery(query.query);
    
    // Get initial candidate documents
    let candidates = this.getCandidateDocuments(processedQuery, query.type);
    
    // Apply filters
    candidates = this.applyFilters(candidates, query.filters);
    
    // Calculate relevance scores
    candidates = this.calculateRelevance(candidates, processedQuery);
    
    // Sort results
    candidates = this.sortResults(candidates, query.sort);
    
    // Apply pagination
    const startIndex = (query.pagination.page - 1) * query.pagination.limit;
    const endIndex = startIndex + query.pagination.limit;
    const paginatedResults = candidates.slice(startIndex, endIndex);
    
    // Generate facets
    const facets = this.generateFacets(candidates);
    
    // Generate suggestions if no results
    const suggestions = paginatedResults.length === 0 ? 
      this.generateSuggestions(query.query) : undefined;
    
    const searchTime = performance.now() - startTime;
    
    return {
      documents: paginatedResults,
      total: candidates.length,
      page: query.pagination.page,
      totalPages: Math.ceil(candidates.length / query.pagination.limit),
      facets,
      suggestions,
      searchTime: Math.round(searchTime * 100) / 100
    };
  }

  // Quick search with simplified interface
  static quickSearch(
    query: string,
    type: SearchDocument['type'] | 'all' = 'all',
    limit: number = 10
  ): SearchResult {
    return this.search({
      query,
      type: type || 'all',
      filters: {},
      sort: { field: 'relevance', order: 'desc' },
      pagination: { page: 1, limit }
    });
  }

  // Get search suggestions
  static getSuggestions(query: string, limit: number = 5): string[] {
    const processedQuery = this.processQuery(query);
    const suggestions = new Set<string>();
    
    // Find documents that contain similar terms
    this.documents.forEach(doc => {
      const words = this.tokenize(doc.content + ' ' + doc.title);
      words.forEach(word => {
        if (this.isSimilar(word, processedQuery.terms[0]) && word !== processedQuery.terms[0]) {
          suggestions.add(word);
        }
      });
    });
    
    return Array.from(suggestions).slice(0, limit);
  }

  // Get popular search terms
  static getPopularTerms(limit: number = 10): string[] {
    const termCounts = new Map<string, number>();
    
    this.index.forEach((docIds, term) => {
      termCounts.set(term, docIds.size);
    });
    
    return Array.from(termCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([term]) => term);
  }

  // Get search statistics
  static getStatistics() {
    const totalDocs = this.documents.size;
    const typeStats = new Map<SearchDocument['type'], number>();
    const termStats = this.index.size;
    
    this.documents.forEach(doc => {
      typeStats.set(doc.type, (typeStats.get(doc.type) || 0) + 1);
    });
    
    return {
      totalDocuments: totalDocs,
      totalTerms: termStats,
      documentsByType: Object.fromEntries(typeStats),
      averageDocumentLength: this.calculateAverageDocumentLength()
    };
  }

  // Private helper methods
  private static indexDocument(document: SearchDocument) {
    const text = document.title + ' ' + document.content;
    const terms = this.tokenize(text);
    
    terms.forEach(term => {
      if (!this.index.has(term)) {
        this.index.set(term, new Set());
      }
      this.index.get(term)!.add(document.id);
    });
  }

  private static unindexDocument(document: SearchDocument) {
    const text = document.title + ' ' + document.content;
    const terms = this.tokenize(text);
    
    terms.forEach(term => {
      const docIds = this.index.get(term);
      if (docIds) {
        docIds.delete(document.id);
        if (docIds.size === 0) {
          this.index.delete(term);
        }
      }
    });
  }

  private static tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 1 && !this.stopWords.has(word));
  }

  private static processQuery(query: string) {
    const terms = this.tokenize(query);
    const phrases = this.extractPhrases(query);
    
    return {
      terms,
      phrases,
      original: query
    };
  }

  private static extractPhrases(query: string): string[] {
    const phrases: string[] = [];
    const regex = /"([^"]+)"/g;
    let match;
    
    while ((match = regex.exec(query)) !== null) {
      phrases.push(match[1].toLowerCase());
    }
    
    return phrases;
  }

  private static getCandidateDocuments(
    processedQuery: { terms: string[]; phrases: string[] },
    type: SearchDocument['type'] | 'all'
  ): SearchDocument[] {
    if (processedQuery.terms.length === 0 && processedQuery.phrases.length === 0) {
      return Array.from(this.documents.values()).filter(doc => 
        type === 'all' || doc.type === type
      );
    }
    
    // Find documents matching terms
    let candidateIds = new Set<string>();
    
    processedQuery.terms.forEach(term => {
      const docIds = this.index.get(term);
      if (docIds) {
        if (candidateIds.size === 0) {
          candidateIds = new Set(docIds);
        } else {
          // Intersection for AND logic
          candidateIds = new Set([...candidateIds].filter(id => docIds.has(id)));
        }
      }
    });
    
    // Find documents matching phrases
    processedQuery.phrases.forEach(phrase => {
      const phraseDocs = Array.from(this.documents.values()).filter(doc => {
        const text = (doc.title + ' ' + doc.content).toLowerCase();
        return text.includes(phrase);
      });
      
      if (candidateIds.size === 0) {
        phraseDocs.forEach(doc => candidateIds.add(doc.id));
      } else {
        candidateIds = new Set([...candidateIds].filter(id => 
          phraseDocs.some(doc => doc.id === id)
        ));
      }
    });
    
    return Array.from(candidateIds)
      .map(id => this.documents.get(id)!)
      .filter(doc => type === 'all' || doc.type === type);
  }

  private static applyFilters(
    documents: SearchDocument[],
    filters: SearchQuery['filters']
  ): SearchDocument[] {
    return documents.filter(doc => {
      // Location filter
      if (filters.location && filters.location.length > 0) {
        const docLocation = doc.metadata.location?.toLowerCase();
        if (!docLocation || !filters.location.some(loc => 
          docLocation.includes(loc.toLowerCase())
        )) {
          return false;
        }
      }
      
      // Skills filter
      if (filters.skills && filters.skills.length > 0) {
        const docSkills = (doc.metadata.skills || []).map(s => s.toLowerCase());
        if (!filters.skills.some(skill => 
          docSkills.some(docSkill => docSkill.includes(skill.toLowerCase()))
        )) {
          return false;
        }
      }
      
      // Experience filter
      if (filters.experience && filters.experience.length > 0) {
        const docExperience = doc.metadata.experience?.toLowerCase();
        if (!docExperience || !filters.experience.some(exp => 
          docExperience.includes(exp.toLowerCase())
        )) {
          return false;
        }
      }
      
      // Education filter
      if (filters.education && filters.education.length > 0) {
        const docEducation = doc.metadata.education?.toLowerCase();
        if (!docEducation || !filters.education.some(edu => 
          docEducation.includes(edu.toLowerCase())
        )) {
          return false;
        }
      }
      
      // Salary filter
      if (filters.salary && filters.salary.length > 0) {
        const docSalary = doc.metadata.salary?.toLowerCase();
        if (!docSalary || !filters.salary.some(sal => 
          docSalary.includes(sal.toLowerCase())
        )) {
          return false;
        }
      }
      
      // Date range filter
      if (filters.dateRange) {
        const docDate = new Date(doc.metadata.date || '');
        const startDate = new Date(filters.dateRange.start);
        const endDate = new Date(filters.dateRange.end);
        
        if (docDate < startDate || docDate > endDate) {
          return false;
        }
      }
      
      // Category filter
      if (filters.category && filters.category.length > 0) {
        const docCategory = doc.metadata.category?.toLowerCase();
        if (!docCategory || !filters.category.some(cat => 
          docCategory.includes(cat.toLowerCase())
        )) {
          return false;
        }
      }
      
      // Status filter
      if (filters.status && filters.status.length > 0) {
        const docStatus = doc.metadata.status?.toLowerCase();
        if (!docStatus || !filters.status.some(stat => 
          docStatus.includes(stat.toLowerCase())
        )) {
          return false;
        }
      }
      
      return true;
    });
  }

  private static calculateRelevance(
    documents: SearchDocument[],
    processedQuery: { terms: string[]; phrases: string[] }
  ): SearchDocument[] {
    return documents.map(doc => {
      let score = 0;
      const highlights: string[] = [];
      const text = (doc.title + ' ' + doc.content).toLowerCase();
      
      // Score term matches
      processedQuery.terms.forEach(term => {
        const termCount = (text.match(new RegExp(term, 'g')) || []).length;
        score += termCount * (doc.title.toLowerCase().includes(term) ? 2 : 1);
        
        if (termCount > 0) {
          highlights.push(term);
        }
      });
      
      // Score phrase matches (higher weight)
      processedQuery.phrases.forEach(phrase => {
        if (text.includes(phrase)) {
          score += 5;
          highlights.push(phrase);
        }
      });
      
      // Boost recent documents
      if (doc.metadata.date) {
        const daysSince = (Date.now() - new Date(doc.metadata.date).getTime()) / (1000 * 60 * 60 * 24);
        score += Math.max(0, 1 - daysSince / 365) * 2;
      }
      
      return {
        ...doc,
        score: Math.round(score * 100) / 100,
        highlights: [...new Set(highlights)]
      };
    });
  }

  private static sortResults(
    documents: SearchDocument[],
    sort: SearchQuery['sort']
  ): SearchDocument[] {
    const sorted = [...documents];
    
    switch (sort.field) {
      case 'relevance':
        sorted.sort((a, b) => (b.score || 0) - (a.score || 0));
        break;
      case 'date':
        sorted.sort((a, b) => {
          const dateA = new Date(a.metadata.date || 0);
          const dateB = new Date(b.metadata.date || 0);
          return sort.order === 'asc' ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
        });
        break;
      case 'title':
        sorted.sort((a, b) => {
          const comparison = a.title.localeCompare(b.title);
          return sort.order === 'asc' ? comparison : -comparison;
        });
        break;
      case 'salary':
        sorted.sort((a, b) => {
          const salaryA = this.parseSalary(a.metadata.salary || '0');
          const salaryB = this.parseSalary(b.metadata.salary || '0');
          return sort.order === 'asc' ? salaryA - salaryB : salaryB - salaryA;
        });
        break;
    }
    
    return sorted;
  }

  private static generateFacets(documents: SearchDocument[]) {
    const facets: SearchResult['facets'] = {};
    
    // Location facets
    const locationCounts = new Map<string, number>();
    documents.forEach(doc => {
      const location = doc.metadata.location;
      if (location) {
        locationCounts.set(location, (locationCounts.get(location) || 0) + 1);
      }
    });
    facets.location = Object.fromEntries(locationCounts);
    
    // Type facets
    const typeCounts = new Map<string, number>();
    documents.forEach(doc => {
      typeCounts.set(doc.type, (typeCounts.get(doc.type) || 0) + 1);
    });
    facets.type = Object.fromEntries(typeCounts);
    
    // Category facets
    const categoryCounts = new Map<string, number>();
    documents.forEach(doc => {
      const category = doc.metadata.category;
      if (category) {
        categoryCounts.set(category, (categoryCounts.get(category) || 0) + 1);
      }
    });
    facets.category = Object.fromEntries(categoryCounts);
    
    return facets;
  }

  private static generateSuggestions(query: string): string[] {
    const suggestions = new Set<string>();
    const processedQuery = this.processQuery(query);
    
    // Find similar terms
    processedQuery.terms.forEach(term => {
      this.index.forEach((docIds, indexedTerm) => {
        if (this.isSimilar(term, indexedTerm) && term !== indexedTerm) {
          suggestions.add(indexedTerm);
        }
      });
    });
    
    return Array.from(suggestions).slice(0, 5);
  }

  private static isSimilar(term1: string, term2: string): boolean {
    // Simple similarity check - could be enhanced with Levenshtein distance
    if (term1.length === 0 || term2.length === 0) return false;
    
    // Check if one term contains the other
    if (term1.includes(term2) || term2.includes(term1)) return true;
    
    // Check if terms are close in length and share many characters
    const longer = term1.length > term2.length ? term1 : term2;
    const shorter = term1.length > term2.length ? term2 : term1;
    
    if (longer.length - shorter.length > 2) return false;
    
    let commonChars = 0;
    for (let i = 0; i < shorter.length; i++) {
      if (longer.includes(shorter[i])) {
        commonChars++;
      }
    }
    
    return commonChars / shorter.length > 0.6;
  }

  private static parseSalary(salary: string): number {
    // Extract numeric value from salary string
    const match = salary.match(/[\d,]+/);
    if (match) {
      return parseInt(match[0].replace(/,/g, ''), 10);
    }
    return 0;
  }

  private static calculateAverageDocumentLength(): number {
    if (this.documents.size === 0) return 0;
    
    let totalLength = 0;
    this.documents.forEach(doc => {
      totalLength += (doc.title + ' ' + doc.content).length;
    });
    
    return Math.round(totalLength / this.documents.size);
  }

  // Initialize with sample data
  static initializeSampleData() {
    const sampleDocuments: SearchDocument[] = [
      {
        id: 'drive-1',
        type: 'drive',
        title: 'Senior Software Engineer',
        content: 'Looking for experienced software engineer with React, Node.js, and cloud experience. Must have 5+ years of experience and a degree in Computer Science.',
        metadata: {
          location: 'San Francisco, CA',
          skills: ['React', 'Node.js', 'Cloud', 'JavaScript'],
          experience: '5+ years',
          education: 'Bachelor\'s in Computer Science',
          salary: '$120,000 - $180,000',
          date: '2024-01-15',
          category: 'Engineering',
          status: 'active'
        }
      },
      {
        id: 'drive-2',
        type: 'drive',
        title: 'Product Manager',
        content: 'Seeking product manager with experience in agile development and user research. Strong communication skills required.',
        metadata: {
          location: 'New York, NY',
          skills: ['Agile', 'User Research', 'Communication'],
          experience: '3+ years',
          education: 'Bachelor\'s degree',
          salary: '$100,000 - $150,000',
          date: '2024-01-10',
          category: 'Product',
          status: 'active'
        }
      },
      {
        id: 'student-1',
        type: 'student',
        title: 'John Doe - Computer Science Student',
        content: 'Computer Science student with experience in React, Python, and machine learning. Completed internship at tech startup.',
        metadata: {
          location: 'Boston, MA',
          skills: ['React', 'Python', 'Machine Learning'],
          experience: 'Internship experience',
          education: 'Bachelor\'s in Computer Science',
          date: '2024-01-20',
          category: 'Engineering',
          status: 'seeking'
        }
      },
      {
        id: 'company-1',
        type: 'company',
        title: 'TechCorp Inc.',
        content: 'Leading technology company specializing in cloud solutions and enterprise software. Fortune 500 company with 10,000+ employees.',
        metadata: {
          location: 'Seattle, WA',
          skills: ['Cloud', 'Enterprise Software'],
          date: '2024-01-05',
          category: 'Technology',
          status: 'hiring'
        }
      }
    ];
    
    this.addDocuments(sampleDocuments);
  }
}

// Initialize sample data
AdvancedSearch.initializeSampleData();
