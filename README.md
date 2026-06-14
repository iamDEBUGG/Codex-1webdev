# RoamSense

RoamSense is a React/Vite frontend for an expense tracker with travel safety intelligence. It is structured so the mock data can be replaced by MERN backend APIs later without redesigning the UI.

## Run Locally

```bash
npm install
npm run dev
```

Production preview:

```bash
npm run build
npm run preview
```

## Project Structure

- `src/App.jsx` - main state container that connects all sections.
- `src/components/Header.jsx` - top navigation.
- `src/components/HeroSection.jsx` - RoamSense title and dashboard hero stats.
- `src/components/SummaryCards.jsx` - four summary metric cards.
- `src/components/ExpenseSection.jsx` - expense form and expense table.
- `src/components/AnalyticsSection.jsx` - pie chart and line chart.
- `src/components/TravelSafetySection.jsx` - country list and safety detail panel.
- `src/components/TravelGlobe.jsx` - Three.js globe with country safety markers.
- `src/components/RoadmapSection.jsx` - development roadmap cards.
- `src/components/Common.jsx` - small reusable UI components.
- `src/data/mockData.js` - replaceable data layer for expenses, analytics, and travel safety.
- `src/utils/expenseUtils.js` - expense calculations, formatting, validation, and localStorage helpers.
- `src/styles.css` - responsive visual system.
- `vite.config.js` - React plugin and chunk splitting for charts/globe.

## Future Backend Integration

When adding the MERN backend, keep this frontend contract stable:

- Replace `expenseCategories`, `monthlyTrend`, and `recentExpenses` with API responses.
- Replace `safetyCountries` with country safety API data using the same fields: `code`, `name`, `region`, `lat`, `lon`, `score`, and `level`.
- Keep `TravelGlobe` data-driven; do not hard-code countries inside the component.
