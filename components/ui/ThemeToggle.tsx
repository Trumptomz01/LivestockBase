"use client";

import { useEffect, useState } from "react";

// Small, icon-only sun/moon toggle. Reads/writes the same localStorage
// key the inline init script in layout.tsx checks, so state stays in sync.
export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("hb360-theme", next ? "dark" : "light");
    } catch (e) {}
  }

  return (
    <button
      onClick={toggle}
      aria-label="Switch light or dark mode"
      className="p-2 rounded-lg text-text hover:bg-surface-2"
    >
      <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
        <circle cx="12" cy="12" r="5" />
        <g stroke="currentColor" strokeWidth="2">
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.2" y1="4.2" x2="5.6" y2="5.6" />
          <line x1="18.4" y1="18.4" x2="19.8" y2="19.8" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.2" y1="19.8" x2="5.6" y2="18.4" />
          <line x1="18.4" y1="5.6" x2="19.8" y2="4.2" />
        </g>
      </svg>
    </button>
  );
}
