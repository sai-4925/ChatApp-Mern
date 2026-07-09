const dotenv = require("dotenv");
const mongoose = require("mongoose");

// Fixed path to look in the current directory
dotenv.config({ path: "./.env" }); 

// Changed the name to avoid conflicts and added 'const'
const testConnectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      autoIndex: process.env.NODE_ENV !== "production",
    });
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Failed to connect to MongoDB: ${error.message}`);
    process.exit(1);  
  }
};

testConnectDB();