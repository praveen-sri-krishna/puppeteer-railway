const { execSync } = require("child_process");

try {
  console.log("Step 1: Planning Strategy");
  execSync("node autoscraper/ai-planner.js", { stdio: "inherit" });

  console.log("Step 2: Running Scraper");
  execSync("node autoscraper/smart-scraper.js", { stdio: "inherit" });

  console.log("Step 3: Validating Results");
  execSync("node autoscraper/ai-validator.js", { stdio: "inherit" });

  console.log("Step 4: Auto Scaling");
  execSync("node autoscraper/auto-scale.js", { stdio: "inherit" });

  console.log("✅ All steps completed successfully.");
} catch (e) {
  console.error("❌ One of the steps failed:", e.message);
}
