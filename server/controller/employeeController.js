// controller/employeeController.js
const employeeModel = require("../model/employeeModel");

exports.addNewEmployeeController = async (req, res) => {
  const { firstName, lastName, email, phoneNumber, designation , cnic , address , salary , bank_account, hire_date, employee_id} = req.body;
  if (!firstName || !lastName || !email || !phoneNumber || !designation || !cnic || !address || !salary || !bank_account  || !hire_date || !employee_id) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    await employeeModel.addEmployeeModel(employee_id,firstName, lastName, email, phoneNumber, designation,cnic,address,salary,bank_account,hire_date);
    res.status(201).json({ message: "Employee added successfully" });
  } catch (err) {
    console.error("Add Employee Error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteEmployeeController = async (req, res) => {
  const { id } = req.params;
  const {employee_id} = req.body;
  try {
    await employeeModel.deleteEmployeeModel(id,employee_id);
    res.json({ message: "Employee deleted successfully" });
  } catch (err) {
    console.error("Delete Employee Error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateEmployeeInfoController = async (req, res) => {
  const { id } = req.params;
  const updatedFields = req.body;

  try {
    await employeeModel.updateEmployeeModel(id, updatedFields);
    res.json({ message: "Employee updated successfully" });
  } catch (err) {
    console.error("Update Employee Error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAllEmployeeController = async (req, res) => {
  try {
    const employees = await employeeModel.getAllEmployeesModel();
    res.json(employees);
  } catch (err) {
    console.error("Get Employees Error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};
