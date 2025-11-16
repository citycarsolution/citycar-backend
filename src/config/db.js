// backend/src/config/db.js
import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/citycar";
const MAX_RETRIES = Number(process.env.MONGO_MAX_RETRIES || 6);
const RETRY_BASE_DELAY_MS = Number(process.env.MONGO_RETRY_DELAY_MS || 1500);

let attempts = 0;
let manualClose = false; // set true if you intentionally close connection in code

function wait(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

async function connectDB() {
  // if already connected, nothing to do
  if (mongoose.connection.readyState === 1) {
    console.log("[mongo] already connected");
    return;
  }

  attempts++;
  console.log(`[mongo] connecting to ${MONGO_URI} (attempt ${attempts})`);

  try {
    // modern mongoose/driver options are automatic; pass none to avoid deprecation warnings
    await mongoose.connect(MONGO_URI);

    console.log("[mongo] connected ✅");
    attempts = 0; // reset attempts on success

    // handlers
    mongoose.connection.on("disconnected", () => {
      if (manualClose) {
        console.log("[mongo] connection closed by application (manualClose)");
        return;
      }
      // don't panic — attempt reconnect with small backoff
      console.warn("[mongo] disconnected — will attempt reconnect in 2s...");
      setTimeout(() => {
        // call connectDB but don't let unhandled rejection crash process
        connectDB().catch(err => {
          console.error("[mongo] reconnect attempt failed:", err && err.message ? err.message : err);
        });
      }, 2000);
    });

    mongoose.connection.on("error", (err) => {
      console.error("[mongo] connection error:", err && err.message ? err.message : err);
    });

    return;
  } catch (err) {
    console.error(`[mongo] connect error (attempt ${attempts}):`, err && err.message ? err.message : err);
    if (attempts < MAX_RETRIES) {
      const delay = RETRY_BASE_DELAY_MS * attempts;
      console.log(`[mongo] retrying in ${delay} ms...`);
      await wait(delay);
      return connectDB();
    } else {
      console.error(`[mongo] failed to connect after ${attempts} attempts. Will keep trying in background.`);
      // in dev we avoid process.exit so nodemon keeps running; continue to try in background:
      setTimeout(() => {
        attempts = 0; // reset and try again
        connectDB().catch(() => {});
      }, RETRY_BASE_DELAY_MS * 10);
    }
  }
}

// helper to close DB cleanly if you need in app shutdown
export async function closeDB() {
  manualClose = true;
  try {
    await mongoose.connection.close(false);
    console.log("[mongo] connection closed cleanly");
  } catch (e) {
    console.warn("[mongo] error closing connection:", e && e.message ? e.message : e);
  }
}

export default connectDB;
