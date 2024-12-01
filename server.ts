const express = require("express");
const { Pool } = require("pg");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
app.use(express.json());

// Database connection pool
const pool = new Pool({
  user: process.env.DB_USER || "app_user",
  password: process.env.DB_PASSWORD || "your_password_here",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "your_database",
  port: parseInt(process.env.DB_PORT || "5432"),
});

// Register a new user
app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "Username and password are required" });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Create a database role for the user
    await client.query(
      `CREATE ROLE "${username}" WITH LOGIN PASSWORD '${password}'`
    );

    // Grant necessary permissions
    await client.query(`GRANT USAGE ON SCHEMA public TO "${username}"`);
    await client.query(
      `GRANT SELECT, INSERT, UPDATE, DELETE ON key_value TO "${username}"`
    );
    await client.query(
      `GRANT USAGE, SELECT ON SEQUENCE key_value_id_seq TO "${username}"`
    );

    await client.query("COMMIT");
    res.json({ message: "User registered successfully" });
  } catch (err) {
    await client.query("ROLLBACK");
    const error = err as Error;
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

// Execute a query
app.post("/query", async (req, res) => {
  const authHeader = req.headers.authorization;
  const { query, params } = req.body;

  if (!authHeader || !query) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Parse Basic Auth header
  const credentials = Buffer.from(authHeader.split(" ")[1], "base64")
    .toString()
    .split(":");
  const username = credentials[0];
  const password = credentials[1];

  // Create a new pool for this specific user
  const userPool = new Pool({
    user: username,
    password: password,
    host: process.env.DB_HOST || "localhost",
    database: process.env.DB_NAME || "your_database",
    port: parseInt(process.env.DB_PORT || "5432"),
  });

  try {
    const result = await userPool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ error: error.message });
  } finally {
    await userPool.end();
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
