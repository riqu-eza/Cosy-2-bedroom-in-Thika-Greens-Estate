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
import { createServer } from "http"; // Required for creating HTTP server
import { Server } from "socket.io"; // Socket.IO library
import { io } from "./SocketServer.js"; // Import Socket.IO logic

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

// Middleware
app.use(express.json());
app.use(cors({
  origin: ['https://cosytwobedroominthika.online', "http://localhost:5173"],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));
app.use(cookieParser());

// Create HTTP server and attach Socket.IO
const server = createServer(app); // Express runs on this server
io.attach(server); // Attach Socket.IO to the HTTP server

// Routes
app.use("/api/listing", listingRouter);
app.use("/api/booking", BookingRouter);
app.use("/api/payments", paymentsRouter);
app.use("/api/admin", AdminRouter);
app.use("/api/comment", CommentRouter);

// Static Files
app.use(express.static(path.join(__dirname, "/client/dist")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "dist", "index.html"));
});

app.use("/Receipts", express.static(path.join(__dirname, "Receipts"))); // Serve Receipts folder

// Error Handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});

// Start the server
server.listen(3004, () => {
  console.log("Server is running on port 3004");
});
