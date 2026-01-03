import { withSentryConfig } from "@sentry/nextjs";

const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ["typeorm"],
  },
  webpack: (config) => {
    // Avoid bundling optional database drivers TypeORM references but are not used in this app.
    config.externals.push({
      mysql: "commonjs mysql",
      mysql2: "commonjs mysql2",
      "pg-native": "commonjs pg-native",
      sqlite3: "commonjs sqlite3",
      "react-native-sqlite-storage": "commonjs react-native-sqlite-storage",
      "@sap/hana-client/extension/Stream": "commonjs @sap/hana-client/extension/Stream",
    });
    return config;
  },
};

const sentryWebpackPluginOptions = {
  silent: true,
  dryRun: !process.env.SENTRY_DSN,
};

export default withSentryConfig(nextConfig, sentryWebpackPluginOptions);
