import { Activity, ArrowRight, Plus, ShieldCheck, WalletCards } from "lucide-react";
import { formatCurrency } from "../utils/expenseUtils.js";
import { Stat } from "./Common.jsx";

export function HeroSection({ totalSpent, budgetUsed, expenseCount, safeCountries, alerts }) {
  return (
    <section className="hero" id="dashboard">
      <div className="hero-copy">
        <p className="eyebrow">Expense tracking with travel intelligence</p>
        <h1>RoamSense</h1>
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
      <div className="hero-panel" aria-label="RoamSense overview">
        <div className="status-strip">
          <span>May budget</span>
          <strong>{budgetUsed}% used</strong>
        </div>
        <div className="hero-metric">
          <span>Total spent</span>
          <strong>{formatCurrency(totalSpent)}</strong>
        </div>
        <div className="mini-grid">
          <Stat icon={WalletCards} label="Expenses" value={expenseCount} />
          <Stat icon={ShieldCheck} label="Safe picks" value={safeCountries} />
          <Stat icon={Activity} label="Alerts" value={alerts} />
        </div>
      </div>
    </section>
  );
}
