import SitePage from "./[[...slug]]/page";

export default async function HomePage() {
  return <SitePage params={{ slug: [] }} />;
}
