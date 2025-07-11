#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const DB_PATH = path.join(__dirname, "db/performance.json");

// Create DB if doesn't exist
if (!fs.existsSync(DB_PATH)) fs.writeFileSync(DB_PATH, "[]", "utf-8");

// 🚀 Function to update performance results after test ad campaign
function updatePerformance(product, region, results) {
  const entry = {
    region,
    product: product.title,
    likes: product.likes,
    hook_type: product.hook_type,
    virality_score: product.virality_score,
    scaling_recommendation: product.scaling_recommendation,
    ctr: results.ctr || null,
    roas: results.roas || null,
    timestamp: new Date().toISOString()
  };

  const db = JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
  db.push(entry);
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
  console.log(`📦 Logged performance for ${product.title} in ${region}`);
}

// 📊 Function to get summarized insights for AI agent
function getPerformanceInsights() {
  const db = JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
  const trends = {
    best_regions: {},
    best_hooks: {},
    top_niches: {}
  };

  db.forEach(entry => {
    if (entry.scaling_recommendation === "yes") {
      trends.best_regions[entry.region] = (trends.best_regions[entry.region] || 0) + 1;
      trends.best_hooks[entry.hook_type] = (trends.best_hooks[entry.hook_type] || 0) + 1;
    }
  });

  return trends;
}

module.exports = {
  updatePerformance,
  getPerformanceInsights
};

async function run() {
  const strategy = await getScrapingStrategy();
  console.log(JSON.stringify(strategy));
}

run();
