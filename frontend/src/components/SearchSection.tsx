import type { FormEvent } from 'react';
import type { SearchFilters } from '../types/api';

const LANGUAGES = [
  '',
  'Python',
  'JavaScript',
  'TypeScript',
  'Go',
  'Rust',
  'Java',
  'C++',
  'Ruby',
  'PHP',
  'Swift',
  'Kotlin',
];

const LICENSES = [
  '',
  'MIT',
  'Apache-2.0',
  'GPL-3.0',
  'BSD-3-Clause',
  'ISC',
  'MPL-2.0',
  'LGPL-3.0',
  'Unlicense',
];

interface SearchSectionProps {
  goal: string;
  filters: SearchFilters;
  loading: boolean;
  onGoalChange: (goal: string) => void;
  onFiltersChange: (filters: SearchFilters) => void;
  onSearch: () => void;
}

export function SearchSection({
  goal,
  filters,
  loading,
  onGoalChange,
  onFiltersChange,
  onSearch,
}: SearchSectionProps) {
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (goal.trim() && !loading) {
      onSearch();
    }
  };

  return (
    <section className="panel search-panel">
      <form onSubmit={handleSubmit}>
        <label htmlFor="goal-input" className="search-label">
          Business Goal
        </label>
        <div className="search-row">
          <input
            id="goal-input"
            type="text"
            className="search-input"
            placeholder='e.g. "Find AI frameworks for sponsorship"'
            value={goal}
            onChange={(e) => onGoalChange(e.target.value)}
            disabled={loading}
          />
          <button type="submit" className="btn btn-primary" disabled={loading || !goal.trim()}>
            {loading ? (
              <>
                <span className="spinner" />
                Discovering…
              </>
            ) : (
              'Discover'
            )}
          </button>
        </div>

        <div className="filters-row">
          <div className="filter-group">
            <label htmlFor="filter-language">Language</label>
            <select
              id="filter-language"
              value={filters.language ?? ''}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  language: e.target.value || undefined,
                })
              }
              disabled={loading}
            >
              {LANGUAGES.map((lang) => (
                <option key={lang || 'any'} value={lang}>
                  {lang || 'Any language'}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="filter-stars">Minimum Stars</label>
            <input
              id="filter-stars"
              type="number"
              min={0}
              step={100}
              placeholder="e.g. 1000"
              value={filters.min_stars ?? ''}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  min_stars: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              disabled={loading}
            />
          </div>

          <div className="filter-group">
            <label htmlFor="filter-license">License</label>
            <select
              id="filter-license"
              value={filters.license ?? ''}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  license: e.target.value || undefined,
                })
              }
              disabled={loading}
            >
              {LICENSES.map((license) => (
                <option key={license || 'any'} value={license}>
                  {license || 'Any license'}
                </option>
              ))}
            </select>
          </div>
        </div>
      </form>
    </section>
  );
}
