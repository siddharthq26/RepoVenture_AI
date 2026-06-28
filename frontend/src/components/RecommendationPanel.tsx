import type { Recommendation } from '../types/api';

interface RecommendationPanelProps {
  recommendations: Recommendation[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  actionLoadingId: string | null;
}

export function RecommendationPanel({
  recommendations,
  onApprove,
  onReject,
  actionLoadingId,
}: RecommendationPanelProps) {
  return (
    <section className="panel recommendation-panel">
      <div className="panel-header">
        <h2>Recommendations</h2>
        <span className="panel-count">{recommendations.length}</span>
      </div>

      {recommendations.length === 0 ? (
        <p className="empty-state">
          Recommendations will appear here once the agent completes analysis.
        </p>
      ) : (
        <div className="recommendation-list">
          {recommendations.map((rec) => {
            const isLoading = actionLoadingId === rec.id;
            const isResolved = rec.status === 'approved' || rec.status === 'rejected';

            return (
              <article
                key={rec.id}
                className={`recommendation-card ${rec.status ? `rec-${rec.status}` : ''}`}
              >
                <div className="rec-header">
                  <span className="rec-repo">{rec.repo_name}</span>
                  <div className="confidence-meter">
                    <div className="confidence-bar">
                      <div
                        className="confidence-fill"
                        style={{ width: `${rec.confidence}%` }}
                      />
                    </div>
                    <span className="confidence-value">{rec.confidence}%</span>
                  </div>
                </div>

                <p className="rec-action">{rec.recommended_action}</p>
                <p className="rec-reasoning">{rec.reasoning}</p>

                {isResolved ? (
                  <div className={`rec-status-badge rec-status-${rec.status}`}>
                    {rec.status === 'approved' ? 'Approved' : 'Rejected'}
                  </div>
                ) : (
                  <div className="rec-actions">
                    <button
                      type="button"
                      className="btn btn-approve"
                      disabled={isLoading}
                      onClick={() => onApprove(rec.id)}
                    >
                      {isLoading ? 'Processing…' : 'Approve'}
                    </button>
                    <button
                      type="button"
                      className="btn btn-reject"
                      disabled={isLoading}
                      onClick={() => onReject(rec.id)}
                    >
                      Reject
                    </button>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
