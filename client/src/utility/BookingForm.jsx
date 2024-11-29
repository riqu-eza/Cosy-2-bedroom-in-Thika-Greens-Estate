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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    // Validate form details
    const { firstName, lastName, email, phone } = formDetails;
    if (!firstName || !lastName || !email || !phone) {
      alert("Please fill in all personal details.");
      return; // Prevent submission if any required fields are missing
    }

    // Form data to send to the API
    const bookingData = {
      checkInDate,
      checkOutDate,
      guestNumber,
      totalNights,
      totalCost,
      formDetails, // Ensure formDetails is included here
    };

    console.log("bookingData", bookingData); // Log for debugging

    try {
      const response = await fetch("/api/booking/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) {
        const errorData = await response.json(); // Parse the error response
        throw new Error(errorData.message || "Error submitting booking");
      }

      const data = await response.json();
      console.log("Booking successful:", data);
      alert("Booking submitted successfully!");

      // Optionally reset form fields
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

      // Call backend to trigger MPesa payment request
      const paymentResponse = await fetch(
        "http://localhost:3004/api/payments/Mpesapay",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phoneNumber, amount: totalCost }), // Use formData.totalPrice directly
        }
      );

      console.log("body", paymentResponse);

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
    <div className="border-black border-2 rounded-md p-4 w-full max-w-5xl justify-center mx-auto ">
      <h4 className="text-lg font-semibold mb-4">Book Now</h4>

      {/* Booking Details */}
      <div className="flex gap-1 ">
        <div className="border border-gray-300 p-2 mb-4 max-w-[350px] ">
          <label>
            Check-In Date:
            <input
              type="date"
              value={checkInDate}
              onChange={(e) => setCheckInDate(e.target.value)}
              className="p-2 border border-gray-300 rounded w-full"
              required
            />
          </label>
          <label>
            Check-Out Date:
            <input
              type="date"
              value={checkOutDate}
              onChange={(e) => setCheckOutDate(e.target.value)}
              className="p-2 border border-gray-300 rounded w-full"
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
              className="p-2 border border-gray-300 rounded w-full"
              required
            />
          </label>
          <p>Total Nights: {totalNights}</p>
        </div>

        {/* Personal Details */}
        <div className="border border-gray-300 p-2 mb-4 max-w-[350px] ">
          <label>
            First Name:
            <input
              type="text"
              name="firstName"
              value={formDetails.firstName}
              onChange={handleInputChange}
              className="p-2 border border-gray-300 rounded w-full"
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
              className="p-2 border border-gray-300 rounded w-full"
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
              className="p-2 border border-gray-300 rounded w-full"
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
              className="p-2 border border-gray-300 rounded w-full"
              required
            />
          </label>
        </div>

        {/* Confirmation */}
        <div className="border border-gray-300 p-2 max-w-[350px] ">
          <p>
            Stay From: {checkInDate || "N/A"} to {checkOutDate || "N/A"}
          </p>
          <p>Total Cost: ${totalCost}</p>
          <div className="mt-6">
            <h1 className="text-xl font-bold ">Pay with</h1>
            <div className="flex flex-col items-center">
              <div className="w-full md:w-1/2">
                <button
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded transition-all"
                  onClick={() => setShowBookingOverlay(true)}
                >
                  Mpesa
                </button>
                {showBookingOverlay && (
                  <div className="payment-section bg-gray-100  rounded-lg shadow-md">
                    <h2 className="text-lg font-thin mb-3">
                      Complete Your Payment with MPesa
                    </h2>
                    <input
                      type="tel"
                      placeholder="Enter MPesa phone number"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      required
                      className="w-full p-2 border border-gray-300 rounded mb-4"
                    />
                    <button
                      type="button"
                      onClick={handleMPesaPayment}
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition-all"
                    >
                      Pay via MPesa
                    </button>
                    {paymentStatus && (
                      <p className="mt-4 text-center text-gray-600 font-medium">
                        {paymentStatus}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          <button
            type="button"
            className="bg-blue-500 text-white py-2 px-4 rounded mt-4"
            onClick={handleSubmit} // Submit form data
          >
            Submit Booking
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingForm;
