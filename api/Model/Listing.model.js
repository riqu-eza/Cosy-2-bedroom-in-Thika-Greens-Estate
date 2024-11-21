import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
  lat: {
    type: String,
  },
  lng: {
    type: String,
  },
  location: {
    type: String,
  },
});
// Define the Location Schema
const locationSchema = new mongoose.Schema({
  country: {
    type: String,
    required: true,
  },
  county: {
    type: String,
    required: true,
  },
  address: {
    type: addressSchema,
    required: false,
  },
});

// define the comment Schema


// Define the Property Schema
const propertySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  amenities: {
    type: [String],
    required: true, // You can also use an array of strings if preferred
  },
  type: {
    type: String,
    required: true,
  },
  location: {
    type: locationSchema, // Referencing the location schema
    required: true,
  },
  pricePerNight: {
    type: String,
    required: true,
  },
  checkInTime: {
    type: String,
    required: true,
  },
  checkOutTime: {
    type: String,
    required: true,
  },
  rules: {
    type: [String],
    required: true,
  },
  imageUrls: {
    type: [String], // Array of strings for image URLs
    default: [], // Default to an empty array
  },

});

// Create the Property Model
const Listing = mongoose.model("Property", propertySchema);

export default Listing;
