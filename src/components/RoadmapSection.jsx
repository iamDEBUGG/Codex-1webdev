import { RoadmapItem } from "./Common.jsx";

export function RoadmapSection() {
  return (
    <section className="roadmap" aria-label="Development roadmap">
      <div className="section-heading">
        <p className="eyebrow">Stable build model</p>
        <h2>Roadmap-ready architecture.</h2>
      </div>
      <div className="roadmap-grid">
        <RoadmapItem title="Phase 1" detail="Auth, expense CRUD, dashboard layout, mock safety data." />
        <RoadmapItem title="Phase 2" detail="MongoDB models, Express APIs, JWT protection, validation." />
        <RoadmapItem title="Phase 3" detail="Analytics aggregation, budget alerts, country search APIs." />
        <RoadmapItem title="Phase 4" detail="Production deployment, tests, accessibility and performance checks." />
      </div>
    </section>
  );
}
