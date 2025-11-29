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
    await connectDB();

    // ✅ yahan allowed origins ka array
    const allowedOrigins = [
      "http://localhost:5173",                    // local dev
      "https://citycabsolution.netlify.app",      // purana Netlify
      "https://citycabsolution.vercel.app",       // 🔹 NEW Vercel frontend
    ];

    app.use(
      cors({
        origin: allowedOrigins,
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

startServer();
