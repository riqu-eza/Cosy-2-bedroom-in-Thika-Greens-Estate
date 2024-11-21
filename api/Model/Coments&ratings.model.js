import mongoose from "mongoose";

const ratingSchema = new mongoose.Schema({
  text: {
    type: String,
    required: false,
  },
  value: { type: Number, required: false },

  averageRating: { type: Number, default: 0 }, 

}, {timestamps:true} );


const Rating = mongoose.model("rating", ratingSchema);

export default Rating;
