const express = require("express");

const dotenv = require("dotenv").config();
const router = express.Router();
const authenticationController = require('../controller/authenticationController')
const database = require("../Database/database");


// test api to see if every thing is setup properly
router.get("/", async (req, res) => {
  const pool = database.pool;
  await pool.execute("INSERT INTO test values('test value')")
  res.send({ mesasge: "test api working" });
});

router.post("/login", (req, res) => {
 authenticationController.loginController(req,res)
});

router.post("/signup", (req, res) => {
  authenticationController.signupController(req,res)
});

module.exports = router;
