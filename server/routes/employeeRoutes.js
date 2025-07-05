const express = require("express");
const dotenv = require("dotenv").config();
const router = express.Router();
const authenticationController = require('../controller/authenticationController')
const employeeController = require("../controller/employeeController")
const database = require("../Database/database");

router.post("/add", employeeController.addNewEmployeeController);

router.delete("/remove/:id", employeeController.deleteEmployeeController);

router.put("/update/:id", employeeController.updateEmployeeInfoController);

router.get("/all", employeeController.getAllEmployeeController);







module.exports = router