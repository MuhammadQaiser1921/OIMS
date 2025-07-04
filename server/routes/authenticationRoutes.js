const express = require("express");
const dotenv = require("dotenv").config();
const router = express.Router();
const database = require("../Database/database");

// test api to see if every thing is setup properly
router.get("/", async (req, res) => {
  const pool = database.pool;
  await pool.execute("INSERT INTO test values('test value')")
  res.send({ mesasge: "test api working" });
});

router.post("/login", (req, res) => {
  res.send({ message: "login Successfull" });
});

router.post("/signup", (req, res) => {
  res.send({ message: "signup Successfull" });
});

module.exports = router;
