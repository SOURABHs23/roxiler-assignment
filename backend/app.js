import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import { connectDB } from "./config/db.js";
import { router } from "./routes/transactionRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api", router);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});
