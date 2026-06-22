import cron from "node-cron";
import { runMunderaMandiAggregation } from "../services/aggregationService.js";

cron.schedule("0 22 * * *", async () => {
  console.log(
    "🕒 10:00 PM IST Cutoff Interval detected. Securing books and processing logs...",
  );
  await runMunderaMandiAggregation();
});
