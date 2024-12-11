/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { AiFillStar } from "react-icons/ai";
import SwiperCore from "swiper";
import { Navigation, Pagination } from "swiper/modules";

SwiperCore.use([Navigation, Pagination]);

const Viewall = (data) => {
  const { property } = data; // Destructure property from data
  // eslint-disable-next-line no-unused-vars
  const { imageUrls = [], name, _id } = property || {}; // Destructure from property

  console.log("Property received:", property);

  const [showModal, setShowModal] = useState(false);
  const [rating, setRating] = useState(4.5); // Example rating
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [userRating, setUserRating] = useState(0); // User's rating input

  const toggleModal = () => setShowModal(!showModal);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await fetch(`/api/comment/getrating`);
        if (!response.ok) throw new Error("Failed to fetch comments");

        const data = await response.json();
        const commentData = data
          .filter((item) => item.text)
          .map((item) => ({ text: item.text, date: item.createdAt }));

        const ratingValues = data
          .filter((item) => item.value)
          .map((item) => item.value);

        const averageRating = ratingValues.length
          ? ratingValues.reduce((acc, curr) => acc + curr, 0) /
            ratingValues.length
          : 0;

        setComments(commentData);
        setRating(averageRating);
      } catch (error) {
        console.error("Error fetching comments:", error);
      }
    };

    fetchComments();
  }, []);

  const handleRatingSubmit = async () => {
    try {
      const response = await fetch(`http://localhost:3004/api/comment/rating`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: userRating }),
      });

      if (!response.ok) throw new Error("Failed to submit rating");
      const data = await response.json();
      console.log("Rating submitted successfully:", data);
      setUserRating(0);
    } catch (error) {
      console.error("Error submitting rating:", error.message || error);
    }
  };

  const handleCommentSubmit = async () => {
    if (newComment.trim()) {
      try {
        const response = await fetch(`http://localhost:3004/api/comment/new/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: newComment }),
        });
        if (!response.ok) throw new Error("Failed to submit comment");
        setNewComment("");
      } catch (error) {
        console.error("Error submitting comment:", error);
      }
    }
  };

  return (
    <>
      <div className="flex flex-col md:flex-row p-2 gap-4 m-3">
        {/* Left Section: Image Display */}
        <div className="w-full md:w-1/2 border-r border-gray-300 p-4">
          <p className="text-lg font-[Poppins] text-[] font-semibold mb-4">
            {name}
          </p>
          <Swiper
            modules={[Pagination, Navigation]} // Enable Pagination and Navigation
            spaceBetween={10}
            slidesPerView={1}
            pagination={{
              clickable: true,
              dynamicBullets: true, // Optional: Dynamic bullets
            }}
            navigation={{
              clickable: true,
              // dynamicBullets: true, // Optional: Dynamic bullets
            }} // Enable navigation arrows
            className="w-full"
          >
            {imageUrls.map((image, index) => (
              <SwiperSlide key={index}>
                <img
                  src={image}
                  alt={`Slide ${index + 1}`}
                  className="w-full h-60 md:h-80 object-cover rounded-md"
                />
              </SwiperSlide>
            ))}
          </Swiper>
          <button
            className="mt-4 bg-blue-500 text-white py-2 px-4 font-[Montserrat]  rounded hover:bg-blue-600 transition"
            onClick={toggleModal}
          >
            Show All Images
          </button>
        </div>

        {/* Right Section: Comments and Rating */}
        <div className="w-full md:w-1/2 p-4 bg-white rounded-lg shadow-md">
          {/* Rating Section */}
          <div className="flex items-center mb-6">
            <p className="text-lg font-semibold font-[Montserrat]  mr-4">
              Rating:
            </p>
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <AiFillStar
                  key={i}
                  color={i < Math.round(rating) ? "#FFD700" : "#C0C0C0"}
                  className="text-2xl font-[Montserrat] "
                />
              ))}
            </div>
            <p className="ml-3 text-gray-600 font-[Montserrat] ">
              {rating.toFixed(1)}/5
            </p>
          </div>

          {/* User Rating Input */}
          <div className="mb-6">
            <p className="font-semibold mb-2 font-[Montserrat] ">
              Your Rating:
            </p>
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <AiFillStar
                  key={i}
                  color={i < userRating ? "#FFD700" : "#C0C0C0"}
                  onClick={() => setUserRating(i + 1)}
                  className="text-2xl cursor-pointer font-[Montserrat] "
                />
              ))}
            </div>
            <button
              onClick={handleRatingSubmit}
              className="bg-blue-600 text-white py-2 px-4 font-[Montserrat]  rounded mt-3 w-full hover:bg-blue-700"
            >
              Submit Rating
            </button>
          </div>

          {/* Comments Section */}
          <div className="mt-4">
            <h2 className="text-lg font-[Poppins] font-semibold mb-2">
              Comments
            </h2>
            <div className="h-64 overflow-y-auto border-t border-b border-gray-300 py-3">
              {comments.map((comment, index) => (
                <div
                  key={index}
                  className="p-2 bg-gray-50 rounded font-[Montserrat]  mb-2 hover:bg-gray-100"
                >
                  <p>{comment.text}</p>
                  <small className="text-gray-500">
                    {new Date(comment.date).toLocaleString()}
                  </small>
                </div>
              ))}
            </div>
            <input
              type="text"
              placeholder="Enter your comment"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="border p-2 w-full rounded mt-3 focus:outline-none"
            />
            <button
              onClick={handleCommentSubmit}
              className="bg-blue-600 text-white font-[Poppins] py-2 px-4 rounded mt-3 w-full hover:bg-blue-700"
            >
              Submit Comment
            </button>
          </div>
        </div>
      </div>

      {/* Modal for Images */}
      {/* Modal for Images */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
          <div className="relative w-full h-full md:w-3/4 md:h-3/4 bg-white rounded-lg overflow-hidden">
            {/* Close Button */}
            <button
              onClick={toggleModal}
              className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded-full z-10 hover:bg-red-600 transition duration-200"
            >
              ✕
            </button>
            <Swiper
              navigation
              pagination={{ clickable: true }}
              className="h-full"
            >
              {imageUrls.map((image, index) => (
                <SwiperSlide key={index}>
                  <img
                    src={image}
                    alt={`Full View ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      )}
    </>
  );
};

export default Viewall;
