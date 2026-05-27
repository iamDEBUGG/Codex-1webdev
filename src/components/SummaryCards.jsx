import { AlertTriangle, BarChart3, CircleDollarSign, ShieldCheck } from "lucide-react";
import { formatCurrency } from "../utils/expenseUtils.js";
import { MetricCard } from "./Common.jsx";

export function SummaryCards({ totalSpent, averageExpense, budgetUsed, expenseCount, selectedCountry, alerts }) {
  return (
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
        detail={`Across ${expenseCount} entries`}
      />
      <MetricCard icon={ShieldCheck} title="Safety Score" value="82/100" detail={`${selectedCountry.name} selected`} />
      <MetricCard icon={AlertTriangle} title="Budget Alerts" value={alerts} detail="Travel category needs review" />
    </section>
  );
}
