const express = require("express");
const cors = require("cors");
const routes = require("./routes");
const config = require("./config/env");
const { initDatabase } = require("./database/db");

const app = express();

initDatabase();

app.use(
  cors({
    origin: "*",
  })
);
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/v1", routes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Not found" });
});

if (process.env.NODE_ENV !== "production") {
  app.listen(config.port, () => {
    console.log(`Backend running on port ${config.port}`);
  });
}

module.exports = app;
