import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Amenity from "../utility/amenity";
import BookingForm from "../utility/BookingForm";
import Footer from "../components/footer";
import Viewall from "../utility/images_commect";

const Home = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(true);
  const [error, setError] = useState(null);

  const [bookingData, setBookingData] = useState({
    checkIn: "",
    checkOut: "",
    guests: 1,
  });

  const propertyDescriptionRef = useRef(null);
  const bookingFormRef = useRef(null);
  const [availability, setAvailability] = useState(null);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/listing/getlisting");
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const result = await response.json();
        setData(result);
        console.log("result", result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setBookingData((prevData) => ({
      ...prevData,
      [id]: value, // Dynamically update the field based on input ID
    }));
  };
  const checkAvailability = async () => {
    try {
      const response = await fetch("/api/booking/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData),
      });

      // Check if the response is successful
      if (!response.ok) {
        throw new Error("Failed to check availability. Please try again.");
      }

      const result = await response.json();

      // Update availability based on result
      if (result.available === true) {
        setAvailability(true);
        bookingFormRef.current.scrollIntoView({ behavior: "smooth" });
      } else if (result.available === false) {
        setAvailability(false);
        setMessage("The selected dates are not available.");
        setTimeout(() => {
          setMessage("");
          setBookingData(""); // Clear the message
        }, 10000);
      }
    } catch (error) {
      console.error("Error checking availability:", error);
      setMessage("An error occurred while checking availability.");
    }
  };
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  const property = data.length > 0 ? data[0] : null;

  // Safely access amenities and rules, defaulting to an empty array if `property` is `null`
  const amenitiesArray =
    property?.amenities?.[0]?.split(",").map((amenity) => amenity.trim()) || [];
  // const rules = property?.rules
  //   ? property.rules.split(",").map((rule) => rule.trim())
  //   : [];

  return (
    <>
      <div className="flex flex-wrap items-center w-full gap-2 p-2">
        {/* Left Section */}
        <div className="flex-1 min-w-[200px] p-2">
          {property ? (
            <h2 className="text-center text-xl sm:text-2xl font-bold font-[Poppins] ">
              {property.name}
            </h2>
          ) : (
            <p className="text-center text-sm font-[Montserrat] sm:text-base">
              No property data available.
            </p>
          )}
        </div>

        {/* Right Section */}
        <div className="flex-1 min-w-[200px] p-2 flex font-[Montserrat] justify-center md:justify-end">
          <nav className="flex flex-wrap justify-center gap-4 md:gap-8">
            <Link to="/" className="text-sm sm:text-base hover:underline">
              Home
            </Link>
            <Link
              onClick={() =>
                propertyDescriptionRef.current.scrollIntoView({
                  behavior: "smooth",
                })
              }
              className="text-sm sm:text-base hover:underline"
            >
              About
            </Link>
            <Link
              onClick={() =>
                bookingFormRef.current.scrollIntoView({ behavior: "smooth" })
              }
              className="text-sm sm:text-base hover:underline"
            >
              Book Now
            </Link>
          </nav>
        </div>
      </div>

      {/* Hero Image Section */}
      <div className="relative w-full h-[400px] sm:h-[300px] md:h-[400px] lg:h-[600px] xl:h-[700px]">
        {property && property.imageUrls?.length > 0 && (
          <img
            src={property.imageUrls[0]}
            alt={property.name}
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col gap-6 items-center justify-center p-4">
          <h1 className="text-white font-[Poppins] text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-center animate-slide-in">
            Great Experiences Are Just Around the Corner
          </h1>
          <p className="text-center font-[Montserrat] text-sm sm:text-base md:text-lg lg:text-xl text-white max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl">
            Welcome to your serene escape! Enjoy the tranquility and comfort of
            this beautiful property, where every moment is an invitation to
            unwind and rejuvenate.
          </p>
        </div>
      </div>

      {/* Booking Form Overlay */}
      <div className="relative flex justify-center -mt-16 px-4 sm:px-0">
  <div className="w-full max-w-3xl bg-white bg-opacity-90 p-4 rounded-lg shadow-lg flex flex-col sm:flex-row sm:flex-wrap items-center space-y-4 sm:space-y-0 sm:space-x-4 border border-gray-300">
    {/* Check-in Input */}
    <div className="flex flex-col w-full sm:w-1/3">
      <label htmlFor="checkIn" className="text-sm text-gray-700">
        Check-in
      </label>
      <input
        type="date"
        id="checkIn"
        value={bookingData.checkIn}
        onChange={handleChange}
        className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
      />
    </div>

    {/* Check-out Input */}
    <div className="flex flex-col w-full sm:w-1/3">
      <label htmlFor="checkOut" className="text-sm text-gray-700">
        Check-out
      </label>
      <input
        type="date"
        id="checkOut"
        value={bookingData.checkOut}
        onChange={handleChange}
        className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
      />
    </div>

    {/* Guests Input */}
    <div className="flex flex-col w-full sm:w-1/3">
      <label htmlFor="guests" className="text-sm text-gray-700">
        Guests
      </label>
      <input
        type="number"
        id="guests"
        value={bookingData.guests}
        min="1"
        onChange={handleChange}
        className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
      />
    </div>

    {/* Check Now Button */}
    <div className="w-full flex justify-center sm:justify-start">
      <button
        onClick={checkAvailability}
        className="w-full sm:w-auto p-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition duration-200"
      >
        Check Now
      </button>
    </div>
    
    {/* Message Display */}
    {message && (
      <p className="w-full mt-4 text-center text-gray-700 sm:text-left">
        {message}
      </p>
    )}
  </div>

  {/* Availability Message */}
  {availability !== null && (
    <div className="w-full mt-4 text-center">
      {availability ? (
        <p className="text-green-500">Rooms are available!</p>
      ) : (
        <p className="text-red-500">No rooms available for the selected dates.</p>
      )}
    </div>
  )}
</div>


      {/* Property Description */}
      <div
  ref={propertyDescriptionRef}
  className="p-2 m-1 mt-12 flex flex-col lg:flex-row gap-4"
>
  {property ? (
    <>
      {/* Description Section */}
      <div className="w-full lg:w-1/2 h-auto lg:h-[450px] p-4 text-center text-stone-500 flex flex-col justify-center items-center">
        <p className="first-letter:font-thin font-[Montserrat]  first-letter:text-7xl">
          {property.description}
        </p>
      </div>

      {/* Image Section with Fixed Size */}
      <div className="w-full lg:w-1/2 flex justify-center items-center">
        <div className="w-full max-w-[400px] h-[300px] lg:h-[450px] overflow-hidden p-2">
          <img
            src={property.imageUrls[1]}
            alt={property.name}
            className="w-full h-full object-cover rounded-xl"
          />
        </div>
      </div>
    </>
  ) : (
    <p className="text-center text-stone-500">No property data available.</p>
  )}
</div>

      {/* Propert amenities and rules */}
      <div className="p-1 m-1 mt-12 flex flex-col lg:flex-row gap-4">
  {property ? (
    <>
      {/* Image Section */}
      <div className="w-full lg:w-1/2 p-1 flex justify-center lg:justify-end items-center">
        <div className="w-full max-w-[400px] h-[300px] lg:h-[450px] overflow-hidden p-1">
          <img
            src={property.imageUrls[3]}
            alt={property.name}
            className="w-full h-full object-cover rounded-xl"
          />
        </div>
      </div>

      {/* Amenities and Additional Info Section */}
      <div className="w-full lg:w-1/2 h-auto lg:h-[450px] p-1 flex flex-col gap-4 text-stone-500">
        {/* Top Section */}
        <div className="flex flex-col md:flex-row gap-4 h-auto lg:h-1/2 p-2">
          {/* Amenities */}
          <div className="w-full md:w-1/2">
            <p className="text-center font-[Poppins] font-bold">Amenities You Will Find</p>
            <div className="flex flex-wrap font-[Montserrat]  justify-center mt-2">
              {amenitiesArray.map((amenity, index) => (
                <Amenity key={index} amenity={amenity} />
              ))}
            </div>
          </div>

          {/* Check-in and Check-out Info */}
          <div className="w-full md:w-1/2">
            <p className="text-left text-sm font-[Montserrat]  lg:text-base">
              ✔️ We always welcome our visitors at{" "}
              <span className="font-semibold">{property.checkInTime}</span> and
              say a warm goodbye at{" "}
              <span className="font-semibold">{property.checkOutTime}</span>
            </p>
          </div>
        </div>

        {/* Additional Content */}
        <div className="flex-1 border-t p-2 flex items-center justify-center">
          <div className="text-center">
            <h4 className="text-lg font-semibold text-blue-700 mb-2">
              View on Map
            </h4>
          </div>
        </div>
      </div>
    </>
  ) : (
    <p className="text-center text-gray-500">No property data available.</p>
  )}
</div>

      {/*booking section  */}
      <div ref={bookingFormRef}>
        <BookingForm
          price={property.pricePerNight}
          initialData={{
            checkInDate: bookingData.checkIn,
            checkOutDate: bookingData.checkOut,
            guestNumber: bookingData.guests,
          }}
        />
      </div>
      <div>
        <Viewall property={property} />
      </div>
      <Footer data={property} />
    </>
  );
};

export default Home;
