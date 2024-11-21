import Booked from "../Model/booked.model.js";

export const bookdate = async (req, res, next) => {
    console.log(req.body);
    try {
      const booked = await Booked.create(req.body);
      console.log("saved", booked);
      return res.status(200).json(booked);
    } catch (e) {
      next(e);
    }
  };