const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "127.0.0.1",
  database: "postgres",
  password: "password",
  port: 30000,
});

module.exports = pool;
