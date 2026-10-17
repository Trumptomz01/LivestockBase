import type { Metadata, Viewport } from "next";
import { SerwistProvider } from "@serwist/turbopack/react";
import { AppStateProvider } from "../lib/store";
import { TransferPrompt } from "@/components/TransferPrompt";
import { BottomNav } from "../components/ButtonNav";
import "./globals.css";

export const metadata: Metadata = {
  applicationName: "HerdBase360",
  title: "HerdBase360",
  description: "Know your farm, every day.",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "HerdBase" },
  formatDetection: { telephone: false },
  icons: { apple: "/icons/apple-touch-icon.png" },
};

export const viewport: Viewport = {
  themeColor: "#151a15",
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
        <SerwistProvider swUrl="/serwist/sw.js">
          <AppStateProvider>
            <div className="max-w-105 mx-auto min-h-screen px-5 flex flex-col">
              {children}
              <BottomNav />
            </div>
            <TransferPrompt />
          </AppStateProvider>
        </SerwistProvider>
      </body>
    </html>
  );
}