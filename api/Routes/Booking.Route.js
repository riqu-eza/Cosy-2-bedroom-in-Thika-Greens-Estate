// routes/bookingRoutes.js
import express from "express";
import { CheckAvailability, createBooking, GetAllBookings } from "../Controller/Booking.controller.js";

const router = express.Router();

router.post("/create", createBooking);
router.post("/check", CheckAvailability);
router.get("/getall", GetAllBookings);

export default router;
