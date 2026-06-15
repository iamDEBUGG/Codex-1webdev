import { Plane, Search } from "lucide-react";

const navItems = ["Dashboard", "Expenses", "Analytics", "Travel Safety", "Smart AI"];

export function Header() {
  return (
    <header className="topbar" aria-label="Main navigation">
      <a className="brand" href="#dashboard" aria-label="RoamSense home">
        <span className="brand-mark">
          <Plane size={20} />
        </span>
        <span>RoamSense</span>
      </a>
      <nav className="nav-links">
        {navItems.map((item) => (
          <a key={item} href={`#${item.toLowerCase().replaceAll(" ", "-")}`}>
            {item}
          </a>
        ))}
      </nav>
      <button className="icon-button" aria-label="Search">
        <Search size={19} />
      </button>
    </header>
  );
}
