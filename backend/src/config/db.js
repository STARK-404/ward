const mongoose = require('mongoose');
const MONGO_URI = "mongodb+srv://lalkrishnameet_db_user:J3jb9PcHC2cxYs04@cluster0.gveaoha.mongodb.net/?appName=Cluster0";

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
