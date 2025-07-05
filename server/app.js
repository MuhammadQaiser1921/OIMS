const express = require("express")
const app = express();
const authenticationRoutes = require("./routes/authenticationRoutes")
const employeeRoutes = require("./routes/employeeRoutes")
app.use(express.json())

const port = process.env.port

app.use("/auth",authenticationRoutes);
app.use("/employee",employeeRoutes)

app.listen(port,()=>{
    console.log("server listening on port ", port);
})
