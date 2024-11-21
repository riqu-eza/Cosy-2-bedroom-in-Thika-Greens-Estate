import Listing from "../Model/Listing.model.js";

export const CreateListing = async (req, res, next) => {
    console.log(req.body);
    try {
      const listing = await Listing.create(req.body);
      console.log("saved", listing);
      return res.status(200).json(listing);
    } catch (e) {
      next(e);
    }
  };
  
  export const GetListing = async (req, res, next) => {
    try {
      const listing = await Listing.find();
      res.status(200).json(listing);
    } catch (e) {
      next(e);
    }
  };




