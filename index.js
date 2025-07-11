console.log("Current file directory:", __dirname);
console.log("Current file path:", __filename);

const express = require("express");
const puppeteer = require("puppeteer");

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/scrape", async (req, res) => {
  try {
    const browser = await puppeteer.launch({
      headless: "new",
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.goto("https://ads.tiktok.com/business/creativecenter/inspiration/topads", {
      waitUntil: "networkidle2",
    });

    // Example: Just get page title
    const title = await page.title();

    await browser.close();
    res.json({ status: "success", title });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
