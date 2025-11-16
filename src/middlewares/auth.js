// backend/src/middlewares/auth.js
import jwt from "jsonwebtoken";
import User from "../models/User.js"; // adjust path if needed
import dotenv from "dotenv";
dotenv.config();

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;
    if (!token) return res.status(401).json({ message: "Not authorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) return res.status(401).json({ message: "User not found" });

    req.user = user;
    next();
  } catch (err) {
    console.error("Auth error:", err);
    return res.status(401).json({ message: "Invalid token" });
  }
};

export const requireRole = (role) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: "Not authenticated" });
  if (Array.isArray(role) ? !role.includes(req.user.role) : req.user.role !== role) {
    return res.status(403).json({ message: "Forbidden" });
  }
  next();
};
