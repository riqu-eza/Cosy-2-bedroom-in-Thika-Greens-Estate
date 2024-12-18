/* eslint-disable react/prop-types */
// BookingForm.js
import { useState, useEffect } from "react";
import { io } from "socket.io-client";

const BookingForm = ({ price, initialData }) => {
  const [showBookingOverlay, setShowBookingOverlay] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState(""); // for MPesa
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [checkInDate, setCheckInDate] = useState(initialData?.checkInDate || "");
  const [checkOutDate, setCheckOutDate] = useState(initialData?.checkOutDate || "");
  const [totalNights, setTotalNights] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [guestNumber, setGuestNumber] = useState(initialData?.guestNumber || 1);
  const [receiptNumber, setReceiptNumber] = useState(null);
  const [isBookingEnabled, setIsBookingEnabled] = useState(false);

  const [formDetails, setFormDetails] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  // Calculate total nights and cost
  useEffect(() => {
    if (checkInDate && checkOutDate) {
      const checkIn = new Date(checkInDate);
      const checkOut = new Date(checkOutDate);
      const diffTime = Math.abs(checkOut - checkIn);
      const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setTotalNights(nights);
      setTotalCost(nights * price);
    }
  }, [checkInDate, checkOutDate, price]);

  // WebSocket setup for payment confirmation
  useEffect(() => {
    const socket = io("http://localhost:3005");
    console.log("Connecting to WebSocket server...",socket.id);
  
    socket.on("paymentStatus", (data) => {
      console.log("Received payment status:", data);
      if (data.status === "success") {
        setPaymentStatus("Payment Successful! Proceed to confirm.");
        setReceiptNumber(data.MpesaReceiptNumber);
        setIsBookingEnabled(true);
      } else {
        setPaymentStatus("Payment Failed. Please try again.");
        setReceiptNumber(null);
        setIsBookingEnabled(false);
      }
    });
  
    return () => {
      socket.disconnect();
      console.log("Disconnected from WebSocket server.");
    };
  }, []); // Empty dependency array ensures the WebSocket initializes only once
  

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    const { firstName, lastName, email, phone } = formDetails;
    if (!firstName || !lastName || !email || !phone) {
      alert("Please fill in all personal details.");
      return;
    }

    const bookingData = {
      checkInDate,
      checkOutDate,
      guestNumber,
      totalNights,
      totalCost,
      receiptNumber, // Add receipt number from WebSocket
      formDetails,
    };

    try {
      const response = await fetch("/api/booking/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) {
        throw new Error("Error submitting booking");
      }

      const data = await response.json();
      console.log("Booking successful:", data);
      alert("Booking submitted successfully!");

      // Reset form
      setCheckInDate("");
      setCheckOutDate("");
      setGuestNumber(1);
      setTotalNights(0);
      setTotalCost(0);
      setPhoneNumber("");
      setPaymentStatus(null);
      setFormDetails({ firstName: "", lastName: "", email: "", phone: "" });
      setReceiptNumber(null);
      setIsBookingEnabled(false);
    } catch (error) {
      console.error("Error submitting booking:", error);
      alert("Error: " + error.message);
    }
  };

  const handleMPesaPayment = async () => {
    if (!phoneNumber) {
      setPaymentStatus("Please enter a valid phone number.");
      return;
    }
    try {
      setPaymentStatus("Initiating payment... Please wait.");
      const paymentResponse = await fetch("/api/payments/Mpesapay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber, amount: totalCost }),
      });
  
      if (!paymentResponse.ok) throw new Error("Payment initiation failed.");
  
      const paymentData = await paymentResponse.json();
      if (paymentData.CheckoutRequestID) {
        setPaymentStatus("STK Push sent. Check your phone to complete the transaction.");
      } else {
        setPaymentStatus("Payment initiation failed. Try again.");
      }
    } catch (error) {
      console.error("MPesa payment error:", error);
      setPaymentStatus("An error occurred. Check your connection.");
    }
  };
  

  return (
    <div className="border-black border-2 rounded-md font-[Montserrat] p-4 w-full max-w-5xl mx-auto">
      <h4 className="text-lg font-semibold mb-4 text-center">Book Now</h4>
      <div className="flex flex-col md:flex-row gap-4">
        {/* Booking Dates */}
        <div className="border p-4 w-full md:w-1/3">
          <label>
            Check-In Date:
            <input type="date" value={checkInDate} onChange={(e) => setCheckInDate(e.target.value)} className="p-2 border rounded w-full" />
          </label>
          <label>
            Check-Out Date:
            <input type="date" value={checkOutDate} onChange={(e) => setCheckOutDate(e.target.value)} className="p-2 border rounded w-full" />
          </label>
          <label>
            Number of Guests:
            <input type="number" value={guestNumber} onChange={(e) => setGuestNumber(e.target.value)} className="p-2 border rounded w-full" />
          </label>
          <p>Total Nights: {totalNights}</p>
        </div>

        {/* Personal Details */}
        <div className="border p-4 w-full md:w-1/3">
          <label>First Name: <input type="text" name="firstName" value={formDetails.firstName} onChange={handleInputChange} className="p-2 border rounded w-full" /></label>
          <label>Last Name: <input type="text" name="lastName" value={formDetails.lastName} onChange={handleInputChange} className="p-2 border rounded w-full" /></label>
          <label>Email: <input type="email" name="email" value={formDetails.email} onChange={handleInputChange} className="p-2 border rounded w-full" /></label>
          <label>Phone: <input type="tel" name="phone" value={formDetails.phone} onChange={handleInputChange} className="p-2 border rounded w-full" /></label>
        </div>

        {/* Payment Section */}
        <div className="border p-4 w-full md:w-1/3">
          <p>Total Cost: ${totalCost}</p>
          <button onClick={() => setShowBookingOverlay(true)} className="bg-green-500 text-white p-2 rounded w-full">Pay with MPesa</button>
          {showBookingOverlay && (
            <div className="mt-4">
              <input type="tel" placeholder="Phone Number" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="p-2 border rounded w-full" />
              <button onClick={handleMPesaPayment} className="bg-blue-500 text-white p-2 rounded w-full mt-2">Pay Now</button>
              {paymentStatus && <p>{paymentStatus}</p>}
            </div>
          )}
          <button onClick={handleSubmit} disabled={!isBookingEnabled} className={`p-2 rounded w-full mt-4 ${isBookingEnabled ? "bg-blue-500 text-white" : "bg-gray-300 text-gray-500"}`}>Submit Booking</button>
        </div>
      </div>
    </div>
  );
};

export default BookingForm;
