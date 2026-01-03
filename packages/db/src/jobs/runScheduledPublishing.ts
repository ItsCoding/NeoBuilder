#!/usr/bin/env ts-node
import { runScheduledPublishing } from "../services/pageWorkflow";

async function main() {
  try {
    await runScheduledPublishing();
    // eslint-disable-next-line no-console
    console.log("Scheduled publish/unpublish job completed");
    process.exit(0);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Failed to run scheduled publishing", err);
    process.exit(1);
  }
}

void main();
