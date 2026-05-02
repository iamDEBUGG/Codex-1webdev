import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  CircleDollarSign,
  Globe2,
  HeartPulse,
  MapPin,
  Plane,
  Plus,
  Search,
  ShieldCheck,
  WalletCards
} from "lucide-react";
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
import { TravelGlobe } from "./components/TravelGlobe.jsx";
import { expenseCategories, monthlyTrend, recentExpenses as initialExpenses, safetyCountries } from "./data/mockData.js";

const navItems = ["Dashboard", "Expenses", "Analytics", "Travel Safety"];
const expensesStorageKey = "travaid.expenses";
const defaultForm = {
  amount: "",
  category: "Travel & Transportation",
  date: "2026-05-01",
  description: ""
};

function App() {
  const [expenses, setExpenses] = useState(loadStoredExpenses);
  const [expenseForm, setExpenseForm] = useState(defaultForm);
  const [selectedCountryCode, setSelectedCountryCode] = useState(safetyCountries[0].code);
  const selectedCountry = safetyCountries.find((country) => country.code === selectedCountryCode) || safetyCountries[0];
  const totalSpent = expenses.reduce((total, expense) => total + expense.amount, 0);
  const averageExpense = expenses.length ? Math.round(totalSpent / expenses.length) : 0;
  const budgetUsed = Math.min(Math.round((totalSpent / 60000) * 100), 100);
  const alerts = budgetUsed >= 90 ? 3 : budgetUsed >= 75 ? 2 : budgetUsed >= 60 ? 1 : 0;
  const safeCountries = safetyCountries.filter((country) => country.level === "Low").length;
  const chartCategories = useMemo(() => buildCategoryTotals(expenses), [expenses]);
  const trendData = useMemo(() => {
    const mayTotal = expenses.reduce((total, expense) => {
      const date = new Date(`${expense.date}T00:00:00`);
      return date.getMonth() === 4 ? total + expense.amount : total;
    }, 0);
    return monthlyTrend.map((month) => (month.month === "May" ? { ...month, spent: mayTotal } : month));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem(expensesStorageKey, JSON.stringify(expenses));
  }, [expenses]);

  const handleExpenseChange = (event) => {
    const { name, value } = event.target;
    setExpenseForm((current) => ({ ...current, [name]: value }));
  };

  const handleExpenseSubmit = (event) => {
    event.preventDefault();
    const amount = Number(expenseForm.amount);
    const description = expenseForm.description.trim();

    if (!amount || amount <= 0 || !description || !expenseForm.date) {
      return;
    }

    setExpenses((current) => [
      {
        id: crypto.randomUUID(),
        name: description,
        category: expenseForm.category,
        date: expenseForm.date,
        amount
      },
      ...current
    ]);
    setExpenseForm(defaultForm);
  };

  return (
    <main className="app-shell">
      <header className="topbar" aria-label="Main navigation">
        <a className="brand" href="#dashboard" aria-label="TravAid home">
          <span className="brand-mark">
            <Plane size={20} />
          </span>
          <span>TravAid</span>
        </a>
        <nav className="nav-links">
          {navItems.map((item) => (
            <a key={item} href={`#${item.toLowerCase().replaceAll(" ", "-")}`}>
              {item}
            </a>
          ))}
        </nav>
        <button className="icon-button" aria-label="Search">
          <Search size={19} />
        </button>
      </header>

      <section className="hero" id="dashboard">
        <div className="hero-copy">
          <p className="eyebrow">Expense tracking with travel intelligence</p>
          <h1>TravAid</h1>
          <p className="hero-text">
            Plan trips with confidence, track spending in real time, and compare country safety signals from one calm,
            focused dashboard.
          </p>
          <div className="hero-actions">
            <a className="primary-action" href="#expenses">
              <Plus size={18} />
              Add expense
            </a>
            <a className="secondary-action" href="#travel-safety">
              Explore safety
              <ArrowRight size={18} />
            </a>
          </div>
        </div>
        <div className="hero-panel" aria-label="TravAid overview">
          <div className="status-strip">
            <span>May budget</span>
            <strong>{budgetUsed}% used</strong>
          </div>
          <div className="hero-metric">
            <span>Total spent</span>
            <strong>{formatCurrency(totalSpent)}</strong>
          </div>
          <div className="mini-grid">
            <Stat icon={WalletCards} label="Expenses" value={expenses.length} />
            <Stat icon={ShieldCheck} label="Safe picks" value={safeCountries} />
            <Stat icon={Activity} label="Alerts" value={alerts} />
          </div>
        </div>
      </section>

      <section className="summary-grid" aria-label="Project summary">
        <MetricCard
          icon={CircleDollarSign}
          title="Monthly Spend"
          value={formatCurrency(totalSpent)}
          detail={`${budgetUsed}% of May budget used`}
        />
        <MetricCard
          icon={BarChart3}
          title="Average Expense"
          value={formatCurrency(averageExpense)}
          detail={`Across ${expenses.length} entries`}
        />
        <MetricCard icon={ShieldCheck} title="Safety Score" value="82/100" detail={`${selectedCountry.name} selected`} />
        <MetricCard icon={AlertTriangle} title="Budget Alerts" value={alerts} detail="Travel category needs review" />
      </section>

      <section className="workspace" id="expenses">
        <div className="section-heading">
          <p className="eyebrow">Expense management</p>
          <h2>Capture spending without slowing down.</h2>
        </div>
        <div className="expense-layout">
          <form className="expense-form" onSubmit={handleExpenseSubmit}>
            <label>
              Amount
              <input
                type="number"
                name="amount"
                min="1"
                placeholder="2500"
                value={expenseForm.amount}
                onChange={handleExpenseChange}
                required
              />
            </label>
            <label>
              Category
              <select name="category" value={expenseForm.category} onChange={handleExpenseChange}>
                {expenseCategories.map((category) => (
                  <option key={category.name}>{category.name}</option>
                ))}
              </select>
            </label>
            <label>
              Date
              <input type="date" name="date" value={expenseForm.date} onChange={handleExpenseChange} required />
            </label>
            <label>
              Description
              <input
                type="text"
                name="description"
                placeholder="Airport transfer"
                value={expenseForm.description}
                onChange={handleExpenseChange}
                required
              />
            </label>
            <button className="primary-action" type="submit">
              <Plus size={18} />
              Save expense
            </button>
          </form>
          <div className="table-wrap">
            <div className="table-toolbar">
              <strong>Recent expenses</strong>
              <button className="icon-button" aria-label="Filter expenses">
                <Search size={18} />
              </button>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => (
                  <tr key={expense.id}>
                    <td>{expense.name}</td>
                    <td>{expense.category}</td>
                    <td>{formatDate(expense.date)}</td>
                    <td>{formatCurrency(expense.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="workspace" id="analytics">
        <div className="section-heading">
          <p className="eyebrow">Analytics</p>
          <h2>Turn expenses into decisions.</h2>
        </div>
        <div className="chart-grid">
          <div className="chart-panel">
            <h3>Category breakdown</h3>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={chartCategories} dataKey="value" innerRadius={62} outerRadius={92} paddingAngle={4}>
                  {chartCategories.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="chart-panel">
            <h3>Monthly trend</h3>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#d7dde3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="spent" stroke="#0f766e" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="travel-section" id="travel-safety">
        <div className="travel-copy">
          <p className="eyebrow">Travel safety</p>
          <h2>Country safety, mapped on a living globe.</h2>
          <p>
            Select a country card or tap a marker on the globe to see what is influencing the safety score.
          </p>
          <CountrySafetyPanel country={selectedCountry} />
          <div className="country-list" aria-label="Country safety ranking">
            {safetyCountries.map((country) => (
              <button
                key={country.code}
                className={`country-card ${country.code === selectedCountry.code ? "selected" : ""}`}
                type="button"
                onClick={() => setSelectedCountryCode(country.code)}
              >
                <div>
                  <strong>{country.name}</strong>
                  <span>
                    <MapPin size={14} />
                    {country.region}
                  </span>
                </div>
                <SafetyBadge level={country.level} score={country.score} />
              </button>
            ))}
          </div>
        </div>
        <div className="globe-stage">
          <TravelGlobe
            countries={safetyCountries}
            selectedCountryCode={selectedCountry.code}
            onSelectCountry={setSelectedCountryCode}
          />
          <div className="globe-caption">
            <Globe2 size={18} />
            Drag the globe or select a marker to inspect country safety.
          </div>
        </div>
      </section>

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
    </main>
  );
}

function loadStoredExpenses() {
  try {
    const storedExpenses = localStorage.getItem(expensesStorageKey);
    if (!storedExpenses) {
      return initialExpenses;
    }

    const parsedExpenses = JSON.parse(storedExpenses);
    return Array.isArray(parsedExpenses) && parsedExpenses.every(isExpense) ? parsedExpenses : initialExpenses;
  } catch {
    return initialExpenses;
  }
}

function isExpense(expense) {
  return (
    expense &&
    typeof expense.id !== "undefined" &&
    typeof expense.name === "string" &&
    typeof expense.category === "string" &&
    typeof expense.date === "string" &&
    typeof expense.amount === "number"
  );
}
function Stat({ icon: Icon, label, value }) {
  return (
    <div className="stat">
      <Icon size={18} />
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function MetricCard({ icon: Icon, title, value, detail }) {
  return (
    <article className="metric-card">
      <Icon size={22} />
      <span>{title}</span>
      <strong>{value}</strong>
      <p>{detail}</p>
    </article>
  );
}

function SafetyBadge({ level, score }) {
  return <span className={`safety-badge ${level.toLowerCase()}`}>{score}</span>;
}

function RoadmapItem({ title, detail }) {
  return (
    <article className="roadmap-item">
      <strong>{title}</strong>
      <p>{detail}</p>
    </article>
  );
}

function CountrySafetyPanel({ country }) {
  return (
    <article className="safety-panel">
      <div className="safety-panel-header">
        <div>
          <span>{country.region}</span>
          <h3>{country.name}</h3>
        </div>
        <SafetyBadge level={country.level} score={country.score} />
      </div>
      <div className="factor-grid" aria-label={`Safety factors for ${country.name}`}>
        {Object.entries(country.factors).map(([label, value]) => (
          <div className="factor-meter" key={label}>
            <div>
              <span>{toTitleCase(label)}</span>
              <strong>{value}</strong>
            </div>
            <meter min="0" max="100" value={value} />
          </div>
        ))}
      </div>
      <div className="safety-notes">
        <SafetyNote icon={ShieldCheck} title="Positive signals" items={country.positives} />
        <SafetyNote icon={HeartPulse} title="Advisories" items={country.advisories} />
      </div>
    </article>
  );
}

function SafetyNote({ icon: Icon, title, items }) {
  return (
    <div className="safety-note">
      <h4>
        <Icon size={16} />
        {title}
      </h4>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function buildCategoryTotals(expenses) {
  return expenseCategories.map((category) => ({
    ...category,
    value: expenses
      .filter((expense) => expense.category === category.name)
      .reduce((total, expense) => total + expense.amount, 0)
  }));
}

function formatCurrency(value) {
  return `Rs ${Number(value).toLocaleString("en-IN")}`;
}

function formatDate(value) {
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short" }).format(new Date(`${value}T00:00:00`));
}

function toTitleCase(value) {
  return value.replace(/^\w/, (letter) => letter.toUpperCase());
}

export default App;
