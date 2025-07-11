#!/usr/bin/env node

const fs = require("fs");
const { OpenAI } = require("openai");
require("dotenv").config();

const openai = new OpenAI({ apiKey: process.env.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 });

const REGIONS = ["US", "AU"]; // Make this dynamic if needed

async function validateAdsForRegion(region) {
  console.log(`🤖 Validating ads for ${region}...`);
  const ads = JSON.parse(fs.readFileSync(`./output/scraped-${region}.json`, "utf-8"));

  const prompt = `
You are an ad performance analyst.
Analyze the following ads for potential scaling:

Criteria:
- Engagement Velocity (Likes/Comments)
- Hook type effectiveness (FOMO, Before/After, Problem-Solution)
- Product uniqueness
- Risk of saturation
- Trend alignment

Return a JSON list of top 5 validated ads with:
- title
- likes
- videoUrl
- virality_score (0–10)
- reason
- scaling_recommendation ("yes", "maybe", "no")
- hook_type
  `;

  const response = await openai.chat.completions.create({
    model: "gpt-4-1106-preview",
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: "You are an expert in ad trend detection." },
      { role: "user", content: prompt + "\n\n" + JSON.stringify(ads.slice(0, 15)) }
    ]
  });

  const result = JSON.parse(response.choices[0].message.content);
  const filePath = `./output/validated-${region}.json`;
  fs.writeFileSync(filePath, JSON.stringify(result, null, 2));
  console.log(`✅ Saved validated results → ${filePath}`);
}

(async () => {
  for (const region of REGIONS) {
    await validateAdsForRegion(region);
  }
})();

async function run() {
  const strategy = await getScrapingStrategy();
  console.log(JSON.stringify(strategy));
}

run();
