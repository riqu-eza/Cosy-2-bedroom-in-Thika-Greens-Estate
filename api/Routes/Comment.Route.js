import express from 'express';
import { Getrating, newcomment, newrating } from '../Controller/Comment.controller.js';

const router = express.Router();

router.post("/new", newcomment);
router.post("/rating", newrating);
router.get("/getrating", Getrating);
export default router;