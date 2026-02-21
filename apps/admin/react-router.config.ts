import type { Config } from "@react-router/dev/config";
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


const basePath = joinUrlPath(process.env.VITE_ADMIN_BASE_PATH ?? "", "/") ?? "/";

export default {
  appDirectory: "app",
  basename: basePath,
  // Admin runs as a client-side app; build a static client bundle only
  ssr: false,
} satisfies Config;
