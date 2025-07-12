console.log("Current file directory:", __dirname);
console.log("Current file path:", __filename);

const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

// Just to keep the container alive and confirm it's live
app.get("/", (req, res) => {
  res.json({ status: "🟢 Railway server live", timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
