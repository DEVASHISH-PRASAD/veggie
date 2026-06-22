import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(
      `📡 MongoDB operational base state linked: ${conn.connection.host}`,
    );
  } catch (error) {
    console.error(`❌ Mongo reference handshake failure: ${error.message}`);
    throw error;
  }
};

export default connectDB;
