// backend/src/routes/driverRoutes.js
import express from "express";
import { listDrivers, createDriver, deleteDriver } from "../controllers/driverController.js";

const router = express.Router();

router.get("/", listDrivers);
router.post("/", createDriver);
router.delete("/:id", deleteDriver);

export default router;
