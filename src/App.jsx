import { useEffect, useMemo, useState } from "react";
import { AnalyticsSection } from "./components/AnalyticsSection.jsx";
import { ExpenseSection } from "./components/ExpenseSection.jsx";
import { Header } from "./components/Header.jsx";
import { HeroSection } from "./components/HeroSection.jsx";
import { RoadmapSection } from "./components/RoadmapSection.jsx";
import { SummaryCards } from "./components/SummaryCards.jsx";
import { TravelSafetySection } from "./components/TravelSafetySection.jsx";
import { safetyCountries } from "./data/mockData.js";
import {
  buildCategoryTotals,
  buildMonthlyTrend,
  calculateExpenseSummary,
  createExpense,
  emptyExpenseForm,
  loadStoredExpenses,
  resetStoredExpenses,
  saveExpenses
} from "./utils/expenseUtils.js";

function App() {
  const [expenses, setExpenses] = useState(loadStoredExpenses);
  const [expenseForm, setExpenseForm] = useState(emptyExpenseForm);
  const [selectedCountryCode, setSelectedCountryCode] = useState(safetyCountries[0].code);

  const selectedCountry =
    safetyCountries.find((country) => country.code === selectedCountryCode) || safetyCountries[0];
  const safeCountries = safetyCountries.filter((country) => country.level === "Low").length;
  const summary = calculateExpenseSummary(expenses);
  const chartCategories = useMemo(() => buildCategoryTotals(expenses), [expenses]);
  const trendData = useMemo(() => buildMonthlyTrend(expenses), [expenses]);

  useEffect(() => {
    saveExpenses(expenses);
  }, [expenses]);

  function updateExpenseForm(event) {
    const { name, value } = event.target;
    setExpenseForm((currentForm) => ({ ...currentForm, [name]: value }));
  }

  function addExpense(event) {
    event.preventDefault();
    const newExpense = createExpense(expenseForm);
    if (!newExpense) return;

    setExpenses((currentExpenses) => [newExpense, ...currentExpenses]);
    setExpenseForm(emptyExpenseForm);
  }

  function deleteExpense(id) {
    setExpenses((currentExpenses) => currentExpenses.filter((e) => e.id !== id));
  }

  function resetExpenses() {
    const defaults = resetStoredExpenses();
    setExpenses(defaults);
  }

  return (
    <main className="app-shell">
      <Header />
      <HeroSection
        totalSpent={summary.totalSpent}
        budgetUsed={summary.budgetUsed}
        expenseCount={expenses.length}
        safeCountries={safeCountries}
        alerts={summary.alerts}
      />
      <SummaryCards
        totalSpent={summary.totalSpent}
        averageExpense={summary.averageExpense}
        budgetUsed={summary.budgetUsed}
        expenseCount={expenses.length}
        selectedCountry={selectedCountry}
        alerts={summary.alerts}
      />
      <ExpenseSection
        form={expenseForm}
        expenses={expenses}
        onFormChange={updateExpenseForm}
        onSubmit={addExpense}
        onDelete={deleteExpense}
        onReset={resetExpenses}
      />
      <AnalyticsSection categoryData={chartCategories} trendData={trendData} />
      <TravelSafetySection
        countries={safetyCountries}
        selectedCountry={selectedCountry}
        onSelectCountry={setSelectedCountryCode}
      />
      <RoadmapSection />
    </main>
  );
}

export default App;
