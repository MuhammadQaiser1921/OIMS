// model/employeeModel.js
const database = require("../Database/database");

// Add a new employee
exports.addEmployeeModel = async (firstName, lastName, email, phoneNumber, designation) => {
  const pool =  database.pool;
  const query = `
    INSERT INTO Employees (firstName, lastName, email, phoneNumber, designation)
    VALUES (?, ?, ?, ?, ?)
  `;
  const values = [firstName, lastName, email, phoneNumber, designation];
  await pool.query(query, values);
};

// Delete employee by ID
exports.deleteEmployeeModel = async (id) => {
  const pool = await database.pool;
  await pool.query("DELETE FROM Employees WHERE id = ?", [id]);
};

// Update employee
exports.updateEmployeeModel = async (id, updatedFields) => {
  const pool = await database.pool;

  const keys = Object.keys(updatedFields);
  
  const values = Object.values(updatedFields);

  if (keys.length === 0) {
    throw new Error("No fields provided for update.");
  }

  // Build dynamic SET clause like: "firstName = ?, email = ?"
  const setClause = keys.join("=?,") + "=?";

  const query = `UPDATE Employees SET ${setClause} WHERE id = ?`;
  values.push(id); // Add ID as last param

  await pool.query(query, values);
};

// Get all employees
exports.getAllEmployeesModel = async () => {
  const pool = await database.pool;
  const [rows] = await pool.query("SELECT * FROM Employees");
  return rows;
};
