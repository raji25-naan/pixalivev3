const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");
 
const ENVIRONMENT = process.env.NODE_ENV;

if(ENVIRONMENT)
{
    if (fs.existsSync(path.join(process.cwd(), '/.env'))) {
        dotenv.config({ path: ".env" });
    } else {
        process.exit(1);
    }
} 

module.exports.SERVER = {
    MONGODB_URL: "mongodb+srv://pixalive_admin:pixalive@123@cluster0.ticlu.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"
    // MONGODB_URL: "mongodb://localhost:27017/pixalive_db"
    // MONGODB_URL: "mongodb+srv://pixalive_new:pixalive_new@cluster0.mijs7.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"
}