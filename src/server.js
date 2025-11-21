// server.js (ya src/server.js)

import express from "express";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import driverRoutes from "./routes/driverRoutes.js";

dotenv.config();

// 🔹 Database connect
await connectDB();

const app = express();

// 🔹 CORS – frontend origin allow karo
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://citycarsolution.netlify.app", // tumhara live frontend
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  })
);

app.use(express.json());

// 🔹 Health check route (Railway / mobile test ke liye)
app.get("/api/health", (req, res) => {
  res.json({ ok: true, status: "UP" });
});

// 🔹 API routes
app.use("/api/bookings", bookingRoutes);
app.use("/api/drivers", driverRoutes);

// 🔹 Root route – browser se direct check ke liye
app.get("/", (req, res) => {
  res.send("✅ Backend Running");
});

// 🔹 Start server
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`🚀 Server Running on port ${PORT}`);
});
