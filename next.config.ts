import type { NextConfig } from "next";

const isGithubPages = process.env.DEPLOY_TARGET === "github-pages";
const pagesBasePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "/vibathon-2026";

const nextConfig: NextConfig = isGithubPages
  ? {
      output: "export",
      basePath: pagesBasePath,
      assetPrefix: `${pagesBasePath}/`,
      trailingSlash: true,
      images: { unoptimized: true },
    }
  : {};

export default nextConfig;
