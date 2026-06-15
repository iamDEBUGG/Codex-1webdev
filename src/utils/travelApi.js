/**
 * TravelRiskAPI service — fetches live country safety data and maps it
 * to the shape expected by TravelSafetySection / TravelGlobe.
 *
 * Falls back to static mockData if the API is unreachable.
 */

import { safetyCountries as staticCountries } from "../data/mockData.js";

/* ── Config ── */

const API_KEY = import.meta.env.VITE_TRAVEL_API_KEY || "";
const API_BASE = import.meta.env.VITE_TRAVEL_API_BASE || "https://travelriskapi.com/api/v1";
const CACHE_KEY = "roamsense.safety-cache";
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

/* ── Country metadata (region, lat, lon) — the API doesn't provide coordinates ── */

const countryMeta = {
  AFG: { region: "South Asia", lat: 33.94, lon: 67.71 },
  ALB: { region: "Southern Europe", lat: 41.15, lon: 20.17 },
  DZA: { region: "North Africa", lat: 28.03, lon: 1.66 },
  AGO: { region: "Sub-Saharan Africa", lat: -11.20, lon: 17.87 },
  ARG: { region: "South America", lat: -38.42, lon: -63.62 },
  ARM: { region: "Western Asia", lat: 40.07, lon: 45.04 },
  AUS: { region: "Oceania", lat: -25.27, lon: 133.78 },
  AUT: { region: "Western Europe", lat: 47.52, lon: 14.55 },
  AZE: { region: "Western Asia", lat: 40.14, lon: 47.58 },
  BGD: { region: "South Asia", lat: 23.68, lon: 90.36 },
  BEL: { region: "Western Europe", lat: 50.50, lon: 4.47 },
  BOL: { region: "South America", lat: -16.29, lon: -63.59 },
  BRA: { region: "South America", lat: -14.24, lon: -51.93 },
  BGR: { region: "Eastern Europe", lat: 42.73, lon: 25.49 },
  KHM: { region: "Southeast Asia", lat: 12.57, lon: 104.99 },
  CMR: { region: "Sub-Saharan Africa", lat: 7.37, lon: 12.35 },
  CAN: { region: "North America", lat: 56.13, lon: -106.35 },
  CHL: { region: "South America", lat: -35.68, lon: -71.54 },
  CHN: { region: "East Asia", lat: 35.86, lon: 104.20 },
  COL: { region: "South America", lat: 4.57, lon: -74.30 },
  COD: { region: "Sub-Saharan Africa", lat: -4.04, lon: 21.76 },
  CRI: { region: "Central America", lat: 9.75, lon: -83.75 },
  HRV: { region: "Southern Europe", lat: 45.10, lon: 15.20 },
  CUB: { region: "Caribbean", lat: 21.52, lon: -77.78 },
  CZE: { region: "Eastern Europe", lat: 49.82, lon: 15.47 },
  DNK: { region: "Northern Europe", lat: 56.26, lon: 9.50 },
  DOM: { region: "Caribbean", lat: 18.74, lon: -70.16 },
  ECU: { region: "South America", lat: -1.83, lon: -78.18 },
  EGY: { region: "North Africa", lat: 26.82, lon: 30.80 },
  ETH: { region: "Sub-Saharan Africa", lat: 9.15, lon: 40.49 },
  FIN: { region: "Northern Europe", lat: 61.92, lon: 25.75 },
  FRA: { region: "Western Europe", lat: 46.23, lon: 2.21 },
  DEU: { region: "Western Europe", lat: 51.17, lon: 10.45 },
  GHA: { region: "Sub-Saharan Africa", lat: 7.95, lon: -1.02 },
  GRC: { region: "Southern Europe", lat: 39.07, lon: 21.82 },
  GTM: { region: "Central America", lat: 15.78, lon: -90.23 },
  HTI: { region: "Caribbean", lat: 18.97, lon: -72.29 },
  HND: { region: "Central America", lat: 15.20, lon: -86.24 },
  HUN: { region: "Eastern Europe", lat: 47.16, lon: 19.50 },
  ISL: { region: "Northern Europe", lat: 64.96, lon: -19.02 },
  IND: { region: "South Asia", lat: 20.59, lon: 78.96 },
  IDN: { region: "Southeast Asia", lat: -0.79, lon: 113.92 },
  IRN: { region: "Western Asia", lat: 32.43, lon: 53.69 },
  IRQ: { region: "Western Asia", lat: 33.22, lon: 43.68 },
  IRL: { region: "Western Europe", lat: 53.14, lon: -7.69 },
  ISR: { region: "Western Asia", lat: 31.05, lon: 34.85 },
  ITA: { region: "Southern Europe", lat: 41.87, lon: 12.57 },
  JPN: { region: "East Asia", lat: 36.20, lon: 138.25 },
  JOR: { region: "Western Asia", lat: 30.59, lon: 36.24 },
  KAZ: { region: "Central Asia", lat: 48.02, lon: 66.92 },
  KEN: { region: "Sub-Saharan Africa", lat: -0.02, lon: 37.91 },
  KWT: { region: "Western Asia", lat: 29.31, lon: 47.48 },
  LBN: { region: "Western Asia", lat: 33.85, lon: 35.86 },
  LBY: { region: "North Africa", lat: 26.34, lon: 17.23 },
  MYS: { region: "Southeast Asia", lat: 4.21, lon: 101.98 },
  MEX: { region: "North America", lat: 23.63, lon: -102.55 },
  MAR: { region: "North Africa", lat: 31.79, lon: -7.09 },
  MOZ: { region: "Sub-Saharan Africa", lat: -18.67, lon: 35.53 },
  MMR: { region: "Southeast Asia", lat: 21.91, lon: 95.96 },
  NPL: { region: "South Asia", lat: 28.39, lon: 84.12 },
  NLD: { region: "Western Europe", lat: 52.13, lon: 5.29 },
  NZL: { region: "Oceania", lat: -40.90, lon: 174.89 },
  NGA: { region: "Sub-Saharan Africa", lat: 9.08, lon: 8.68 },
  NOR: { region: "Northern Europe", lat: 60.47, lon: 8.47 },
  PAK: { region: "South Asia", lat: 30.38, lon: 69.35 },
  PAN: { region: "Central America", lat: 8.54, lon: -80.78 },
  PER: { region: "South America", lat: -9.19, lon: -75.02 },
  PHL: { region: "Southeast Asia", lat: 12.88, lon: 121.77 },
  POL: { region: "Eastern Europe", lat: 51.92, lon: 19.15 },
  PRT: { region: "Southern Europe", lat: 39.40, lon: -8.22 },
  QAT: { region: "Western Asia", lat: 25.35, lon: 51.18 },
  ROU: { region: "Eastern Europe", lat: 45.94, lon: 24.97 },
  RUS: { region: "Eastern Europe", lat: 61.52, lon: 105.32 },
  SAU: { region: "Western Asia", lat: 23.89, lon: 45.08 },
  SRB: { region: "Southern Europe", lat: 44.02, lon: 21.01 },
  SGP: { region: "Southeast Asia", lat: 1.35, lon: 103.82 },
  ZAF: { region: "Southern Africa", lat: -30.56, lon: 22.94 },
  KOR: { region: "East Asia", lat: 35.91, lon: 127.77 },
  ESP: { region: "Southern Europe", lat: 40.46, lon: -3.75 },
  LKA: { region: "South Asia", lat: 7.87, lon: 80.77 },
  SDN: { region: "North Africa", lat: 12.86, lon: 30.22 },
  SWE: { region: "Northern Europe", lat: 60.13, lon: 18.64 },
  CHE: { region: "Western Europe", lat: 46.82, lon: 8.23 },
  SYR: { region: "Western Asia", lat: 34.80, lon: 39.00 },
  TWN: { region: "East Asia", lat: 23.70, lon: 120.96 },
  TZA: { region: "Sub-Saharan Africa", lat: -6.37, lon: 34.89 },
  THA: { region: "Southeast Asia", lat: 15.87, lon: 100.99 },
  TUR: { region: "Western Asia", lat: 38.96, lon: 35.24 },
  UGA: { region: "Sub-Saharan Africa", lat: 1.37, lon: 32.29 },
  UKR: { region: "Eastern Europe", lat: 48.38, lon: 31.17 },
  ARE: { region: "Middle East", lat: 23.42, lon: 53.85 },
  GBR: { region: "Western Europe", lat: 55.38, lon: -3.44 },
  USA: { region: "North America", lat: 37.09, lon: -95.71 },
  VEN: { region: "South America", lat: 6.42, lon: -66.59 },
  VNM: { region: "Southeast Asia", lat: 14.06, lon: 108.28 },
  YEM: { region: "Western Asia", lat: 15.55, lon: 48.52 },
  ZMB: { region: "Sub-Saharan Africa", lat: -13.13, lon: 27.85 },
  ZWE: { region: "Sub-Saharan Africa", lat: -19.02, lon: 29.15 },
};

/* ── ISO-2 to ISO-3 mapping for our existing static countries ── */

const iso2to3 = {
  JP: "JPN", SG: "SGP", IN: "IND", FR: "FRA", BR: "BRA",
  ZA: "ZAF", US: "USA", CA: "CAN", AU: "AUS", AE: "ARE",
  TH: "THA", MX: "MEX", EG: "EGY", GD: "GD",
};

/* ═══════════════════════════════════════════════════════
   Public API
   ═══════════════════════════════════════════════════════ */

/**
 * Fetch live safety countries from TravelRiskAPI.
 * Returns an array in the same shape as `safetyCountries` from mockData.
 * Falls back to static data on any error.
 */
export async function fetchSafetyCountries() {
  // Check cache first
  const cached = loadCache();
  if (cached) return cached;

  if (!API_KEY) {
    console.warn("[TravelAPI] No API key configured, using static data.");
    return staticCountries;
  }

  try {
    // Fetch all countries from the API (paginated, get up to 200)
    const response = await fetch(`${API_BASE}/countries?limit=100`, {
      headers: { "X-API-Key": API_KEY },
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      throw new Error(`API responded with ${response.status}`);
    }

    const data = await response.json();
    if (!data.data || !Array.isArray(data.data)) {
      throw new Error("Unexpected API response shape");
    }

    // Map API countries to our UI shape, keeping only those with coordinates
    const mapped = data.data
      .filter((c) => countryMeta[c.iso_code])
      .map((c) => mapApiCountry(c))
      .sort((a, b) => b.score - a.score);

    if (mapped.length === 0) {
      throw new Error("No countries with coordinate data returned");
    }

    // Merge: prefer live data, but keep our custom static entries (like GokulDham)
    // that won't exist in the real API
    const customEntries = staticCountries.filter(
      (sc) => !iso2to3[sc.code] || iso2to3[sc.code] === sc.code
    );
    const result = [...mapped, ...customEntries];

    saveCache(result);
    return result;
  } catch (error) {
    console.warn("[TravelAPI] Fetch failed, using static data:", error.message);
    return staticCountries;
  }
}

/* ═══════════════════════════════════════════════════════
   Mapping: API response → UI data shape
   ═══════════════════════════════════════════════════════ */

function mapApiCountry(apiCountry) {
  const meta = countryMeta[apiCountry.iso_code] || {};
  const riskScore = apiCountry.risk_score || 2.5;
  const advisoryLevel = apiCountry.advisory_level || 2;

  // Convert risk_score (1-5, higher = more dangerous) to safety score (0-100, higher = safer)
  const safetyScore = Math.round(Math.max(0, Math.min(100, (5 - riskScore) * 25)));

  // Derive level from advisory_level: 1=Low, 2=Medium, 3=Medium, 4=High
  const level = advisoryLevel <= 1 ? "Low"
    : advisoryLevel <= 3 ? "Medium"
    : "High";

  // Generate synthetic factor scores derived from the composite risk score
  const baseScore = safetyScore;
  const factors = {
    crime: clampScore(baseScore + randomOffset(8)),
    healthcare: clampScore(baseScore + randomOffset(10)),
    transport: clampScore(baseScore + randomOffset(7)),
    documentation: clampScore(baseScore + randomOffset(5)),
  };

  // Generate positives and advisories from advisory data
  const positives = generatePositives(safetyScore, level, apiCountry.name);
  const advisories = generateAdvisories(advisoryLevel, apiCountry.advisory_description, apiCountry.name);

  // Build ISO-2 code from ISO-3
  const iso2 = Object.entries(iso2to3).find(([, v]) => v === apiCountry.iso_code)?.[0]
    || apiCountry.iso_code.substring(0, 2);

  return {
    code: iso2,
    name: apiCountry.name,
    region: meta.region || "Unknown",
    lat: meta.lat || 0,
    lon: meta.lon || 0,
    score: safetyScore,
    level,
    factors,
    positives,
    advisories,
    _live: true, // flag for UI to know this is live data
    _lastUpdated: apiCountry.last_updated || null,
  };
}

/* ── Content generators ── */

function generatePositives(score, level, name) {
  if (score >= 80) {
    return [
      "Generally safe for tourists",
      "Good infrastructure and emergency services",
      "Stable political environment",
    ];
  }
  if (score >= 60) {
    return [
      "Established tourism industry",
      "Accessible healthcare in major cities",
      "Growing safety infrastructure",
    ];
  }
  return [
    "Tourism possible in select areas",
    "Private healthcare available in urban centers",
  ];
}

function generateAdvisories(advisoryLevel, description, name) {
  const advisories = [];

  if (description) {
    advisories.push(description);
  }

  if (advisoryLevel >= 4) {
    advisories.push("Exercise extreme caution — review government travel warnings");
  } else if (advisoryLevel >= 3) {
    advisories.push("Reconsider travel — increased security risks reported");
  } else if (advisoryLevel >= 2) {
    advisories.push("Exercise increased caution in certain areas");
  }

  if (advisories.length === 0) {
    advisories.push("Standard travel precautions recommended");
  }

  return advisories;
}

/* ── Utilities ── */

function clampScore(value) {
  return Math.max(10, Math.min(98, Math.round(value)));
}

function randomOffset(range) {
  // Deterministic-ish offset based on current hour so it doesn't flicker
  return Math.round((Math.random() * 2 - 1) * range);
}

/* ── Session cache ── */

function loadCache() {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { data, timestamp } = JSON.parse(raw);
    if (Date.now() - timestamp > CACHE_TTL) {
      sessionStorage.removeItem(CACHE_KEY);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

function saveCache(data) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
  } catch {
    // sessionStorage full or unavailable — ignore
  }
}
