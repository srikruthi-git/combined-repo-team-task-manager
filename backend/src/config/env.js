const path = require("path");

const config = {
  port: process.env.PORT || 4000,
  corsOrigin: process.env.CORS_ORIGIN || "*",
  dbFile:
    process.env.DB_FILE ||
    path.join(__dirname, "..", "database", "data", "database.sqlite"),
};

module.exports = config;
