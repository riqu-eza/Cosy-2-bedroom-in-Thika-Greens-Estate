import Jwt from "jsonwebtoken";
import { errorHandler } from "./error.js";

export const verifyToken = (req, res, next) => {
  const token = req.cookies.access_token;

  if (!token) return next(errorHandler(401, "Unauthorized"));

  Jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return next(errorHandler(403, "forbidden"));

    req.user = user;
    next();
  });
};

export const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  
  // Log the token to ensure it's being passed correctly
  console.log("Token received:", token);

  if (!token) {
    console.log("No token provided");
    return res.sendStatus(401); // Unauthorized
  }

  Jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.log("Token verification failed:", err.message);
      return res.sendStatus(403); // Forbidden
    }
    
    // Log user info to verify it's attached properly
    console.log("User decoded from token:", user);
    req.user = user; // Attach user information to the request object
    next(); // Proceed to the next middleware or route handler
  });
};
