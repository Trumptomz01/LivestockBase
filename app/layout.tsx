import type { Metadata, Viewport } from "next";
import { TransferPrompt } from "@/components/TransferPrompt";
import { AppStateProvider } from "../lib/store";
import { BottomNav } from "../components/ButtonNav";
import "./globals.css";

// 1. Add Viewport export for notch coverage
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#000000", // Adjust this to match your app's header color
};

// 2. Add manifest and appleWebApp settings to Metadata
export const metadata: Metadata = {
  title: "AnimalBase",
  description: "Know your farm, every day.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "AnimalBase",
  },
};

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
          {/* 3. Changed min-h-screen to min-h-[100dvh] to prevent URL bar jumpiness */}
          <div className="max-w-105 mx-auto min-h-[100dvh] px-5 flex flex-col">
            {children}
            <BottomNav />
          </div>
          <TransferPrompt />
        </AppStateProvider>
      </body>
    </html>
  );
}