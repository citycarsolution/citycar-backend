import express from "express";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import driverRoutes from "./routes/driverRoutes.js";

dotenv.config();

const app = express();

async function startServer() {
  try {
    await connectDB(); // 👈 ab yahan allowed hai

    app.use(
      cors({
        origin: [
          "http://localhost:5173",
          "https://citycabsolution.netlify.app",
        ],
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        credentials: true,
      })
    );

    app.use(express.json());

    app.get("/api/health", (req, res) => {
      res.json({ ok: true, status: "UP" });
    });

    app.use("/api/bookings", bookingRoutes);
    app.use("/api/drivers", driverRoutes);

    app.get("/", (req, res) => {
      res.send("Backend Running 🚀");
    });

    const PORT = process.env.PORT || 5000;
    const server = http.createServer(app);

    server.listen(PORT, () => {
      console.log(`🚀 Server Running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Server Error:", err);
    process.exit(1);
  }
}

startServer(); // 👈 yahan se server start
