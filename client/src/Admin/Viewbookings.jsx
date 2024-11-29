import { useEffect, useState } from 'react';

const ViewBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState(null);

  // Function to fetch bookings
  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/booking/getall'); // Replace with your actual API endpoint
      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }
      const data = await response.json();
      setBookings(data);
      console.log("data", data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h3 className="text-2xl font-bold mb-4">Available Bookings</h3>
      {error ? (
        <p className="text-red-500">{error}</p>
      ) : bookings.length === 0 ? (
        <p>No bookings available for the selected date.</p>
      ) : (
        <ul className="space-y-4">
          {bookings.map((booking) => (
            <li 
              key={booking._id} 
              className="p-4 bg-white rounded-md shadow-md border border-gray-200"
            >
              <h4 className="text-xl font-semibold text-gray-800 mb-2">
                Booking for {booking.formDetails.firstName} {booking.formDetails.lastName}
              </h4>
              <p className="text-gray-600">
                Check-in Date: {new Date(booking.checkInDate).toLocaleDateString()}
              </p>
              <p className="text-gray-600">
                Check-out Date: {new Date(booking.checkOutDate).toLocaleDateString()}
              </p>
              <p className="text-gray-600">Total Nights: {booking.totalNights}</p>
              <p className="text-gray-600">Total Cost: ${booking.totalCost}</p>
              <p className="text-gray-600">Guests: {booking.guestNumber}</p>
              <p className="text-gray-600">
                Contact: {booking.formDetails.email}, {booking.formDetails.phone}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ViewBookings;
