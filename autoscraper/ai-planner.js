#!/usr/bin/env node
const fs = require("fs");
const { OpenAI } = require("openai");

const openai = new OpenAI({ apiKey: process.env.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 });

// Load past product performance and trends
function loadHistoricalTrends() {
  const history = fs.existsSync("db.json") ? fs.readFileSync("db.json", "utf-8") : "[]";
  return JSON.parse(history).slice(-100); // Use recent 100 entries
}

function getSeasonalSignals() {
  const month = new Date().getMonth();
  const seasonalTags = {
    0: "New Year Resolution Gadgets",
    2: "Spring Decor",
    5: "Summer Essentials",
    9: "Holiday Gifting",
    11: "Christmas Specials"
  };
  return seasonalTags[month] || "evergreen viral products";
}

async function getStrategy() {
  const prompt = `
You are an ecommerce growth strategist.
Based on the last 30 days of product performance, seasonal cycles, and market signals, generate a data collection strategy with the following constraints:
- Focus niches: electronics and gadgets, beauty, women's fashion, home & decor, pet/toy accessories, gift items
- Platforms: TikTok and Facebook Ads Library
- Geo-target: ONLY US and AU markets (respond with both separately)
- Goal: Detect high-engagement early trend products before saturation

Use this input:
- Past performance: ${JSON.stringify(loadHistoricalTrends(), null, 2)}
- Seasonal trend: ${getSeasonalSignals()}

Respond as two separate scraping strategies in JSON format:
{
  "US": { platform, niche, days, min_engagement, hooks },
  "AU": { platform, niche, days, min_engagement, hooks }
}
  `;

  const res = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [{ role: "system", content: prompt }],
    response_format: { type: "json_object" }
  });

  const strategy = JSON.parse(res.choices[0].message.content);
  fs.writeFileSync("current-strategy.json", JSON.stringify(strategy, null, 2));
  return strategy;
}

getStrategy()
  .then((s) => {
    console.log("✅ Strategy generated successfully:", s);
  })
  .catch((err) => {
    console.error("❌ Error generating strategy:", err);
    process.exit(1);
  });

async function run() {
  const strategy = await getScrapingStrategy();
  console.log(JSON.stringify(strategy));
}

run();
