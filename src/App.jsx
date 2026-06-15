import { useEffect, useMemo, useState } from "react";
import { AnalyticsSection } from "./components/AnalyticsSection.jsx";
import { ExpenseSection } from "./components/ExpenseSection.jsx";
import { Header } from "./components/Header.jsx";
import { HeroSection } from "./components/HeroSection.jsx";
import { RoadmapSection } from "./components/RoadmapSection.jsx";
import { SmartExpenseAI } from "./components/SmartExpenseAI.jsx";
import { SummaryCards } from "./components/SummaryCards.jsx";
import { TravelSafetySection } from "./components/TravelSafetySection.jsx";
import { safetyCountries as staticCountries } from "./data/mockData.js";
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
import { fetchSafetyCountries } from "./utils/travelApi.js";

function App() {
  const [expenses, setExpenses] = useState(loadStoredExpenses);
  const [expenseForm, setExpenseForm] = useState(emptyExpenseForm);
  const [countries, setCountries] = useState(staticCountries);
  const [selectedCountryCode, setSelectedCountryCode] = useState(staticCountries[0].code);

  // Load live safety data on mount
  useEffect(() => {
    fetchSafetyCountries().then((liveCountries) => {
      setCountries(liveCountries);
      // If the currently selected country exists in live data, keep it; otherwise select the first
      if (!liveCountries.some((c) => c.code === selectedCountryCode)) {
        setSelectedCountryCode(liveCountries[0]?.code || staticCountries[0].code);
      }
    });
  }, []);

  const selectedCountry =
    countries.find((country) => country.code === selectedCountryCode) || countries[0];
  const safeCountries = countries.filter((country) => country.level === "Low").length;
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
        countries={countries}
        selectedCountry={selectedCountry}
        onSelectCountry={setSelectedCountryCode}
      />
      <RoadmapSection />
      <SmartExpenseAI expenses={expenses} />
    </main>
  );
}

export default App;
