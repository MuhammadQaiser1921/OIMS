// model/employeeModel.js
const database = require("../Database/database");

// Add a new employee
exports.addEmployeeModel = async (employee_id,firstName, lastName, email, phoneNumber, designation,cnic,address,salary,bank_account,hire_date) => {
  const pool =  database.pool;
  const query = `
    INSERT INTO employees (employee_id,firstName, lastName, email, phoneNumber, designation,cnic,address,salary,bank_account,hire_date)
    VALUES (?, ?, ?, ?, ?,?, ?, ?, ?, ? ,?)
  `;
  const values = [employee_id,firstName, lastName, email, phoneNumber, designation,cnic,address,salary,bank_account,hire_date];
  await pool.query(query, values);
};

// Delete employee by ID
exports.deleteEmployeeModel = async (id,employee_id) => {
  const pool = await database.pool;
  await pool.query("DELETE FROM employees WHERE id = ? and employee_id = ? ", [id,employee_id]);
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

  const query = `UPDATE employees SET ${setClause} WHERE id = ?`;
  values.push(id); // Add ID as last param

  await pool.query(query, values);
};

// Get all employees
exports.getAllEmployeesModel = async () => {
  const pool = await database.pool;
  const [rows] = await pool.query("SELECT * FROM employees");
  return rows;
};
