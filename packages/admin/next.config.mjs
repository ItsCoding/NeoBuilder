import { withSentryConfig } from "@sentry/nextjs";

const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: true,
  },
};

const sentryWebpackPluginOptions = {
  silent: true,
  dryRun: !process.env.SENTRY_DSN,
};

export default withSentryConfig(nextConfig, sentryWebpackPluginOptions);
