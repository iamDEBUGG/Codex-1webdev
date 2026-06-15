/**
 * Smart Expense AI — Rules-based budget intelligence engine.
 *
 * Pure functions that analyze expense arrays and produce structured
 * recommendations. No external API calls, runs entirely client-side.
 */

import { expenseCategories } from "../data/mockData.js";
import { formatCurrency, monthlyBudget } from "./expenseUtils.js";

/* ── Reference ratios for travel budget allocation ── */

const budgetRatios = {
  comfort:  { accommodation: 0.35, food: 0.20, transport: 0.18, activities: 0.15, emergency: 0.12 },
  balanced: { accommodation: 0.28, food: 0.22, transport: 0.20, activities: 0.18, emergency: 0.12 },
  budget:   { accommodation: 0.20, food: 0.25, transport: 0.22, activities: 0.20, emergency: 0.13 },
};

/* ── Typical category share baselines (% of total) ── */

const typicalShares = {
  "Food & Dining": 0.25,
  "Travel & Transportation": 0.22,
  "Bills & Subscriptions": 0.12,
  "Health & Wellness": 0.08,
  "Entertainment": 0.13,
  "Shopping": 0.12,
  "Other": 0.08,
};

/* ── Alternative suggestion database ── */

const alternativeDb = {
  "Travel & Transportation": [
    { option: "Public transit pass", saving: "50-70%", tradeoff: "Less convenience, more time" },
    { option: "Shared ride or carpool", saving: "30-50%", tradeoff: "Fixed schedule, slight detour" },
    { option: "Walking or cycling", saving: "100%", tradeoff: "Limited range, weather-dependent" },
  ],
  "Food & Dining": [
    { option: "Cook at accommodation", saving: "60-80%", tradeoff: "Requires kitchen access and time" },
    { option: "Street food or local markets", saving: "40-60%", tradeoff: "Less variety, seating" },
    { option: "Meal prep for the day", saving: "50-65%", tradeoff: "Needs planning and storage" },
  ],
  "Bills & Subscriptions": [
    { option: "Annual plan instead of monthly", saving: "15-30%", tradeoff: "Upfront commitment" },
    { option: "Family or shared plan", saving: "25-50%", tradeoff: "Shared account access" },
    { option: "Free tier or open-source alternative", saving: "100%", tradeoff: "Fewer features" },
  ],
  "Entertainment": [
    { option: "Free local events or parks", saving: "100%", tradeoff: "Less structured experience" },
    { option: "Matinee or off-peak tickets", saving: "30-50%", tradeoff: "Limited timing" },
    { option: "Museum free-entry days", saving: "100%", tradeoff: "Crowded, specific dates only" },
  ],
  "Health & Wellness": [
    { option: "Home workout or free outdoor exercise", saving: "80-100%", tradeoff: "No equipment or guidance" },
    { option: "Community health clinics", saving: "40-60%", tradeoff: "Longer wait times" },
    { option: "Generic medication", saving: "30-70%", tradeoff: "Same active ingredient, different brand" },
  ],
  "Shopping": [
    { option: "Local markets instead of malls", saving: "20-40%", tradeoff: "Less variety, no returns" },
    { option: "Wait for seasonal sales", saving: "30-60%", tradeoff: "Delayed purchase" },
    { option: "Second-hand or thrift stores", saving: "50-80%", tradeoff: "Limited selection" },
  ],
  "Other": [
    { option: "Consolidate miscellaneous into tracked categories", saving: "10-20%", tradeoff: "Requires reclassification effort" },
    { option: "Set a weekly misc-spending cap", saving: "15-30%", tradeoff: "Needs discipline" },
  ],
};

/* ═══════════════════════════════════════════════════════
   Public API
   ═══════════════════════════════════════════════════════ */

/**
 * Analyze current expenses against a target budget.
 * Returns structured breakdown with warnings for overspend.
 */
export function analyzeBudget(expenses, targetBudget = monthlyBudget) {
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const remaining = targetBudget - totalSpent;
  const usedPercent = Math.min(Math.round((totalSpent / targetBudget) * 100), 100);

  const categoryTotals = buildCategoryMap(expenses);
  const breakdown = expenseCategories.map((cat) => {
    const spent = categoryTotals[cat.name] || 0;
    const share = totalSpent > 0 ? Math.round((spent / totalSpent) * 100) : 0;
    const typical = Math.round((typicalShares[cat.name] || 0.1) * 100);
    const status = share > typical + 10 ? "over" : share < typical - 5 ? "under" : "normal";
    return { category: cat.name, spent, share, typical, status, color: cat.color };
  }).filter((b) => b.spent > 0);

  let summary;
  if (usedPercent >= 90) {
    summary = `You've used ${usedPercent}% of your ${formatCurrency(targetBudget)} budget. Spending is critical — consider pausing non-essential expenses.`;
  } else if (usedPercent >= 70) {
    summary = `${usedPercent}% of your budget is spent (${formatCurrency(totalSpent)} of ${formatCurrency(targetBudget)}). You have ${formatCurrency(remaining)} left — watch high-spend categories.`;
  } else {
    summary = `You're at ${usedPercent}% budget usage with ${formatCurrency(remaining)} remaining. Spending looks healthy.`;
  }

  const overCategories = breakdown.filter((b) => b.status === "over");
  const warnings = overCategories.map(
    (b) => `${b.category} is at ${b.share}% of your spending (typical: ~${b.typical}%).`
  );

  return {
    type: "budget-analysis",
    summary,
    breakdown,
    warnings,
    stats: { totalSpent, remaining, usedPercent, expenseCount: expenses.length },
    confidence: expenses.length >= 10 ? "High" : expenses.length >= 4 ? "Medium" : "Low",
  };
}

/**
 * Scan expenses for savings opportunities.
 */
export function findSavings(expenses) {
  if (expenses.length === 0) {
    return {
      type: "savings",
      summary: "No expenses recorded yet. Add some expenses first, and I'll find ways to save.",
      opportunities: [],
      totalPotential: 0,
      confidence: "Low",
    };
  }

  const opportunities = [];
  const categoryTotals = buildCategoryMap(expenses);
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);

  // 1. Find the biggest single expense
  const biggest = [...expenses].sort((a, b) => b.amount - a.amount)[0];
  if (biggest && biggest.amount > totalSpent * 0.25) {
    opportunities.push({
      title: "Large single expense detected",
      detail: `"${biggest.name}" at ${formatCurrency(biggest.amount)} is ${Math.round((biggest.amount / totalSpent) * 100)}% of your total spending.`,
      suggestion: "Look for alternatives or split this cost over time.",
      potentialSaving: Math.round(biggest.amount * 0.3),
      priority: "high",
    });
  }

  // 2. Check for subscription clustering
  const subExpenses = expenses.filter((e) => e.category === "Bills & Subscriptions");
  if (subExpenses.length >= 2) {
    const subTotal = subExpenses.reduce((sum, e) => sum + e.amount, 0);
    opportunities.push({
      title: `${subExpenses.length} active subscriptions found`,
      detail: `Total subscription spend: ${formatCurrency(subTotal)}. Check for overlapping services (e.g., multiple streaming or music services).`,
      suggestion: "Audit each subscription — cancel unused ones or switch to annual billing for 15-30% savings.",
      potentialSaving: Math.round(subTotal * 0.25),
      priority: subExpenses.length >= 3 ? "high" : "medium",
    });
  }

  // 3. Category overspend vs. baseline
  Object.entries(categoryTotals).forEach(([category, spent]) => {
    const typicalShare = typicalShares[category] || 0.1;
    const actualShare = spent / totalSpent;
    if (actualShare > typicalShare + 0.12 && spent > 500) {
      opportunities.push({
        title: `${category} is above typical levels`,
        detail: `You're spending ${Math.round(actualShare * 100)}% here vs. a typical ${Math.round(typicalShare * 100)}%.`,
        suggestion: `Review recent ${category.toLowerCase()} expenses for items you can reduce or replace.`,
        potentialSaving: Math.round(spent * 0.2),
        priority: "medium",
      });
    }
  });

  // 4. Frequent small expenses
  const smallExpenses = expenses.filter((e) => e.amount < 200);
  if (smallExpenses.length >= 5) {
    const smallTotal = smallExpenses.reduce((sum, e) => sum + e.amount, 0);
    opportunities.push({
      title: "Frequent small purchases add up",
      detail: `${smallExpenses.length} expenses under ${formatCurrency(200)} total ${formatCurrency(smallTotal)}.`,
      suggestion: "Try batching small purchases or setting a daily spending cap.",
      potentialSaving: Math.round(smallTotal * 0.15),
      priority: "low",
    });
  }

  const totalPotential = opportunities.reduce((sum, o) => sum + o.potentialSaving, 0);

  return {
    type: "savings",
    summary: opportunities.length > 0
      ? `Found ${opportunities.length} saving opportunity${opportunities.length > 1 ? "ies" : "y"} with up to ${formatCurrency(totalPotential)} potential savings.`
      : "Your spending looks efficient — no major savings opportunities detected right now.",
    opportunities,
    totalPotential,
    confidence: expenses.length >= 8 ? "High" : "Medium",
  };
}

/**
 * Suggest alternatives for a given expense category.
 */
export function suggestAlternatives(category) {
  const alternatives = alternativeDb[category] || alternativeDb["Other"];
  return {
    type: "alternatives",
    summary: `Here are cheaper alternatives for ${category}:`,
    alternatives,
    confidence: "Medium",
  };
}

/**
 * Generate quick spending insights from current data.
 */
export function getSpendingInsights(expenses) {
  if (expenses.length === 0) {
    return {
      type: "insights",
      summary: "No expense data to analyze yet. Start tracking to get insights.",
      insights: [],
      confidence: "Low",
    };
  }

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const avgExpense = Math.round(totalSpent / expenses.length);
  const categoryTotals = buildCategoryMap(expenses);

  // Top category
  const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];

  // Biggest single
  const biggest = [...expenses].sort((a, b) => b.amount - a.amount)[0];

  // Date range
  const dates = expenses
    .map((e) => new Date(`${e.date}T00:00:00`))
    .filter((d) => !Number.isNaN(d.getTime()))
    .sort((a, b) => a - b);
  const daySpan = dates.length >= 2
    ? Math.max(1, Math.ceil((dates[dates.length - 1] - dates[0]) / 86400000))
    : 1;
  const dailyAvg = Math.round(totalSpent / daySpan);

  const insights = [
    { label: "Total spent", value: formatCurrency(totalSpent) },
    { label: "Average per expense", value: formatCurrency(avgExpense) },
    { label: "Daily average", value: `${formatCurrency(dailyAvg)} / day` },
    { label: "Top category", value: `${topCategory[0]} (${formatCurrency(topCategory[1])})` },
    { label: "Biggest expense", value: `${biggest.name} (${formatCurrency(biggest.amount)})` },
    { label: "Tracking period", value: `${daySpan} day${daySpan !== 1 ? "s" : ""}` },
    { label: "Expense count", value: `${expenses.length} items` },
  ];

  const velocity = totalSpent / daySpan;
  const projectedMonthly = Math.round(velocity * 30);
  const budgetStatus = projectedMonthly > monthlyBudget
    ? `At this rate, you'd spend ~${formatCurrency(projectedMonthly)}/month — over your ${formatCurrency(monthlyBudget)} budget.`
    : `Projected monthly spend: ~${formatCurrency(projectedMonthly)} — within your ${formatCurrency(monthlyBudget)} budget.`;

  return {
    type: "insights",
    summary: budgetStatus,
    insights,
    confidence: expenses.length >= 8 ? "High" : expenses.length >= 3 ? "Medium" : "Low",
  };
}

/**
 * Generate a full travel budget plan for a destination.
 */
export function generateBudgetPlan(destination, totalBudget, style = "balanced") {
  const budget = Number(totalBudget);
  if (!budget || budget <= 0) {
    return {
      type: "budget-plan",
      summary: "Please provide a valid budget amount.",
      plan: [],
      confidence: "Low",
    };
  }

  if (budget < 2000) {
    return {
      type: "budget-plan",
      summary: `${formatCurrency(budget)} is very tight for a travel budget. Minimum viable budget for most destinations starts around ${formatCurrency(5000)}.`,
      plan: [],
      confidence: "Low",
    };
  }

  const ratios = budgetRatios[style] || budgetRatios.balanced;
  const plan = Object.entries(ratios).map(([category, ratio]) => ({
    category: category.charAt(0).toUpperCase() + category.slice(1),
    allocated: Math.round(budget * ratio),
    percentage: Math.round(ratio * 100),
    tips: getCategoryTips(category, style),
  }));

  const styleLabel = style === "comfort" ? "Comfort-first" : style === "budget" ? "Budget-optimized" : "Balanced";

  return {
    type: "budget-plan",
    summary: `${styleLabel} plan for ${destination || "your trip"}: ${formatCurrency(budget)} total, including a ${plan.find((p) => p.category === "Emergency")?.percentage || 12}% emergency reserve.`,
    plan,
    totalBudget: budget,
    style: styleLabel,
    destination: destination || "Your destination",
    confidence: "Medium",
  };
}

/* ═══════════════════════════════════════════════════════
   Internal helpers
   ═══════════════════════════════════════════════════════ */

function buildCategoryMap(expenses) {
  const map = {};
  expenses.forEach((e) => {
    map[e.category] = (map[e.category] || 0) + e.amount;
  });
  return map;
}

function getCategoryTips(category, style) {
  const tips = {
    accommodation: {
      comfort: "Hotels with good reviews, central location",
      balanced: "Mix of hotels and well-rated Airbnbs",
      budget: "Hostels, guesthouses, or budget Airbnbs",
    },
    food: {
      comfort: "Mix of restaurants and local dining",
      balanced: "Local restaurants, some street food, occasional cooking",
      budget: "Street food, markets, self-catering when possible",
    },
    transport: {
      comfort: "Pre-booked transfers, ride apps, some taxis",
      balanced: "Public transit with occasional ride apps",
      budget: "Public transit, walking, shared rides",
    },
    activities: {
      comfort: "Guided tours, priority-access tickets",
      balanced: "Self-guided tours, free attractions mixed with paid",
      budget: "Free walking tours, parks, museums on free days",
    },
    emergency: {
      comfort: "Buffer for unexpected upgrades or medical needs",
      balanced: "Safety net for delays, lost items, or health",
      budget: "Essential reserve — do not skip this",
    },
  };
  return tips[category]?.[style] || tips[category]?.balanced || "";
}
