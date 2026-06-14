# RoamSense College Presentation Guide

This guide is for explaining RoamSense during a project showcase or viva. Keep it open while practicing.

## 1. One-Minute Project Explanation

RoamSense is a full-stack-ready web application concept that combines two useful features in one platform:

- Expense tracking: users can add travel or daily expenses, see totals, averages, category charts, and monthly trends.
- Travel safety intelligence: users can select countries on a list or 3D globe and see safety score details, positive signals, and advisories.

The current project is a React frontend using mock data. It is designed so a MERN backend can be added later without changing the UI structure too much.

Good viva answer:

> RoamSense helps a traveler manage money and destination safety in one dashboard. The frontend is built in React with reusable components, state management using hooks, charts using Recharts, and an interactive 3D globe using Three.js.

## 2. How To Run The Project

Install dependencies:

```bash
npm install
```

Run development server:

```bash
npm run dev
```

Build production version:

```bash
npm run build
```

Run production preview:

```bash
npm run preview
```

Open:

```text
http://127.0.0.1:4173
```

If browser says "refused to connect", the server is not running. Run:

```bash
npm run preview
```

## 3. Main File Structure

```text
src/
  App.jsx
  components/
    TravelGlobe.jsx
  data/
    mockData.js
  styles.css
```

Important files:

- `src/App.jsx`: main state container. It connects all sections together.
- `src/components/Header.jsx`: top navigation bar.
- `src/components/HeroSection.jsx`: main RoamSense intro and hero stats.
- `src/components/SummaryCards.jsx`: dashboard metric cards.
- `src/components/ExpenseSection.jsx`: expense form and expense table.
- `src/components/AnalyticsSection.jsx`: category pie chart and monthly line chart.
- `src/components/TravelSafetySection.jsx`: country cards and selected-country safety details.
- `src/components/TravelGlobe.jsx`: interactive 3D Earth, country markers, drag/click behavior.
- `src/components/Common.jsx`: reusable small UI pieces like metric cards and badges.
- `src/data/mockData.js`: sample expenses, chart categories, country safety data.
- `src/utils/expenseUtils.js`: expense validation, calculations, formatting, and localStorage helpers.
- `src/styles.css`: layout, colors, responsiveness, cards, forms, travel panel styling.
- `package.json`: scripts and dependencies.

## 4. Core Technologies Used

- React: builds the user interface using components.
- React hooks:
  - `useState`: stores changing values like expenses, form data, selected country.
  - `useEffect`: runs side effects like saving expenses to localStorage and setting up Three.js.
  - `useMemo`: recalculates expensive derived values only when needed.
- Recharts: creates pie chart and line chart.
- Three.js: creates the 3D globe.
- localStorage: stores added expenses in the browser so data remains after refresh.
- Vite: fast frontend build tool.

## 5. App.jsx Function And State Map

### `App()`

This is the main React component. It controls most app behavior.

Important state:

```js
const [expenses, setExpenses] = useState(loadStoredExpenses);
const [expenseForm, setExpenseForm] = useState(defaultForm);
const [selectedCountryCode, setSelectedCountryCode] = useState(safetyCountries[0].code);
```

Meaning:

- `expenses`: all expense records shown in the table and charts.
- `expenseForm`: current values typed in the Add Expense form.
- `selectedCountryCode`: which country is selected in the travel safety section.

Derived values:

```js
const totalSpent = expenses.reduce(...);
const averageExpense = ...;
const budgetUsed = ...;
const alerts = ...;
const safeCountries = ...;
```

These are not stored separately because they can be calculated from existing data. This avoids data mismatch bugs.

Good viva answer:

> I keep base data in state, and calculate totals/charts from it. This makes the app more reliable because if expenses change, all dependent UI updates automatically.

### `updateExpenseForm(event)`

Purpose:

Updates the form state whenever the user types in amount, date, description, or changes category.

Code idea:

```js
const { name, value } = event.target;
setExpenseForm((current) => ({ ...current, [name]: value }));
```

Why `name` matters:

Each input has a `name`, like `amount`, `category`, `date`, `description`. The function uses that name to update the correct property.

If teacher asks:

> This is a generic handler. Instead of writing four different functions for four inputs, one function updates whichever field changed.

### `addExpense(event)`

Purpose:

Runs when the user submits the expense form.

It does four things:

1. Stops page reload using `event.preventDefault()`.
2. Converts amount from text to number.
3. Validates amount, description, and date.
4. Adds the new expense at the top of the expenses array.

Important code idea:

```js
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
```

Why `crypto.randomUUID()`:

It creates a unique ID for each expense, so React can track table rows correctly.

### `useEffect` For localStorage

Purpose:

Saves expenses whenever they change.

```js
useEffect(() => {
  localStorage.setItem(expensesStorageKey, JSON.stringify(expenses));
}, [expenses]);
```

If teacher asks:

> This is a side effect because it writes data outside React state, into browser storage. The dependency `[expenses]` means it runs only when expenses change.

### `loadStoredExpenses()`

File:

```text
src/utils/expenseUtils.js
```

Purpose:

Loads saved expenses from localStorage when the app starts.

If saved data is missing, invalid, or corrupted, it returns the default mock expenses.

Why important:

It prevents the app from crashing if localStorage contains bad data.

### `isExpense(expense)`

File:

```text
src/utils/expenseUtils.js
```

Purpose:

Checks whether stored expense data has the expected structure.

It confirms fields like:

- `id`
- `name`
- `category`
- `date`
- `amount`

This is a small validation layer.

### `buildCategoryTotals(expenses)`

File:

```text
src/utils/expenseUtils.js
```

Purpose:

Creates pie chart data from expenses.

It loops through each category and calculates total amount spent in that category.

If teacher asks:

> The chart is not hard-coded. It is generated from current expense data, so when a new expense is added, the chart updates.

### `formatCurrency(value)`

File:

```text
src/utils/expenseUtils.js
```

Purpose:

Formats numbers into readable rupee-style strings.

Example:

```text
5209 -> Rs 5,209
```

### `formatDate(value)`

File:

```text
src/utils/expenseUtils.js
```

Purpose:

Formats date strings into short display dates.

Example:

```text
2026-05-01 -> 01 May
```

### `CountrySafetyPanel({ country })`

File:

```text
src/components/TravelSafetySection.jsx
```

Purpose:

Displays detailed safety information for the selected country.

Shows:

- Region
- Safety score
- Factors: crime, healthcare, transport, documentation
- Positive signals
- Advisories

This panel updates when the user selects a country card or globe marker.

### `SafetyNote({ icon, title, items })`

File:

```text
src/components/TravelSafetySection.jsx
```

Purpose:

Reusable mini component for lists like:

- Positive signals
- Advisories

Good viva answer:

> I created this to avoid repeating the same list layout twice.

## 6. TravelGlobe.jsx Function Map

`TravelGlobe.jsx` handles the 3D Earth.

### Props

```js
export function TravelGlobe({ countries, selectedCountryCode, onSelectCountry })
```

Meaning:

- `countries`: array of country safety data from `mockData.js`.
- `selectedCountryCode`: currently selected country.
- `onSelectCountry`: function from `App.jsx` used to update selected country.

This is important because the globe does not own the selected country state. `App.jsx` owns it. This keeps the app predictable.

### `mountRef`

```js
const mountRef = useRef(null);
```

Purpose:

Gives Three.js access to the actual DOM element where the canvas should be inserted.

### `selectedCountryRef` and `onSelectCountryRef`

Purpose:

They keep the latest selected country and callback available inside the Three.js animation loop without rebuilding the whole 3D scene on every click.

Good viva answer:

> React state changes often, but rebuilding a 3D scene every time would be inefficient. Refs let Three.js read the latest values while keeping the scene stable.

### Three.js Setup

Main objects:

- `scene`: world container.
- `camera`: viewpoint.
- `renderer`: draws the scene into a canvas.
- `globeGroup`: group containing Earth, clouds, grid, atmosphere, and markers.

### `createEarthTexture()`

Purpose:

Creates a procedural Earth texture using an HTML canvas.

It draws:

- Ocean gradient
- Simple land masses
- Latitude/longitude grid lines

Why procedural:

No external image dependency is needed. The globe still works offline.

### `createCloudTexture()`

Purpose:

Creates transparent cloud shapes on a canvas and places them around Earth.

It uses `seededRandom()` so the clouds are stable and do not randomly change on every render.

### Country Markers

For each country:

```js
countries.forEach((country) => {
  const position = latLonToVector3(country.lat, country.lon, 1.86);
  ...
});
```

Purpose:

Places a colored marker on the globe using latitude and longitude.

Marker colors:

- Green: Low risk
- Orange: Medium risk
- Red: High risk

### `latLonToVector3(lat, lon, radius)`

Purpose:

Converts real-world latitude and longitude into a 3D position on the sphere.

If teacher asks:

> Latitude/longitude are 2D geographic coordinates. Three.js needs 3D x, y, z coordinates, so this function converts them using sphere math.

### Raycaster

Purpose:

Detects which marker the user clicked.

Important idea:

```js
raycaster.intersectObjects([...markers, ...rings], false)
```

It checks whether the mouse pointer intersects marker objects.

### Drag Interaction

Functions:

- `handlePointerDown`
- `handlePointerMove`
- `handlePointerUp`

Purpose:

Allows the user to drag and rotate the globe.

If the pointer did not move much, the app treats it as a click and selects the country marker.

### Cleanup Function

At the end of `useEffect`, there is a cleanup:

```js
return () => {
  cancelAnimationFrame(frameId);
  resizeObserver.disconnect();
  renderer.dispose();
  ...
};
```

Purpose:

Prevents memory leaks when the component unmounts.

Good viva answer:

> Three.js creates WebGL resources manually, so I clean them up when React removes the component.

## 7. mockData.js Data Model

### Expenses

Example:

```js
{
  id: 1,
  name: "Airport transfer",
  category: "Travel & Transportation",
  date: "2026-05-01",
  amount: 2500
}
```

Important:

- `amount` is a number, not a formatted string.
- Formatting happens only in the UI.

Why:

Numbers are easier to calculate totals, averages, and charts.

### Countries

Example:

```js
{
  code: "IN",
  name: "India",
  region: "South Asia",
  lat: 20.5937,
  lon: 78.9629,
  score: 76,
  level: "Medium",
  factors: { crime: 68, healthcare: 74, transport: 72, documentation: 88 },
  positives: [...],
  advisories: [...]
}
```

Important fields:

- `code`: unique country ID.
- `lat`, `lon`: marker position on globe.
- `score`: main safety score.
- `level`: Low, Medium, or High, controls marker and badge color.
- `factors`: explains the score.
- `positives`: what is good.
- `advisories`: what to be careful about.

## 8. styles.css Explanation

This file controls layout and visual design.

Main sections:

- `.topbar`: navigation bar.
- `.hero`: first large RoamSense section.
- `.summary-grid`: dashboard summary cards.
- `.expense-layout`: form and table layout.
- `.chart-grid`: analytics charts.
- `.travel-section`: dark travel safety area.
- `.country-card`: selectable country cards.
- `.safety-panel`: selected country details.
- `.globe-canvas`: size of the 3D globe area.
- Media queries: make layout responsive on small screens.

If teacher asks:

> CSS is separated from logic so component code stays focused on behavior and JSX structure.

## 9. Safe Change Recipes

### Add A New Expense Category

File:

```text
src/data/mockData.js
```

Add a new item inside `expenseCategories`:

```js
{ name: "Shopping", value: 0, color: "#db2777" }
```

Also check:

- The Add Expense dropdown will update automatically.
- The pie chart will update automatically.
- No change needed in `App.jsx` unless you want special behavior.

### Add A New Country

File:

```text
src/data/mockData.js
```

Add a country object with all required fields:

```js
{
  code: "GB",
  name: "United Kingdom",
  region: "Western Europe",
  lat: 55.3781,
  lon: -3.436,
  score: 82,
  level: "Low",
  factors: { crime: 78, healthcare: 86, transport: 84, documentation: 80 },
  positives: ["Good emergency services", "Strong public transport"],
  advisories: ["Watch for pickpocketing in crowded areas"]
}
```

What updates automatically:

- Country list
- Safety panel
- Globe marker
- Safe picks count if level is `Low`

### Change Safety Score Logic

Currently score is manually written in `mockData.js`.

If you want calculated scores later, create a function such as:

```js
function calculateSafetyScore(factors) {
  return Math.round((factors.crime + factors.healthcare + factors.transport + factors.documentation) / 4);
}
```

Then make sure every country still has the same fields, because UI depends on them.

### Change Budget Limit

File:

```text
src/App.jsx
```

Current line idea:

```js
const budgetUsed = Math.min(Math.round((totalSpent / 60000) * 100), 100);
```

Change `60000` to another monthly budget.

Better future improvement:

Create:

```js
const monthlyBudget = 60000;
```

Then use `monthlyBudget` in the formula.

### Add Delete Expense Feature

In `App.jsx`, create:

```js
const handleDeleteExpense = (id) => {
  setExpenses((current) => current.filter((expense) => expense.id !== id));
};
```

Then add a delete button in each table row.

Important:

Do not directly modify the `expenses` array. Always use `setExpenses`.

### Replace Mock Data With Backend API

Future MERN plan:

- Backend provides expenses from MongoDB.
- Backend provides country safety data.
- Frontend fetches data using `fetch` or `axios`.

Keep the API response shape close to current mock data. That way UI changes stay minimal.

## 10. Common Viva Questions And Answers

### What problem does this project solve?

It combines personal expense management with travel safety information. Travelers can plan financially and check destination safety in one app.

### Why React?

React is component-based, reusable, and suitable for interactive dashboards. It updates the UI efficiently when state changes.

### Why use state?

State stores changing data. In this app, expenses, form inputs, and selected country change based on user interaction.

### Why use `useMemo`?

Category totals and chart data are derived from expenses. `useMemo` avoids recalculating them unnecessarily unless expenses change.

### Why use localStorage?

It provides simple browser-side persistence. Added expenses stay after refreshing the page.

### Why not store formatted currency in data?

Because calculations require numbers. Formatting should happen only when displaying data.

### Why use Three.js?

The travel safety module benefits from a visual, interactive globe. Three.js is a standard library for 3D WebGL scenes.

### How does clicking a globe marker update the panel?

The globe detects the clicked marker using a raycaster. Then it calls `onSelectCountry(country.code)`, which updates selected country state in `App.jsx`. The safety panel re-renders with the selected country.

### What is the role of `mockData.js`?

It acts like a temporary data layer. Later, these arrays can be replaced by backend API responses.

### How is the app responsive?

CSS media queries change grids into single-column layouts on smaller screens.

## 11. Demo Flow For Presentation

Use this order:

1. Start with homepage:
   - Explain RoamSense name and project goal.
2. Show dashboard cards:
   - Total spent, average expense, safe picks, budget alerts.
3. Add an expense:
   - Enter amount, category, date, description.
   - Show it appears in table.
   - Show total and chart update.
4. Show analytics:
   - Explain pie chart category breakdown.
   - Explain line chart monthly trend.
5. Show travel safety:
   - Click a country card.
   - Explain score, factors, positives, advisories.
   - Drag globe.
   - Click marker if possible.
6. Finish with future scope:
   - Backend with MongoDB.
   - Real travel safety API.
   - Authentication.
   - Multi-currency.
   - Expense export.

## 12. If Teacher Asks You To Make A Live Change

Stay calm. Follow this checklist:

1. Identify file:
   - UI/logic: `App.jsx`
   - Globe: `TravelGlobe.jsx`
   - Data: `mockData.js`
   - Styling: `styles.css`
2. Make the smallest change possible.
3. Run:

```bash
npm run build
```

4. Refresh browser.
5. Check related features:
   - If expense logic changed, test add expense and charts.
   - If country data changed, test country list, panel, globe marker.
   - If CSS changed, test desktop and mobile width.

## 13. Common Mistakes To Avoid

- Do not store amounts as `"Rs 2,500"` in data. Store `2500`.
- Do not mutate arrays directly, like `expenses.push(...)`.
- Do not remove required country fields such as `code`, `lat`, `lon`, `factors`.
- Do not hard-code one country inside `TravelGlobe`; it should use `countries`.
- Do not delete cleanup code in `TravelGlobe.jsx`; it prevents memory leaks.
- Do not put business logic inside CSS.

## 14. Future Improvement Ideas

Strong ideas to mention in viva:

- Add real authentication using JWT.
- Store expenses in MongoDB instead of localStorage.
- Add search/filter for expenses.
- Add edit/delete expense.
- Add monthly budget settings.
- Add real-time travel advisory API.
- Add country search box.
- Add multi-currency support.
- Export expense report as PDF or CSV.
- Add admin panel to update safety data.
- Add map/globe tooltips on marker hover.

## 15. Short Closing Statement

Use this at the end:

> RoamSense is designed as a stable frontend foundation for a MERN full-stack application. The current version demonstrates expense tracking, analytics, persistent browser storage, and interactive travel safety visualization. The code separates data, UI, styling, and 3D logic, so future features like authentication, database APIs, and real travel advisory data can be added without rewriting the entire project.
