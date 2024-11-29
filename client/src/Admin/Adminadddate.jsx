import { useState } from "react";

const AdminAddBooking = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [message, setMessage] = useState("");

  const handleBooking = async () => {
    if (!startDate || !endDate) {
      setMessage("Please provide a  start date, and end date.");
      return;
    }

    // Generate an array of dates between startDate and endDate
    const getDatesInRange = (start, end) => {
      const date = new Date(start);
      const dates = [];

      while (date <= new Date(end)) {
        dates.push(new Date(date).toISOString().split("T")[0]); // format as YYYY-MM-DD
        date.setDate(date.getDate() + 1);
      }

      return dates;
    };

    const dates = getDatesInRange(startDate, endDate);

    // Send to backend
    try {
      const response = await fetch("/api/admin/bookdate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dates }),
      });

      const result = await response.json();
      if (response.ok) {
        setMessage("Dates booked added successfully");
        setEndDate("");
        setStartDate("");
      } else {
        setMessage(result.error || "Error booking dates");
      }
    } catch (error) {
      setMessage("An error occurred. Please try again later.");
    }
  };

  return (
    <div className="p-4 border rounded-lg shadow-lg max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4">Admin: Add Booked Dates</h2>

      <label htmlFor="startDate" className="block mb-2 text-sm font-medium">
        Start Date
      </label>
      <input
        type="date"
        id="startDate"
        className="w-full p-2 border rounded-md mb-4"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
      />

      <label htmlFor="endDate" className="block mb-2 text-sm font-medium">
        End Date
      </label>
      <input
        type="date"
        id="endDate"
        className="w-full p-2 border rounded-md mb-4"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
      />

      <button
        onClick={handleBooking}
        className="w-full p-2 mt-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200"
      >
        Book Dates
      </button>

      {message && (
        <p className="mt-4 text-center text-sm text-gray-700">{message}</p>
      )}
    </div>
  );
};

export default AdminAddBooking;
