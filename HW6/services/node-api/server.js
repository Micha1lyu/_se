onst express = require("express");
const { Pool } = require("pg");
const os = require("os");

const app = express();
app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST || "db",
  port: parseInt(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || "dockeruser",
  password: process.env.DB_PASSWORD || "dockerpass",
  database: process.env.DB_NAME || "microdb",
});

app.get("/api/node/health", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW() AS db_time");
    res.json({
      status: "healthy",
      service: "Node.js Express API",
      container_id: os.hostname(),
      node_version: process.version,
      db_time: result.rows[0].db_time,
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

app.get("/api/node/logs", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM service_logs ORDER BY id DESC LIMIT 20"
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

app.post("/api/node/logs", async (req, res) => {
  const { author, message } = req.body;
  if (!author || !message) {
    return res.status(400).json({ error: "author and message are required" });
  }
  try {
    const result = await pool.query(
      "INSERT INTO service_logs (service_name, author, message) VALUES ($1, $2, $3) RETURNING *",
      ["Web UI (via Node.js)", author, message]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Node.js API listening on 0.0.0.0:${PORT}`);
});