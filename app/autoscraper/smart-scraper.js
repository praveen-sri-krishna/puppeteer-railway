#!/usr/bin/env node

const fs = require("fs");
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());

const strategyFile = "./current-strategy.json";
const SELECTORS = {
  tiktok: {
    container: ".inspiration-card",
    title: ".ad-detail-title",
    likes: '[data-e2e="like-count"]',
    video: "video"
  },
  facebook: {
    container: ".x78zum5",
    title: "h4",
    likes: '[aria-label*="Like"], [aria-label*="like"]',
    video: "video"
  }
};

async function autoScroll(page) {
  await page.evaluate(async () => {
    for (let i = 0; i < 10; i++) {
      window.scrollBy(0, window.innerHeight);
      await new Promise(r => setTimeout(r, 1500));
    }
  });
}

async function scrapeRegion(region, config) {
  console.log(`🌍 Scraping ${region.toUpperCase()} (${config.platform}, ${config.niche})`);

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  // Navigate to appropriate platform
  if (config.platform === "tiktok") {
    await page.goto("https://ads.tiktok.com/business/creativecenter/inspiration/topads", { waitUntil: "domcontentloaded" });
  } else {
    await page.goto("https://www.facebook.com/ads/library", { waitUntil: "domcontentloaded" });
  }

  await autoScroll(page);

  // Use self-healing selectors
  const sel = SELECTORS[config.platform];
  const ads = await page.$$eval(sel.container, (cards, sel, config) => {
    return cards.map(card => {
      const likes = card.querySelector(sel.likes);
      return {
        title: card.querySelector(sel.title)?.innerText || "",
        likes: likes ? parseInt((likes.getAttribute("aria-label") || "").replace(/\D/g, "")) : 0,
        video: card.querySelector(sel.video)?.src || ""
      };
    }).filter(ad => ad.likes >= config.min_engagement);
  }, sel, config);

  await browser.close();

  const outputPath = `./output/scraped-${region}.json`;
  fs.writeFileSync(outputPath, JSON.stringify(ads, null, 2));
  console.log(`✅ Saved ${ads.length} ads for ${region} → ${outputPath}`);
}

(async () => {
  const strategy = JSON.parse(fs.readFileSync(strategyFile, "utf-8"));

  for (const [region, config] of Object.entries(strategy)) {
    await scrapeRegion(region, config);
  }
})();

async function run() {
  const strategy = await getScrapingStrategy();
  console.log(JSON.stringify(strategy));
}

run();
