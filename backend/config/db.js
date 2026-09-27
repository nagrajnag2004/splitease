const mongoose = require('mongoose');
const dns = require('dns');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Fix for Windows Node.js SRV DNS lookup issues (querySrv ECONNREFUSED)
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // Ignore if DNS server configuration fails
}

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/splitease';
    console.log(`[DB] Attempting connection to MongoDB at: ${mongoUri}`);
    
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 8000
    });
    console.log(`[DB] MongoDB Atlas Connected Successfully: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.warn(`[DB] Primary MongoDB connection failed (${error.message}). Falling back to in-memory MongoDB server...`);
    try {
      const mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();
      const conn = await mongoose.connect(uri);
      console.log(`[DB] In-Memory MongoDB Connected successfully at: ${uri}`);
    } catch (memErr) {
      console.error(`[DB] Failed to start In-Memory MongoDB: ${memErr.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
