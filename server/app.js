const express = require("express")
const app = express();
const authenticationRoutes = require("./routes/authenticationRoutes")
const employeeRoutes = require("./routes/employeeRoutes")
app.use(express.json())

const port = process.env.port

// POST http://localhost:5000/auth/login
// POST http://localhost:5000/auth/signup
app.use("/auth",authenticationRoutes);

// POST http://localhost:5000/employee/add 
// DELETE http://localhost:5000/employee/remove/:id
// PUT http://localhost:5000/employee/update/:id
// GET http://localhost:5000/employee/all

app.use("/employee",employeeRoutes)

app.listen(port,()=>{
    console.log("server listening on port ", port);
})
