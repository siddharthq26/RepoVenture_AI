import type { AgentStage } from '../types/api';

const STAGE_ORDER = [
  'Planner',
  'GitHub Search',
  'Analysis',
  'Community',
  'Recommendation',
] as const;

interface AgentStatusPanelProps {
  stages: AgentStage[];
  isActive: boolean;
}

function statusLabel(status: AgentStage['status']): string {
  switch (status) {
    case 'running':
      return 'Running';
    case 'done':
      return 'Done';
    default:
      return 'Waiting';
  }
}

export function AgentStatusPanel({ stages, isActive }: AgentStatusPanelProps) {
  const stageMap = new Map(stages.map((stage) => [stage.name, stage.status]));

  return (
    <section className="panel agent-panel">
      <div className="panel-header">
        <h2>Agent Pipeline</h2>
        {isActive && (
          <span className="live-badge">
            <span className="live-dot" />
            Live
          </span>
        )}
      </div>

      <div className="pipeline">
        {STAGE_ORDER.map((name, index) => {
          const status = stageMap.get(name) ?? 'waiting';

          return (
            <div key={name} className="pipeline-step">
              <div className={`stage-node stage-${status}`}>
                <span className="stage-index">{index + 1}</span>
              </div>
              <div className="stage-info">
                <span className="stage-name">{name}</span>
                <span className={`stage-status stage-status-${status}`}>
                  {statusLabel(status)}
                </span>
              </div>
              {index < STAGE_ORDER.length - 1 && (
                <div className={`stage-connector ${status === 'done' ? 'done' : ''}`} />
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
