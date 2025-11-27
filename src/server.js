// server.js

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

// 🔹 CORS – sirf tumhara frontend allow hoga
app.use(
  cors({
    origin: [
      "http://localhost:5173",              // local frontend
      "https://citycarsolution.netlify.app" // live frontend
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  })
);

app.use(express.json());

// 🔹 Health check (mobile / Railway test)
app.get("/api/health", (req, res) => {
  res.json({ ok: true, status: "UP" });
});

// 🔹 API routes
app.use("/api/bookings", bookingRoutes);
app.use("/api/drivers", driverRoutes);

// 🔹 Root route – browser mein direct test
app.get("/", (req, res) => {
  res.send("✅ Backend Running");
});

// 🔹 Start server
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`🚀 Server Running on port ${PORT}`);
});
