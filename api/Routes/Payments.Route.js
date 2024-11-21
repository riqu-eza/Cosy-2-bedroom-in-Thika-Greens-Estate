import express from "express";
import { Mpesafall, Mpesapay } from "../Controller/Payments.controller.js";

const router = express.Router();

router.post("/Mpesapay", Mpesapay);
router.post("/mpesa/callback", Mpesafall);

export default router;
