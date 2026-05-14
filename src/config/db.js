const mysql = require("mysql2/promise");
require("dotenv").config();

const db = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT,                    // ← NUEVO
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "beta_opencivil",
  ssl: { rejectUnauthorized: false },            // ← NUEVO
});

module.exports = db;