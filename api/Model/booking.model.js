// models/Booking.js
import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    checkInDate: { type: Date, required: true },
    checkOutDate: { type: Date, required: true },
    totalNights: { type: Number, required: true },
    totalCost: { type: Number, required: true },
    receiptNumber:{type: String, required: true },
    guestNumber: { type: Number, required: true, min: 1 },
    formDetails: {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      email: { type: String, required: true, match: /.+\@.+\..+/ },
      phone: { type: String, required: true },
    },
  },
  { timestamps: true }
);

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;
