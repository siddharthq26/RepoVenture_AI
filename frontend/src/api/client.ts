import type {
  HistoryResponse,
  RecommendationActionResponse,
  SearchRequest,
  SearchResponse,
  SearchResultsResponse,
  SearchStatusResponse,
} from '../types/api';

const API_BASE_URL = 'http://localhost:8000';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const message = await response.text().catch(() => response.statusText);
    throw new Error(message || `Request failed with status ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export function startSearch(payload: SearchRequest): Promise<SearchResponse> {
  return request<SearchResponse>('/api/search', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function getSearchStatus(searchId: string): Promise<SearchStatusResponse> {
  return request<SearchStatusResponse>(`/api/search/${searchId}/status`);
}

export function getSearchResults(searchId: string): Promise<SearchResultsResponse> {
  return request<SearchResultsResponse>(`/api/search/${searchId}/results`);
}

export function approveRecommendation(
  recommendationId: string,
): Promise<RecommendationActionResponse> {
  return request<RecommendationActionResponse>(
    `/api/recommendations/${recommendationId}/approve`,
    { method: 'POST' },
  );
}

export function rejectRecommendation(
  recommendationId: string,
): Promise<RecommendationActionResponse> {
  return request<RecommendationActionResponse>(
    `/api/recommendations/${recommendationId}/reject`,
    { method: 'POST' },
  );
}

export function getSearchHistory(): Promise<HistoryResponse> {
  return request<HistoryResponse>('/api/history');
}

export function getHistorySearch(searchId: string): Promise<SearchResultsResponse> {
  return request<SearchResultsResponse>(`/api/history/${searchId}`);
}
