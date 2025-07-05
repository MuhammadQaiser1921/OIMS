const database = require("../Database/database");

exports.findUserByEmail = async (email) => {
  const pool = await database.pool;
  const [result] = await pool.query("SELECT * FROM Users WHERE email = ?", [email]);
  return result[0];
};

exports.createUser = async (email, hashedPassword, firstName, lastName ,role) => {
  const pool = await database.pool;
  await pool.query(
    "INSERT INTO Users (email, password_hash, firstName , lastName,role) VALUES (?, ?, ?,?,?)",
    [email, hashedPassword, firstName, lastName ,role]
  );
};
