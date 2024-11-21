import mongoose from "mongoose";

const bookedSchema = new mongoose.Schema({
    dates: { type: [String], required: true },
},
{ timestamps: true }
)

const Booked = mongoose.model(" Booked ",bookedSchema )

export default Booked;