import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import listingRouter from "./Routes/Listing.route.js";
import BookingRouter from "./Routes/Booking.Route.js";
import paymentsRouter from "./Routes/Payments.Route.js";
import AdminRouter from "./Routes/Admin.Route.js";
import CommentRouter from "./Routes/Comment.Route.js";
import cookieParser from "cookie-parser";
import path from "path";
import cors from "cors";

dotenv.config();

mongoose
  .connect(process.env.MONGO)
  .then(() => {
    console.log("Connected to MongoDB!");
  })
  .catch((err) => {
    console.log(err);
  });

const __dirname = path.resolve();

const app = express();

app.use(express.json());
app.use(cors());
app.use(cookieParser());

app.listen(3004, () => {
  console.log("Server is running on port 3004");
});

app.use("/api/listing", listingRouter);
app.use("/api/booking", BookingRouter);
app.use("/api/payments", paymentsRouter);
app.use("/api/admin", AdminRouter);
app.use("/api/comment", CommentRouter);

app.use(express.static(path.join(__dirname, "/client/dist")));

app.get("*", (req, res, next) => {
  res.sendFile(path.join(__dirname, "client", "dist", "index.html"));
});

app.use("/Receipts", express.static(path.join(__dirname, "Receipts"))); // Ensure 'Receipts' is correctly cased

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});
