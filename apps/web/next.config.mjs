import path from "path";

const nextConfig = {
  experimental: { typedRoutes: true },
  transpilePackages: ["@shared"],
  webpack(config) {
    config.resolve.alias["@"] = path.resolve(__dirname);
    return config;
  },
};

export default nextConfig;
