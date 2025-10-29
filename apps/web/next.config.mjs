import path from "path";

const nextConfig = {
  experimental: { typedRoutes: true },
  webpack(config) {
    config.resolve.alias["@"] = path.resolve(__dirname);
    return config;
  },
};

export default nextConfig;
