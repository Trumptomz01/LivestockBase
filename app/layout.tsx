import type { Metadata } from "next";
import { AppStateProvider } from "../lib/store";
import "./globals.css";

export const metadata: Metadata = {
  title: "HerdBase360",
  description: "Know your farm, every day.",
};

// Runs before paint so there's no light/dark flash on load.
// Reads a saved preference first, falls back to the device's setting.
const themeInitScript = `
(function () {
  try {
    var saved = localStorage.getItem('hb360-theme');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var theme = saved || (prefersDark ? 'dark' : 'light');
    if (theme === 'dark') document.documentElement.classList.add('dark');
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&display=swap"
          rel="stylesheet"
        />
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <AppStateProvider>
          <div className="max-w-105 mx-auto min-h-screen px-5 flex flex-col">{children}</div>
        </AppStateProvider>
      </body>
    </html>
  );
}
