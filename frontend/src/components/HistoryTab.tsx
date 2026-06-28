import type { HistoryEntry } from '../types/api';

interface HistoryTabProps {
  entries: HistoryEntry[];
  loading: boolean;
  error: string | null;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onRefresh: () => void;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function statusClass(status: HistoryEntry['status']): string {
  return `history-status history-status-${status}`;
}

export function HistoryTab({
  entries,
  loading,
  error,
  selectedId,
  onSelect,
  onRefresh,
}: HistoryTabProps) {
  return (
    <section className="panel history-panel">
      <div className="panel-header">
        <h2>Search History</h2>
        <button type="button" className="btn btn-ghost" onClick={onRefresh}>
          Refresh
        </button>
      </div>

      {loading && <p className="empty-state">Loading history…</p>}
      {error && <p className="error-message">{error}</p>}

      {!loading && !error && entries.length === 0 && (
        <p className="empty-state">No previous searches yet. Run your first discovery above.</p>
      )}

      {!loading && entries.length > 0 && (
        <ul className="history-list">
          {entries.map((entry) => (
            <li key={entry.id}>
              <button
                type="button"
                className={`history-item ${selectedId === entry.id ? 'selected' : ''}`}
                onClick={() => onSelect(entry.id)}
              >
                <div className="history-item-top">
                  <span className="history-goal">{entry.goal}</span>
                  <span className={statusClass(entry.status)}>{entry.status}</span>
                </div>
                <div className="history-item-meta">
                  <span>{formatDate(entry.created_at)}</span>
                  <span>
                    {entry.repository_count} repos · {entry.recommendation_count} recs
                  </span>
                </div>
                {(entry.filters.language ||
                  entry.filters.min_stars ||
                  entry.filters.license) && (
                  <div className="history-filters">
                    {entry.filters.language && (
                      <span className="tag tag-language">{entry.filters.language}</span>
                    )}
                    {entry.filters.min_stars != null && (
                      <span className="tag">≥ {entry.filters.min_stars} stars</span>
                    )}
                    {entry.filters.license && (
                      <span className="tag tag-license">{entry.filters.license}</span>
                    )}
                  </div>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
