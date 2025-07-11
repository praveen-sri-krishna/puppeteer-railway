#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { updatePerformance } = require("./performance-db");

const OUTPUT_DIR = path.join(__dirname, "output");

async function autoScale(region) {
  const validatedPath = path.join(OUTPUT_DIR, `validated-${region}.json`);
  if (!fs.existsSync(validatedPath)) {
    console.log(`❌ No validated file found for ${region}`);
    return;
  }

  const validated = JSON.parse(fs.readFileSync(validatedPath, "utf-8"));
  const scalableAds = validated.filter(ad => ad.scaling_recommendation === "yes");

  if (scalableAds.length === 0) {
    console.log(`⚠️ No scalable products found for ${region}`);
    return;
  }

  // 🔁 Log each product and push to output
  const csvLines = [];
  for (const product of scalableAds) {
    // Append to performance memory
    updatePerformance(product, region, { ctr: null, roas: null }); // replace when metrics available

    // Optional: launch ad or notify system
    // launchAd(product); // ← your API integration here

    // Create CSV line for export
    csvLines.push([
      product.title,
      product.likes,
      product.hook_type,
      product.virality_score,
      region,
      new Date().toISOString()
    ].join(","));
  }

  // Save results for review
  const csvFile = path.join(OUTPUT_DIR, `scalable-${region}.csv`);
  fs.writeFileSync(csvFile, ["Title,Likes,Hook,Score,Region,Time", ...csvLines].join("\n"));
  console.log(`✅ Scalable ads for ${region} saved to ${csvFile}`);
}

module.exports = { autoScale };

async function run() {
  const strategy = await getScrapingStrategy();
  console.log(JSON.stringify(strategy));
}

run();

