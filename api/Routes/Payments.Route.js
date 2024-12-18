import express from "express";
import { Mpesafall, Mpesapay, Quetime, ResultUrl } from "../Controller/Payments.controller.js";

const router = express.Router();

router.post("/Mpesapay", Mpesapay);
router.post("/mpesa/callback", Mpesafall);
router.post("/Quetime", Quetime);
router.post("/ResultUrl", ResultUrl);

export default router;
