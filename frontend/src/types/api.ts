export type AgentStageName =
  | 'Planner'
  | 'GitHub Search'
  | 'Analysis'
  | 'Community'
  | 'Recommendation';

export type StageStatus = 'waiting' | 'running' | 'done';

export interface AgentStage {
  name: AgentStageName;
  status: StageStatus;
}

export interface SearchFilters {
  language?: string;
  min_stars?: number;
  license?: string;
}

export interface SearchRequest {
  objective: string;
  language?: string;
  min_stars?: number;
  license?: string;
}

export interface SearchResponse {
  results: {
    repo: Repository;
    analysis: any;
    community: any;
    recommendation: {
      action: string;
      confidence: number;
      reasons: string[];
    };
  }[];
}

export type SearchJobStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface SearchStatusResponse {
  search_id: string;
  status: SearchJobStatus;
  stages: AgentStage[];
  error?: string;
}

export interface Repository {
  id: string;
  name: string;
  full_name: string;
  stars: number;
  forks: number;
  language: string | null;
  license: string | null;
  description: string | null;
  url: string;
}

export interface Recommendation {
  id: string;
  repo_name: string;
  recommended_action: string;
  confidence: number;
  reasoning: string;
  status?: 'pending' | 'approved' | 'rejected';
}

export interface SearchResultsResponse {
  search_id: string;
  goal: string;
  filters: SearchFilters;
  repositories: Repository[];
  recommendations: Recommendation[];
}

export interface HistoryEntry {
  id: string;
  goal: string;
  filters: SearchFilters;
  created_at: string;
  status: SearchJobStatus;
  repository_count: number;
  recommendation_count: number;
}

export interface HistoryResponse {
  searches: HistoryEntry[];
}

export interface RecommendationActionResponse {
  id: string;
  status: 'approved' | 'rejected';
}
