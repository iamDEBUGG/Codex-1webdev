import { Globe2, HeartPulse, MapPin, ShieldCheck } from "lucide-react";
import { SafetyBadge } from "./Common.jsx";
import { TravelGlobe } from "./TravelGlobe.jsx";

export function TravelSafetySection({ countries, selectedCountry, onSelectCountry }) {
  return (
    <section className="travel-section" id="travel-safety">
      <div className="travel-copy">
        <p className="eyebrow">Travel safety</p>
        <h2>Country safety, mapped on a living globe.</h2>
        <p>Select a country card or tap a marker on the globe to see what is influencing the safety score.</p>
        <CountrySafetyPanel country={selectedCountry} />
        <CountryList countries={countries} selectedCountry={selectedCountry} onSelectCountry={onSelectCountry} />
      </div>
      <div className="globe-stage">
        <TravelGlobe
          countries={countries}
          selectedCountryCode={selectedCountry.code}
          onSelectCountry={onSelectCountry}
        />
        <div className="globe-caption">
          <Globe2 size={18} />
          Drag the globe or select a marker to inspect country safety.
        </div>
      </div>
    </section>
  );
}

function CountryList({ countries, selectedCountry, onSelectCountry }) {
  return (
    <div className="country-list" aria-label="Country safety ranking">
      {countries.map((country) => (
        <button
          key={country.code}
          className={`country-card ${country.code === selectedCountry.code ? "selected" : ""}`}
          type="button"
          onClick={() => onSelectCountry(country.code)}
        >
          <div>
            <strong>{country.name}</strong>
            <span>
              <MapPin size={14} />
              {country.region}
            </span>
          </div>
          <SafetyBadge level={country.level} score={country.score} />
        </button>
      ))}
    </div>
  );
}

function CountrySafetyPanel({ country }) {
  return (
    <article className="safety-panel">
      <div className="safety-panel-header">
        <div>
          <span>{country.region}</span>
          <h3>{country.name}</h3>
        </div>
        <SafetyBadge level={country.level} score={country.score} />
      </div>
      <div className="factor-grid" aria-label={`Safety factors for ${country.name}`}>
        {Object.entries(country.factors).map(([label, value]) => (
          <div className="factor-meter" key={label}>
            <div>
              <span>{toTitleCase(label)}</span>
              <strong>{value}</strong>
            </div>
            <meter min="0" max="100" value={value} />
          </div>
        ))}
      </div>
      <div className="safety-notes">
        <SafetyNote icon={ShieldCheck} title="Positive signals" items={country.positives} />
        <SafetyNote icon={HeartPulse} title="Advisories" items={country.advisories} />
      </div>
    </article>
  );
}

function SafetyNote({ icon: Icon, title, items }) {
  return (
    <div className="safety-note">
      <h4>
        <Icon size={16} />
        {title}
      </h4>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function toTitleCase(value) {
  return value.replace(/^\w/, (letter) => letter.toUpperCase());
}
