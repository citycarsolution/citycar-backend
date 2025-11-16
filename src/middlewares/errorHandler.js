// backend/src/middlewares/errorHandler.js
export default function errorHandler(err, req, res, next) {
  console.error(err);
  const status = err.status || 500;
  const message = err.message || "Server Error";
  res.status(status).json({ message, stack: process.env.NODE_ENV === "production" ? undefined : err.stack });
}
