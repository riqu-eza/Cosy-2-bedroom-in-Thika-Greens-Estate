import Rating from "../Model/Coments&ratings.model.js";

export const newcomment = async (req, res, next) => {
  console.log(req.body);
  try {
    const listing = await Rating.create(req.body);
    console.log("saved", listing);
    return res.status(200).json(listing);
  } catch (e) {
    next(e);
  }
};

export const Getrating = async (req, res, next) => {
  console.log("getiing them")
  try {
    const rating = await Rating.find();
    res.status(200).json(rating);
  } catch (e) {
    next(e);
  }
};


export const newrating = async (req, res, next) => {
  console.log(req.body);
  try {
    const listing = await Rating.create(req.body);
    console.log("saved", listing);
    return res.status(200).json(listing);
  } catch (e) {
    next(e);
  }
};

