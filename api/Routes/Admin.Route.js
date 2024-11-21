import express from "express";
import { bookdate } from "../Controller/Booked.controller.js";

const router = express.Router();

router.post("/bookdate", bookdate);

export default router;
