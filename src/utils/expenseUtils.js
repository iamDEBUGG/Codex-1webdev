import {
  expenseCategories,
  monthlyTrend,
  recentExpenses,
} from "../data/mockData.js";

export const monthlyBudget = 60000;
export const expensesStorageKey = "travaid.expenses";

export const emptyExpenseForm = {
  amount: "",
  category: "Travel & Transportation",
  date: "2026-05-01",
  description: "",
};

export function loadStoredExpenses() {
  try {
    const storedExpenses = localStorage.getItem(expensesStorageKey);
    if (!storedExpenses) return recentExpenses;

    const parsedExpenses = JSON.parse(storedExpenses);
    return Array.isArray(parsedExpenses) && parsedExpenses.every(isExpense)
      ? parsedExpenses
      : recentExpenses;
  } catch {
    return recentExpenses;
  }
}

export function saveExpenses(expenses) {
  localStorage.setItem(expensesStorageKey, JSON.stringify(expenses));
}

export function resetStoredExpenses() {
  localStorage.removeItem(expensesStorageKey);
  return recentExpenses;
}

export function createExpense(form) {
  const amount = Number(form.amount);
  const description = form.description.trim();

  if (!amount || amount <= 0 || !description || !form.date) {
    return null;
  }

  return {
    id: crypto.randomUUID(),
    name: description,
    category: form.category,
    date: form.date,
    amount,
  };
}

export function calculateExpenseSummary(expenses) {
  const totalSpent = expenses.reduce(
    (total, expense) => total + expense.amount,
    0,
  );
  const averageExpense = expenses.length
    ? Math.round(totalSpent / expenses.length)
    : 0;
  const budgetUsed = Math.min(
    Math.round((totalSpent / monthlyBudget) * 100),
    100,
  );
  const alerts =
    budgetUsed >= 90 ? 3 : budgetUsed >= 75 ? 2 : budgetUsed >= 60 ? 1 : 0;

  return { totalSpent, averageExpense, budgetUsed, alerts };
}

export function buildCategoryTotals(expenses) {
  return expenseCategories.map((category) => ({
    ...category,
    value: expenses
      .filter((expense) => expense.category === category.name)
      .reduce((total, expense) => total + expense.amount, 0),
  }));
}

export function buildMonthlyTrend(expenses) {
  const totalsByMonth = new Map(
    monthlyTrend.map((month) => [month.month, 0]),
  );

  expenses.forEach((expense) => {
    const date = new Date(`${expense.date}T00:00:00`);
    if (Number.isNaN(date.getTime())) return;

    const monthName = new Intl.DateTimeFormat("en-IN", {
      month: "short",
    }).format(date);
    totalsByMonth.set(
      monthName,
      (totalsByMonth.get(monthName) || 0) + expense.amount,
    );
  });

  return monthlyTrend.map((month) => ({
    ...month,
    spent: totalsByMonth.get(month.month) || 0,
  }));
}

export function formatCurrency(value) {
  return `Rs ${Number(value).toLocaleString("en-IN")}`;
}

export function formatDate(value) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
  }).format(new Date(`${value}T00:00:00`));
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
