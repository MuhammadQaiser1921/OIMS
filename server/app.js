const express = require("express")
const app = express();
const authenticationRoutes = require("./routes/authenticationRoutes")

app.use(express.json())

const port = process.env.port

app.use("/auth",authenticationRoutes);


app.listen(port,()=>{
    console.log("server listening on port ", port);
})
