const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000 // Timeout fast if no local DB
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.log(`MongoDB connection error: ${error.message}`);
        console.log('Falling back to In-Memory MongoDB...');

        try {
            const mongod = await MongoMemoryServer.create();
            const uri = mongod.getUri();

            const conn = await mongoose.connect(uri);
            console.log(`MongoDB Connected (Memory): ${conn.connection.host}`);
        } catch (memError) {
            console.error(`Fatal Error: ${memError.message}`);
            process.exit(1);
        }
    }
};

module.exports = connectDB;
