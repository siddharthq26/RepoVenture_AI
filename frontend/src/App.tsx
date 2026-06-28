import { useCallback, useEffect, useState } from 'react';
import {
  approveRecommendation,
  getHistorySearch,
  getSearchHistory,
  rejectRecommendation,
  startSearch,
} from './api/client';
import { AgentStatusPanel } from './components/AgentStatusPanel';
import { HistoryTab } from './components/HistoryTab';
import { RecommendationPanel } from './components/RecommendationPanel';
import { RepoCard } from './components/RepoCard';
import { SearchSection } from './components/SearchSection';
import type {
  AgentStage,
  HistoryEntry,
  Recommendation,
  Repository,
  SearchFilters,
} from './types/api';

type Tab = 'discover' | 'history';

const DEFAULT_STAGES: AgentStage[] = [
  { name: 'Planner', status: 'waiting' },
  { name: 'GitHub Search', status: 'waiting' },
  { name: 'Analysis', status: 'waiting' },
  { name: 'Community', status: 'waiting' },
  { name: 'Recommendation', status: 'waiting' },
];


function App() {
  const [activeTab, setActiveTab] = useState<Tab>('discover');
  const [goal, setGoal] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({});
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [currentSearchId, setCurrentSearchId] = useState<string | null>(null);
  const [stages, setStages] = useState<AgentStage[]>(DEFAULT_STAGES);
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const [historyEntries, setHistoryEntries] = useState<HistoryEntry[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);


  const handleSearch = async () => {
    setSearchError(null);
    setSearchLoading(true);
    setRepositories([]);
    setRecommendations([]);
    setStages(DEFAULT_STAGES.map((s) => ({ ...s, status: 'running' })));
    setSelectedHistoryId(null);
    setActiveTab('discover');

    try {
      const response = await startSearch({
        objective: goal.trim(),
        language: filters.language,
        min_stars: filters.min_stars,
        license: filters.license,
      });

      const repos: Repository[] = response.results.map((item) => ({
        id: item.repo.full_name || item.repo.name,
        name: item.repo.name,
        full_name: item.repo.full_name,
        stars: item.repo.stars,
        forks: item.repo.forks,
        language: item.repo.language,
        license: item.repo.license,
        description: item.repo.description,
        url: item.repo.url,
      }));

      const recs: Recommendation[] = response.results.map((item, index) => ({
        id: `${item.repo.name}_${index}`,
        repo_name: item.repo.name,
        recommended_action: item.recommendation.action,
        confidence: item.recommendation.confidence,
        reasoning: item.recommendation.reasons.join('\n'),
        status: 'pending',
      }));

      setRepositories(repos);
      setRecommendations(recs);
      setStages(DEFAULT_STAGES.map((s) => ({ ...s, status: 'done' })));
      setSearchLoading(false);
    } catch (err) {
      setSearchLoading(false);
      setSearchError(err instanceof Error ? err.message : 'Failed to search.');
    }
  };

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    setHistoryError(null);
    try {
      const data = await getSearchHistory();
      setHistoryEntries(data.searches);
    } catch (err) {
      setHistoryError(err instanceof Error ? err.message : 'Failed to load history.');
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  const handleHistorySelect = async (searchId: string) => {
    setSelectedHistoryId(searchId);
    setSearchError(null);
    setSearchLoading(false);

    try {
      const results = await getHistorySearch(searchId);
      setCurrentSearchId(searchId);
      setGoal(results.goal);
      setFilters(results.filters);
      setRepositories(results.repositories);
      setRecommendations(results.recommendations);
      setStages(DEFAULT_STAGES.map((s) => ({ ...s, status: 'done' })));
      setActiveTab('discover');
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : 'Failed to load search.');
    }
  };

  const handleApprove = async (id: string) => {
    setActionLoadingId(id);
    try {
      const response = await approveRecommendation(id);
      setRecommendations((prev) =>
        prev.map((rec) => (rec.id === id ? { ...rec, status: response.status } : rec)),
      );
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : 'Failed to approve recommendation.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (id: string) => {
    setActionLoadingId(id);
    try {
      const response = await rejectRecommendation(id);
      setRecommendations((prev) =>
        prev.map((rec) => (rec.id === id ? { ...rec, status: response.status } : rec)),
      );
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : 'Failed to reject recommendation.');
    } finally {
      setActionLoadingId(null);
    }
  };

  useEffect(() => {
    if (activeTab === 'history') {
      void loadHistory();
    }
  }, [activeTab, loadHistory]);


  return (
    <div className="app">
      <header className="header">
        <div className="header-brand">
          <div className="logo-mark">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <div>
            <h1>RepoVenture AI</h1>
            <p>AI-powered open source discovery</p>
          </div>
        </div>

        <nav className="tab-nav">
          <button
            type="button"
            className={`tab-btn ${activeTab === 'discover' ? 'active' : ''}`}
            onClick={() => setActiveTab('discover')}
          >
            Discover
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            History
          </button>
        </nav>
      </header>

      <main className="main">
        {activeTab === 'discover' ? (
          <>
            <SearchSection
              goal={goal}
              filters={filters}
              loading={searchLoading}
              onGoalChange={setGoal}
              onFiltersChange={setFilters}
              onSearch={handleSearch}
            />

            {searchError && (
              <div className="error-banner" role="alert">
                {searchError}
              </div>
            )}

            <div className="dashboard-grid">
              <div className="dashboard-left">
                <AgentStatusPanel stages={stages} isActive={searchLoading} />

                <section className="panel results-panel">
                  <div className="panel-header">
                    <h2>Repositories</h2>
                    <span className="panel-count">{repositories.length}</span>
                  </div>

                  {repositories.length === 0 ? (
                    <p className="empty-state">
                      {searchLoading
                        ? 'Searching GitHub for matching repositories…'
                        : 'Run a discovery search to see repository results.'}
                    </p>
                  ) : (
                    <div className="repo-grid">
                      {repositories.map((repo) => (
                        <RepoCard key={repo.id} repo={repo} />
                      ))}
                    </div>
                  )}
                </section>
              </div>

              <div className="dashboard-right">
                <RecommendationPanel
                  recommendations={recommendations}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  actionLoadingId={actionLoadingId}
                />
              </div>
            </div>

            {currentSearchId && (
              <p className="search-id-footer">Search ID: {currentSearchId}</p>
            )}
          </>
        ) : (
          <HistoryTab
            entries={historyEntries}
            loading={historyLoading}
            error={historyError}
            selectedId={selectedHistoryId}
            onSelect={handleHistorySelect}
            onRefresh={loadHistory}
          />
        )}
      </main>
    </div>
  );
}

export default App;
