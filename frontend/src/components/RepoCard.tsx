import type { Repository } from '../types/api';

interface RepoCardProps {
  repo: Repository;
}

function formatCount(value: number): string {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}k`;
  }
  return String(value);
}

export function RepoCard({ repo }: RepoCardProps) {
  return (
    <article className="repo-card">
      <div className="repo-card-header">
        <a
          href={repo.url}
          target="_blank"
          rel="noopener noreferrer"
          className="repo-name"
        >
          {repo.full_name || repo.name}
        </a>
        <div className="repo-meta">
          <span className="meta-chip">
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.75.75 0 0 1-1.088.791L8 13.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z" />
            </svg>
            {formatCount(repo.stars)}
          </span>
          <span className="meta-chip">
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="M5 3.25a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5ZM3.25 5.5a1.75 1.75 0 1 1 3.5 0 1.75 1.75 0 0 1-3.5 0ZM5 11.25a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5ZM3.25 13.5a1.75 1.75 0 1 1 3.5 0 1.75 1.75 0 0 1-3.5 0ZM10.75 5.5a2.25 2.25 0 1 1 4.5 0 2.25 2.25 0 0 1-4.5 0ZM12.5 3.25a1.75 1.75 0 1 0 0 3.5 1.75 1.75 0 0 0 0-3.5ZM10.75 11.25a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5ZM12.5 13.5a1.75 1.75 0 1 0 0 3.5 1.75 1.75 0 0 0 0-3.5Z" />
            </svg>
            {formatCount(repo.forks)}
          </span>
        </div>
      </div>

      <p className="repo-description">
        {repo.description || 'No description available.'}
      </p>

      <div className="repo-tags">
        {repo.language && <span className="tag tag-language">{repo.language}</span>}
        {repo.license && <span className="tag tag-license">{repo.license}</span>}
      </div>
    </article>
  );
}
