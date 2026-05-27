export function Stat({ icon: Icon, label, value }) {
  return (
    <div className="stat">
      <Icon size={18} />
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export function MetricCard({ icon: Icon, title, value, detail }) {
  return (
    <article className="metric-card">
      <Icon size={22} />
      <span>{title}</span>
      <strong>{value}</strong>
      <p>{detail}</p>
    </article>
  );
}

export function SafetyBadge({ level, score }) {
  return <span className={`safety-badge ${level.toLowerCase()}`}>{score}</span>;
}

export function RoadmapItem({ title, detail }) {
  return (
    <article className="roadmap-item">
      <strong>{title}</strong>
      <p>{detail}</p>
    </article>
  );
}
