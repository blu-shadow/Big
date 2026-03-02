import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected");

    const exists = await User.findOne({ role: "admin" });
    if (exists) {
      console.log("Admin already exists");
      process.exit();
    }

    const admin = await User.create({
      username: "admin",
      password: "dadawear123",
      role: "admin",
    });

    console.log("First admin created successfully");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

createAdmin();
