import { spawnSync } from "node:child_process";
import { createSerwistRoute } from "@serwist/turbopack";

// Changes on every deploy, so saved copies of the screens get refreshed.
const revision =
  process.env.VERCEL_GIT_COMMIT_SHA ||
  spawnSync("git", ["rev-parse", "HEAD"], { encoding: "utf-8" }).stdout?.trim() ||
  crypto.randomUUID();

export const { dynamic, dynamicParams, revalidate, generateStaticParams, GET } = createSerwistRoute({
  additionalPrecacheEntries: [
    { url: "/~offline", revision },
    { url: "/", revision },
    { url: "/dashboard", revision },
    { url: "/farm", revision },
    { url: "/settings", revision },
    { url: "/animals", revision },
    { url: "/health", revision },
    { url: "/onboarding/welcome", revision },
    { url: "/record/treat", revision },
  ],
  swSrc: "app/sw.ts",
  useNativeEsbuild: true,
});