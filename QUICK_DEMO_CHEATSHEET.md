# TravAid Quick Demo Cheatsheet

Use this 5 minutes before your presentation.

## Start The App

```bash
npm run build
npm run preview
```

Open:

```text
http://127.0.0.1:4173
```

If it says refused to connect, run `npm run preview` again.

## 30-Second Intro

TravAid is a travel-focused expense tracker. It helps users manage spending and compare destination safety from one dashboard. It uses React for UI, Recharts for analytics, Three.js for the 3D globe, and localStorage for saving expenses in the browser.

## Demo Order

1. Home/Dashboard:
   - Show TravAid title.
   - Explain total spent, average expense, budget alerts, safe countries.

2. Expenses:
   - Add a new expense.
   - Show it appears in the table.
   - Mention totals and charts update because data is state-driven.

3. Analytics:
   - Pie chart shows spending by category.
   - Line chart shows monthly spending trend.

4. Travel Safety:
   - Select a country card.
   - Show safety score, factors, positives, advisories.
   - Drag the globe.
   - Select a globe marker.

5. Future Scope:
   - Authentication.
   - MongoDB backend.
   - Real safety APIs.
   - Edit/delete expenses.
   - Multi-currency.

## Most Important Functions

- `App()`:
  Main component. Holds expenses, form data, selected country, and renders all sections.

- `updateExpenseForm()`:
  Updates form input state.

- `addExpense()`:
  Validates and adds new expense.

- `loadStoredExpenses()`:
  Loads saved expenses from localStorage.

- `buildCategoryTotals()`:
  Converts expense data into pie chart data.

- `CountrySafetyPanel()`:
  Displays selected country safety details.

- `TravelGlobe()`:
  Builds interactive Three.js globe.

- `latLonToVector3()`:
  Converts latitude/longitude into 3D marker position.

## If Teacher Asks "Where Is Data Coming From?"

Say:

> Currently data comes from `src/data/mockData.js`. It is structured like API data so we can later replace it with backend responses from MongoDB or a travel safety API.

## If Teacher Asks "How Does Add Expense Work?"

Say:

> The form values are stored in React state. On submit, the app validates the values, creates a new expense object with a unique ID, adds it to the expenses array, and React automatically updates the table, totals, and charts.

## If Teacher Asks "How Does The Globe Work?"

Say:

> Three.js creates a WebGL scene with Earth, clouds, and country markers. Each country has latitude and longitude. `latLonToVector3()` converts those coordinates into 3D positions on the sphere. A raycaster detects marker clicks and updates the selected country.

## Safe Live Changes

Add a country:

- Edit `src/data/mockData.js`.
- Add object inside `safetyCountries`.
- Include `code`, `name`, `region`, `lat`, `lon`, `score`, `level`, `factors`, `positives`, `advisories`.

Add expense category:

- Edit `src/data/mockData.js`.
- Add item inside `expenseCategories`.
- Dropdown and chart update automatically.

Change monthly budget:

- Edit `src/App.jsx`.
- Find `totalSpent / 60000`.
- Change `60000` to new budget amount.

After change:

```bash
npm run build
```

## Do Not Break These

- Expense `amount` must be a number.
- Country `code` must be unique.
- Country `level` should be `Low`, `Medium`, or `High`.
- Country must have `lat` and `lon` for globe marker.
- Do not delete Three.js cleanup code.

## Strong Final Line

TravAid is built with a modular structure, so expense data, travel safety data, charts, and globe visualization can evolve independently without breaking the whole app.
