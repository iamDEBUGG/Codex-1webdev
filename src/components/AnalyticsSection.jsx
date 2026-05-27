import {
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

export function AnalyticsSection({ categoryData, trendData }) {
  return (
    <section className="workspace" id="analytics">
      <div className="section-heading">
        <p className="eyebrow">Analytics</p>
        <h2>Turn expenses into decisions.</h2>
      </div>
      <div className="chart-grid">
        <CategoryChart data={categoryData} />
        <TrendChart data={trendData} />
      </div>
    </section>
  );
}

function CategoryChart({ data }) {
  return (
    <div className="chart-panel">
      <h3>Category breakdown</h3>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie data={data} dataKey="value" innerRadius={62} outerRadius={92} paddingAngle={4}>
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

function TrendChart({ data }) {
  return (
    <div className="chart-panel">
      <h3>Monthly trend</h3>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#d7dde3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="spent" stroke="#0f766e" strokeWidth={3} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
