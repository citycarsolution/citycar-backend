import express from "express";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import driverRoutes from "./routes/driverRoutes.js";

dotenv.config();
await connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// api
app.use("/api/bookings", bookingRoutes);
app.use("/api/drivers", driverRoutes);

app.get("/", (req, res) => res.send("✅ Backend Running"));

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
server.listen(PORT, () => console.log(`🚀 Server Running on ${PORT}`));
