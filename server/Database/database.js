const mysql = require("mysql2") 
const dotenv =require("dotenv").config()

// singelton design pattern for creating database connection instance

class Database {
    constructor ( ){
        if(!Database.instance){
           this.pool = mysql.createPool({
            host:process.env.host,
            user:process.env.user,
            password:process.env.password,
            database:process.env.database,
            waitForConnections:true,
            connectionLimit:10,
            queueLimit:0
           }).promise()
         console.log("connected database pool");
          Database.instance=this;
        }
        return Database.instance;
    }
}

module.exports = new Database();