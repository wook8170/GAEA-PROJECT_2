import path from "node:path";
import * as dotenv from "@dotenvx/dotenvx";
import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
const joinUrlPath = (...segments: string[]): string => {
  if (segments.length === 0) return "";
  const validSegments = segments.filter((segment) => segment !== "");
  if (validSegments.length === 0) return "";
  const processedSegments = validSegments.map((segment, index) => {
    let processed = segment;
    while (processed.startsWith("/")) processed = processed.substring(1);
    if (index < validSegments.length - 1) {
      while (processed.endsWith("/")) processed = processed.substring(0, processed.length - 1);
    }
    return processed;
  });
  const joined = processedSegments.join("/");
  return `/${joined.split("/").filter((part) => part !== "").join("/")}`;
};


dotenv.config({ path: path.resolve(__dirname, ".env") });

// Expose only vars starting with VITE_
const viteEnv = Object.keys(process.env)
  .filter((k) => k.startsWith("VITE_"))
  .reduce<Record<string, string>>((a, k) => {
    a[k] = process.env[k] ?? "";
    return a;
  }, {});

const basePath = joinUrlPath(process.env.VITE_SPACE_BASE_PATH ?? "", "/") ?? "/";

export default defineConfig(() => ({
  base: basePath,
  define: {
    "process.env": JSON.stringify(viteEnv),
  },
  build: {
    assetsInlineLimit: 0,
  },
  plugins: [reactRouter(), tsconfigPaths({ projects: [path.resolve(__dirname, "tsconfig.json")] })],
  resolve: {
    alias: {
      // Next.js compatibility shims used within space
      "next/link": path.resolve(__dirname, "app/compat/next/link.tsx"),
      "next/navigation": path.resolve(__dirname, "app/compat/next/navigation.ts"),
    },
    dedupe: ["react", "react-dom"],
  },
  server: {
    host: "127.0.0.1",
  },
}));
