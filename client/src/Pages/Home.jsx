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
        const response = await fetch(
          "/api/listing/getlisting"
        );
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
      <div className="flex w-full gap-1 m-1 p-1">
        <div className="w-1/3 p-2">
          {property ? (
            <h2 className="p-1 text-center text-2xl font-bold">
              {property.name}
            </h2>
          ) : (
            <p>No property data available.</p>
          )}
        </div>

        <div className="w-2/3 p-2 flex items-center">
          <nav className="flex space-x-28 p-1 justify-evenly ml-80">
            <Link to="/" className="p-1 hover:underline">
              Home
            </Link>
            <Link
              onClick={() =>
                propertyDescriptionRef.current.scrollIntoView({
                  behavior: "smooth",
                })
              }
              className="p-1 hover:underline"
            >
              About
            </Link>

            <Link
              onClick={() =>
                bookingFormRef.current.scrollIntoView({ behavior: "smooth" })
              }
              className="p-1 hover:underline"
            >
              Book Now
            </Link>
          </nav>
        </div>
      </div>

      {/* Hero Image Section */}
      <div className="relative h-[600px]">
        {property && property.imageUrls?.length > 0 && (
          <img
            src={property.imageUrls[0]}
            alt={property.name}
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col gap-6 items-center justify-center">
          <h1 className="text-white text-5xl font-bold text-center animate-slide-in">
            Great Experiences Are Just Around the Corner
          </h1>
          <p className="text-center text-xl text-white max-w-2xl">
            Welcome to your serene escape! Enjoy the tranquility and comfort of
            this beautiful property, where every moment is an invitation to
            unwind and rejuvenate.
          </p>
        </div>
      </div>

      {/* Booking Form Overlay */}
      <div className="relative flex justify-center -mt-16">
        <div className="w-full max-w-3xl h-40 bg-white bg-opacity-90 p-4 rounded-lg shadow-lg flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4 border border-gray-300">
          {/* Check-in Input */}
          <div className="flex flex-col">
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
          <div className="flex flex-col">
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
          <div className="flex flex-col">
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
          <button
            onClick={checkAvailability}
            className="p-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition duration-200"
          >
            Check Now
          </button>
          {message && <p className="mt-4 text-gray-700">{message}</p>}
        </div>

        {/* Availability Message */}
        {availability !== null && (
          <div className="mt-4 text-center">
            {availability ? (
              <p className="text-green-500"></p>
            ) : (
              <p className="text-red-500"></p>
            )}
          </div>
        )}
      </div>

      {/* Property Description */}
      <div ref={propertyDescriptionRef} className="p-1 m-1 mt-12 flex gap-1">
        {property ? (
          <>
            {/* Description Section */}
            <div className="w-1/2 h-[450px] p-2 text-center text-stone-500 flex flex-col justify-center items-center">
              <p className="first-letter:font-thin first-letter:text-7xl">
                {property.description}
              </p>
            </div>

            {/* Image Section with Fixed Size */}
            <div className="w-1/2 p-1 flex justify-self-start items-center">
              <div className="w-[400px] h-[450px] overflow-hidden p-1">
                <img
                  src={property.imageUrls[1]}
                  alt={property.name}
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>
            </div>
          </>
        ) : (
          <p>No property data available.</p>
        )}
      </div>
      {/* Propert amenities and rules */}
      <div className="p-1 m-1 mt-12 flex gap-1">
        {property ? (
          <>
            <div className="w-1/2 p-1 flex justify-end items-center">
              <div className="w-[400px] h-[450px] overflow-hidden p-1">
                <img
                  src={property.imageUrls[3]}
                  alt={property.name}
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>
            </div>
            <div className="w-1/2 h-[450px] p-1 gap-1 text-stone-500 flex flex-col ">
              <div className="flex gap-1 h-1/2  p-2">
                <div className=" w-1/2">
                  <p className="text-center font-bold">
                    Amenities You Will Find
                  </p>
                  <div className="flex flex-wrap justify-center mt-2">
                    {amenitiesArray.map((amenity, index) => (
                      <Amenity key={index} amenity={amenity} />
                    ))}
                  </div>
                </div>
                <div className="w-1/2">
                  <p className="text-left text-thin text-base ">
                    ✔️ We always welcome our visitors @{property.checkInTime}{" "}
                    and say a warm goodbye @{property.checkOutTime}
                  </p>
                  {/* <div className="mt-4">
                    {rules.length > 0 && (
                      <>
                        <h5 className="text-center font-semibold mb-2">
                          Property Rules
                        </h5>
                        <ul className="list-none space-y-2">
                          {rules.map((rule, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <span className="text-green-500">✔️</span>
                              <span>{rule}</span>
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div> */}
                </div>
              </div>

              {/* Additional Content */}
              <div className="flex-1 border-t p-2 flex items-center justify-center  h-1/2">
                <div className="col-span-full">
                  <h4 className="text-lg font-semibold text-blue-700 mb-2">
                    view on map
                  </h4>
                 
                </div>
              </div>
            </div>
          </>
        ) : (
          <p>No property data available.</p>
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
