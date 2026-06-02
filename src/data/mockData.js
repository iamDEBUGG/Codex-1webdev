export const expenseCategories = [
  { name: "Food & Dining", value: 0, color: "#0f766e" },
  { name: "Travel & Transportation", value: 0, color: "#2563eb" },
  { name: "Bills & Subscriptions", value: 0, color: "#7c3aed" },
  { name: "Entertainment", value: 0, color: "#f59e0b" },
  { name: "Other", value: 0, color: "#64748b" }
];

export const monthlyTrend = [
  { month: "Jan", spent: 30200 },
  { month: "Feb", spent: 34850 },
  { month: "Mar", spent: 32600 },
  { month: "Apr", spent: 39420 },
  { month: "May", spent: 2500 },
  { month: "Jun", spent: 0 }
];

export const recentExpenses = [
  { id: 1, name: "Airport transfer", category: "Travel & Transportation", date: "2026-05-01", amount: 2500 },
  { id: 2, name: "Hotel breakfast", category: "Food & Dining", date: "2026-04-30", amount: 860 },
  { id: 3, name: "Metro card", category: "Travel & Transportation", date: "2026-04-29", amount: 1200 },
  { id: 4, name: "Streaming plan", category: "Bills & Subscriptions", date: "2026-04-28", amount: 649 }
];

export const safetyCountries = [
  {
    code: "JP",
    name: "Japan",
    region: "East Asia",
    lat: 36.2048,
    lon: 138.2529,
    score: 92,
    level: "Low",
    factors: { crime: 94, healthcare: 91, transport: 95, documentation: 89 },
    positives: ["Very low violent crime", "Reliable public transport", "High-quality emergency care"],
    advisories: ["Plan for earthquakes and typhoon seasons", "Carry translated medical/allergy notes"]
  },
  {
    code: "GD",
    name: "GokulDham Society ",
    region: "Mumbai",
    lat: 1.3521,
    lon: 103.8198,
    score: 91,
    level: "Low",
    factors: { crime: 92, healthcare: 90, transport: 94, documentation: 88 },
    positives: ["Low crime", "Excellent Abdul Soda", "Strong healthcare access by Dr.Hathi"],
    advisories: ["Plan for heat by tantrum of Bhide and Popatlal", "Follow local socciety rules carefully"]
  },
  {
    code: "IN",
    name: "India",
    region: "South Asia",
    lat: 20.5937,
    lon: 78.9629,
    score: 76,
    level: "Medium",
    factors: { crime: 68, healthcare: 74, transport: 72, documentation: 88 },
    positives: ["Strong hospital access in major cities", "Broad rail and domestic flight network", "Helpful digital payment coverage"],
    advisories: ["Use verified transport at night", "Watch air quality and heat alerts by city"]
  },
  {
    code: "FR",
    name: "France",
    region: "Western Europe",
    lat: 46.2276,
    lon: 2.2137,
    score: 84,
    level: "Low",
    factors: { crime: 79, healthcare: 92, transport: 88, documentation: 86 },
    positives: ["Excellent healthcare system", "Dense train and metro coverage", "Good emergency response infrastructure"],
    advisories: ["Pickpocketing risk in crowded tourist zones", "Check strike notices before intercity travel"]
  },
  {
    code: "BR",
    name: "Brazil",
    region: "South America",
    lat: -14.235,
    lon: -51.9253,
    score: 62,
    level: "Medium",
    factors: { crime: 49, healthcare: 66, transport: 61, documentation: 73 },
    positives: ["Strong private healthcare in major cities", "Well-developed tourism areas", "Good domestic flight availability"],
    advisories: ["Avoid displaying valuables", "Use hotel-arranged or app-based transport after dark"]
  },
  {
    code: "ZA",
    name: "South Africa",
    region: "Southern Africa",
    lat: -30.5595,
    lon: 22.9375,
    score: 48,
    level: "High",
    factors: { crime: 36, healthcare: 61, transport: 45, documentation: 67 },
    positives: ["High-quality private medical care", "Well-established guided tourism routes", "Clear entry documentation for many travelers"],
    advisories: ["Avoid walking alone at night", "Use secure transport and confirm local area guidance"]
  },
  {
    code: "US",
    name: "United States",
    region: "North America",
    lat: 37.0902,
    lon: -95.7129,
    score: 71,
    level: "Medium",
    factors: { crime: 63, healthcare: 82, transport: 69, documentation: 70 },
    positives: ["Advanced emergency and hospital systems", "Strong road and flight connectivity", "Reliable travel information availability"],
    advisories: ["Healthcare can be expensive without insurance", "Safety varies significantly by city and neighborhood"]
  },
  {
    code: "CA",
    name: "Canada",
    region: "North America",
    lat: 56.1304,
    lon: -106.3468,
    score: 88,
    level: "Low",
    factors: { crime: 87, healthcare: 88, transport: 82, documentation: 91 },
    positives: ["Low violent crime", "Strong emergency services", "Clear visitor documentation process"],
    advisories: ["Prepare for severe winter conditions", "Remote areas need careful route planning"]
  },
  {
    code: "AU",
    name: "Australia",
    region: "Oceania",
    lat: -25.2744,
    lon: 133.7751,
    score: 86,
    level: "Low",
    factors: { crime: 86, healthcare: 90, transport: 80, documentation: 88 },
    positives: ["Good public safety standards", "Excellent healthcare facilities", "Strong travel infrastructure in cities"],
    advisories: ["Respect beach and wildlife safety warnings", "Distances between cities can be large"]
  },
  {
    code: "AE",
    name: "United Arab Emirates",
    region: "Middle East",
    lat: 23.4241,
    lon: 53.8478,
    score: 89,
    level: "Low",
    factors: { crime: 93, healthcare: 87, transport: 88, documentation: 86 },
    positives: ["Very low street crime", "Modern hospitals and roads", "Efficient airports and transit"],
    advisories: ["Follow local laws and cultural rules carefully", "Plan for extreme heat in summer"]
  },
  {
    code: "TH",
    name: "Thailand",
    region: "Southeast Asia",
    lat: 15.87,
    lon: 100.9925,
    score: 73,
    level: "Medium",
    factors: { crime: 69, healthcare: 78, transport: 70, documentation: 75 },
    positives: ["Good private healthcare in tourist hubs", "Mature tourism services", "Affordable local transport"],
    advisories: ["Use helmets and licensed transport", "Watch flood and monsoon updates"]
  },
  {
    code: "MX",
    name: "Mexico",
    region: "North America",
    lat: 23.6345,
    lon: -102.5528,
    score: 58,
    level: "Medium",
    factors: { crime: 45, healthcare: 68, transport: 60, documentation: 72 },
    positives: ["Strong tourist infrastructure in major destinations", "Good private hospitals in larger cities", "Easy regional flight access"],
    advisories: ["Review destination-specific advisories", "Use reputable transport and avoid isolated areas at night"]
  },
  {
    code: "EG",
    name: "Egypt",
    region: "North Africa",
    lat: 26.8206,
    lon: 30.8025,
    score: 67,
    level: "Medium",
    factors: { crime: 62, healthcare: 65, transport: 63, documentation: 78 },
    positives: ["Well-traveled major tourist corridors", "Good hospital options in large cities", "Clear visa/documentation process"],
    advisories: ["Use licensed guides and transport", "Stay hydrated and plan around heat"]
  }
];
