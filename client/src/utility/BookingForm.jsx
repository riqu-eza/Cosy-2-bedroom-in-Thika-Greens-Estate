/* eslint-disable react/prop-types */
// BookingForm.js
import { useState, useEffect } from "react";

const BookingForm = ({ price, initialData }) => {
  const [showBookingOverlay, setShowBookingOverlay] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState(""); // for MPesa
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [checkInDate, setCheckInDate] = useState(initialData?.checkInDate || "");
  const [checkOutDate, setCheckOutDate] = useState(initialData?.checkOutDate || "");
  const [totalNights, setTotalNights] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [guestNumber, setGuestNumber] = useState(initialData?.guestNumber || 1);

  const [formDetails, setFormDetails] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

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
      formDetails,
    };

    console.log("bookingData", bookingData);

    try {
      const response = await fetch("/api/booking/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error submitting booking");
      }

      const data = await response.json();
      console.log("Booking successful:", data);
      alert("Booking submitted successfully!");

      setCheckInDate("");
      setCheckOutDate("");
      setGuestNumber(1);
      setTotalNights(0);
      setTotalCost(0);
      setFormDetails({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
      });
    } catch (error) {
      console.error("Error submitting booking:", error);
      alert("There was an error submitting the booking: " + error.message);
    }
  };

  const handleMPesaPayment = async () => {
    try {
      console.log("Mpesa transaction underway...");
      const paymentResponse = await fetch(
        "http://localhost:3004/api/payments/Mpesapay",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phoneNumber, amount: totalCost }),
        }
      );

      if (!paymentResponse.ok) {
        throw new Error(`HTTP error! status: ${paymentResponse.status}`);
      }

      const paymentData = await paymentResponse.json();
      console.log("Payment response", paymentData);

      if (paymentData.status === "pending") {
        setPaymentStatus("Pending confirmation from MPesa.");
      } else {
        setPaymentStatus("Payment failed.");
      }
    } catch (error) {
      console.error("Error during MPesa payment:", error);
      setPaymentStatus(
        "An error occurred during the payment process. Please try again."
      );
    }
  };

  return (
    <div className="border-black border-2 rounded-md font-[Montserrat]  p-4 w-full max-w-5xl mx-auto">
      <h4 className="text-lg font-semibold mb-4 text-center">Book Now</h4>

      {/* Booking Details */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Booking Dates Section */}
        <div className="border border-gray-300 p-4 w-full md:w-1/3">
          <label>
            Check-In Date:
            <input
              type="date"
              value={checkInDate}
              onChange={(e) => setCheckInDate(e.target.value)}
              className="p-2 border rounded w-full"
              required
            />
          </label>
          <label>
            Check-Out Date:
            <input
              type="date"
              value={checkOutDate}
              onChange={(e) => setCheckOutDate(e.target.value)}
              className="p-2 border rounded w-full"
              required
            />
          </label>
          <label>
            Number of Guests:
            <input
              type="number"
              value={guestNumber}
              onChange={(e) => setGuestNumber(e.target.value)}
              min="1"
              className="p-2 border rounded w-full"
              required
            />
          </label>
          <p>Total Nights: {totalNights}</p>
        </div>

        {/* Personal Details Section */}
        <div className="border border-gray-300 p-4 w-full md:w-1/3">
          <label>
            First Name:
            <input
              type="text"
              name="firstName"
              value={formDetails.firstName}
              onChange={handleInputChange}
              className="p-2 border rounded w-full"
              required
            />
          </label>
          <label>
            Last Name:
            <input
              type="text"
              name="lastName"
              value={formDetails.lastName}
              onChange={handleInputChange}
              className="p-2 border rounded w-full"
              required
            />
          </label>
          <label>
            Email:
            <input
              type="email"
              name="email"
              value={formDetails.email}
              onChange={handleInputChange}
              className="p-2 border rounded w-full"
              required
            />
          </label>
          <label>
            Phone:
            <input
              type="tel"
              name="phone"
              value={formDetails.phone}
              onChange={handleInputChange}
              className="p-2 border rounded w-full"
              required
            />
          </label>
        </div>

        {/* Payment Section */}
        <div className="border border-gray-300 p-4 w-full md:w-1/3">
          <p>
            Stay From: {checkInDate || "N/A"} to {checkOutDate || "N/A"}
          </p>
          <p>Total Cost: ${totalCost}</p>
          <button
            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded mt-4"
            onClick={() => setShowBookingOverlay(true)}
          >
            Pay with MPesa
          </button>

          {showBookingOverlay && (
            <div className="mt-4 p-4 bg-gray-100 rounded shadow-md">
              <h2 className="text-lg mb-2">MPesa Payment</h2>
              <input
                type="tel"
                placeholder="Enter MPesa phone number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full p-2 border rounded mb-4"
              />
              <button
                onClick={handleMPesaPayment}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded"
              >
                Pay Now
              </button>
              {paymentStatus && (
                <p className="text-center mt-2 text-gray-600">
                  {paymentStatus}
                </p>
              )}
            </div>
          )}

          <button
            onClick={handleSubmit}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded mt-4"
          >
            Submit Booking
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingForm;
