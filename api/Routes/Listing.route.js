import express from 'express';
import { CreateListing, GetListing,   } from '../Controller/Listing.controller.js';

const router = express.Router();

router.post("/create", CreateListing)
router.get("/getlisting", GetListing)
export default router;