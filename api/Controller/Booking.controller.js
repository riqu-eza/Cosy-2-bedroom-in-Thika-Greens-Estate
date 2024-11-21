import Booking from "../Model/booking.model.js";
import PDFDocument from "pdfkit";
import { PassThrough } from "stream";
import { sendEmail } from "../utils/email.js";
import path from "path";
import fs from "fs";
import Booked from "../Model/booked.model.js";

const getDirname = () => {
  return path.dirname(new URL(import.meta.url).pathname);
};

export const createBooking = async (req, res, next) => {
  console.log(req.body); // Log the incoming request body

  // Ensure formDetails is structured correctly
  const {
    checkInDate,
    checkOutDate,
    totalNights,
    totalCost,
    guestNumber,
    formDetails,
  } = req.body;

  try {
    const newBooking = new Booking({
      checkInDate,
      checkOutDate,
      totalNights,
      totalCost,
      guestNumber,
      formDetails,
    });

    const listing = await newBooking.save();

    const receiptsDir = path.resolve(getDirname(), "../Receipts");
    if (!fs.existsSync(receiptsDir)) {
      fs.mkdirSync(receiptsDir, { recursive: true }); // Create directory if it doesn't exist
    }

    const pdfFilePath = path.join(receiptsDir, `${newBooking._id}-receipt.pdf`);
    console.log(`PDF will be saved to: ${pdfFilePath}`);

    const pdfDoc = new PDFDocument();
    const writeStream = fs.createWriteStream(pdfFilePath); // Create a writable stream for the PDF
    pdfDoc.pipe(writeStream); // Pipe directly to file

    // Add content to the PDF
    pdfDoc.fontSize(25).text("Booking Receipt", { align: "center" });
    pdfDoc.moveDown();
    pdfDoc.fontSize(14).text(`Check-In Date: ${checkInDate}`);
    pdfDoc.text(`Check-Out Date: ${checkOutDate}`);
    pdfDoc.text(`Total Nights: ${totalNights}`);
    pdfDoc.text(`Total Cost: $${totalCost}`);
    pdfDoc.text(`Number of Guests: ${guestNumber}`);
    pdfDoc.text(`Guest Name: ${formDetails.firstName} ${formDetails.lastName}`);
    pdfDoc.text(`Contact Email: ${formDetails.email}`);
    pdfDoc.moveDown().text("Thank you for your booking!", { align: "center" });

    // Finalize the PDF
    pdfDoc.end();

    // Wait for the write stream to finish
    writeStream.on('finish', async () => {
      console.log("PDF created successfully.");

      // Check if the PDF was created successfully
      if (!fs.existsSync(pdfFilePath)) {
        throw new Error(`PDF file not created at path: ${pdfFilePath}`);
      }

      const emailBody = `
      <h2 style="color: #4CAF50;">Your Booking Confirmation</h2>
      <p>Dear ${formDetails.firstName} ${formDetails.lastName},</p>
      <p>Thank you for choosing our service! Your booking has been confirmed. Here are the details:</p>
      <table style="width: 100%; border-collapse: collapse;">
          <tr>
              <th style="border: 1px solid #ddd; padding: 8px;">Detail</th>
              <th style="border: 1px solid #ddd; padding: 8px;">Information</th>
          </tr>
          <tr>
              <td style="border: 1px solid #ddd; padding: 8px;"><strong>Check-In Date:</strong></td>
              <td style="border: 1px solid #ddd; padding: 8px;">${checkInDate}</td>
          </tr>
          <tr>
              <td style="border: 1px solid #ddd; padding: 8px;"><strong>Check-Out Date:</strong></td>
              <td style="border: 1px solid #ddd; padding: 8px;">${checkOutDate}</td>
          </tr>
          <tr>
              <td style="border: 1px solid #ddd; padding: 8px;"><strong>Total Nights:</strong></td>
              <td style="border: 1px solid #ddd; padding: 8px;">${totalNights}</td>
          </tr>
          <tr>
              <td style="border: 1px solid #ddd; padding: 8px;"><strong>Total Cost:</strong></td>
              <td style="border: 1px solid #ddd; padding: 8px;">$${totalCost}</td>
          </tr>
          <tr>
              <td style="border: 1px solid #ddd; padding: 8px;"><strong>Guests:</strong></td>
              <td style="border: 1px solid #ddd; padding: 8px;">${guestNumber}</td>
          </tr>
          <tr>
              <td style="border: 1px solid #ddd; padding: 8px;"><strong>Contact Email:</strong></td>
              <td style="border: 1px solid #ddd; padding: 8px;">${formDetails.email}</td>
          </tr>
      </table>
      <p>We look forward to hosting you!</p>
      <p>Best regards,<br/>The Booking Team</p>
      `;

      const attachments = [
        {
          filename: `${newBooking._id}-receipt.pdf`,
          path: pdfFilePath, // Path to the PDF
        },
      ];
      // Send confirmation email to the customer
      await sendEmail(
        formDetails.email,
        "Your Booking Confirmation",
        emailBody,
        attachments
      );
      
      // Save the new booking
      console.log("Saved booking:", listing); // Log the saved booking
      return res.status(201).json(listing); // Return success response
    });

    // Handle write stream errors
    writeStream.on('error', (err) => {
      console.error("Error writing PDF file:", err);
      return res.status(500).json({ message: "Error creating PDF", error: err });
    });
    
  } catch (error) {
    console.error("Error creating booking:", error); // Log the error for debugging
    return res.status(500).json({ message: "Error creating booking", error }); // Return error response
  }
};



export const CheckAvailability = async (req, res) => {
  try {
    const { checkIn, checkOut } = req.body;

    // Convert dates from req.body to Date objects
    const startDate = new Date(checkIn);
    const endDate = new Date(checkOut);

    // Helper function to generate an array of dates from start to end
    const getDatesInRange = (start, end) => {
      const dates = [];
      const date = new Date(start);
      while (date <= end) {
        dates.push(new Date(date).toISOString().split("T")[0]); // Format as YYYY-MM-DD
        date.setDate(date.getDate() + 1);
      }
      return dates;
    };

    // Generate the requested booking range
    const requestedDates = getDatesInRange(startDate, endDate);

    // Query the database to check if any dates in `requestedDates` are already booked
    const existingBookings = await Booked.find({
      dates: { $in: requestedDates } // Check if any requested date exists in the booked dates
    });

    // If any existing bookings are found, availability is false; otherwise, it's true
    if (existingBookings.length > 0) {
      return res.status(200).json({ available: false });
    } else {
      return res.status(200).json({ available: true });
    }
  } catch (error) {
    console.error("Error checking availability:", error);
    return res.status(500).json({ error: "An error occurred. Please try again later." });
  }
};

export const GetAllBookings = async (req, res) => {
  try {
    // Fetch all bookings, sorted by checkInDate in descending order (latest first)
    const bookings = await Booking.find().sort({ checkInDate: -1 });

    // Respond with the sorted bookings
    res.status(200).json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ message: 'Error fetching bookings' });
  }
};

