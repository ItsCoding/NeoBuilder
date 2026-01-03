import * as Sentry from "@sentry/nextjs";

export async function time<T>(label: string, fn: () => Promise<T>) {
  const start = performance.now();
  const result = await fn();
  const duration = performance.now() - start;
  console.info(`[perf] ${label} ${duration.toFixed(1)}ms`);
  Sentry.addBreadcrumb({ category: "perf", message: label, data: { duration } });
  return { result, duration };
}
