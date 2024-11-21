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
  const { imageUrls = [], name, _id } = property || {}; // Destructure from property

  console.log("Property received:", property); // Debug log to verify

  const [showModal, setShowModal] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [rating, setRating] = useState(4.5); // Example rating
  const [comments, setComments] = useState([]);
  console.log("comments", comments);
  const [newComment, setNewComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null); // Track comment being edited
  const [editCommentText, setEditCommentText] = useState("");

  const [userRating, setUserRating] = useState(0); // User's rating input
  // const [error, setError] = useState(null);

  // Toggle modal visibility
  const toggleModal = () => setShowModal(!showModal);

//   const startEditingComment = (commentId, currentText) => {
//     setEditingCommentId(commentId);
//     setEditCommentText(currentText);
//   };

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await fetch(
          `http://localhost:3004/api/comment/getrating`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch comments");
        }

        const data = await response.json();
        console.log("Comments and rating data:", data);

        // Filter and map to keep 'text' and 'createdAt' for each comment
        const commentData = data
          .filter((item) => item.text)
          .map((item) => ({ text: item.text, date: item.createdAt }));

        // Calculate the average rating from 'value' entries
        const ratingValues = data
          .filter((item) => item.value)
          .map((item) => item.value);

        const averageRating = ratingValues.length
          ? ratingValues.reduce((acc, curr) => acc + curr, 0) /
            ratingValues.length
          : 0;

        setComments(commentData); // Set comments with both text and date
        setRating(averageRating); // Set average rating
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

      // Check if the response is OK, else log and throw an error
      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          "Server response error:",
          response.status,
          response.statusText,
          errorText
        );
        throw new Error("Failed to submit rating");
      }

      // Parse JSON response
      const data = await response.json();
      console.log("Rating submitted successfully:", data);
      setUserRating("");
      // Update the average rating in the state
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
        // const updatedComments = await response.json();
        // setComments(updatedComments);
        setNewComment("");
      } catch (error) {
        console.error("Error submitting comment:", error);
      }
    }
  };
  // Handle comment submission
//   const handleDeleteComment = async (commentId) => {
//     try {
//       const response = await fetch(
//         `http://localhost:3004/api/comment/delete${_id}/${commentId}`,
//         {
//           method: "DELETE",
//         }
//       );
//       if (!response.ok) throw new Error("Failed to delete comment");
//       const updatedComments = await response.json();
//       setComments(updatedComments);
//     } catch (error) {
//       console.error("Error deleting comment:", error);
//     }
//   };

  const saveEditedComment = async () => {
    try {
      const response = await fetch(
        `http://localhost:3004/api/comment/${_id}/${editingCommentId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: editCommentText }),
        }
      );
      if (!response.ok) throw new Error("Failed to edit comment");
      const updatedComments = await response.json();
      setComments(updatedComments);
      setEditingCommentId(null);
      setEditCommentText("");
    } catch (error) {
      console.error("Error editing comment:", error);
    }
  };
  // if (error) {
  //     return <div>Error: {error}</div>;
  // }
  return (
    <>
      <div className="flex  p-1 m-3">
        {/* Left Section: Image Display */}
        <div className="w-1/2 border-r border-gray-600 p-4">
          <p className="text-lg font-semibold mb-2">{name}</p>
          <Swiper
            spaceBetween={10}
            slidesPerView={1}
            pagination={{ clickable: true }}
          >
            {imageUrls.map((image, index) => (
              <SwiperSlide key={index}>
                <img
                  src={image}
                  alt={`Slide ${index + 1}`}
                  className="w-full h-60 object-cover"
                />
              </SwiperSlide>
            ))}
          </Swiper>
          <button
            className="mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
            onClick={toggleModal}
          >
            Show All Images
          </button>
        </div>

        {/* Right Section: Comment & Rating Section */}
        <div className="w-1/2 p-6 bg-white rounded-lg shadow-md">
          {/* Rating Section */}
          <div className="flex items-center mb-6">
            <p className="text-lg font-semibold mr-4">Rating:</p>
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <AiFillStar
                  key={i}
                  color={i < Math.round(rating) ? "#FFD700" : "#C0C0C0"}
                  className="text-2xl"
                />
              ))}
            </div>
            <p className="ml-3 text-lg text-gray-600">
              ({rating.toFixed(1)}/5)
            </p>
          </div>

          {/* User Rating Input */}
          <div className="mb-6">
            <p className="text-lg font-semibold mb-2">Your Rating:</p>
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <AiFillStar
                  key={i}
                  color={i < userRating ? "#FFD700" : "#C0C0C0"}
                  onClick={() => setUserRating(i + 1)}
                  className="text-2xl cursor-pointer"
                />
              ))}
            </div>
            <button
              onClick={handleRatingSubmit}
              className="bg-blue-600 text-white py-2 px-4 rounded-lg mt-3 w-full hover:bg-blue-700 transition duration-200"
            >
              Submit Rating
            </button>
          </div>

          {/* Display Existing Comments */}
          <div className="mt-4">
            <h2 className="text-xl font-semibold mb-3">Comments</h2>
            <div className="h-64 overflow-y-auto border-t border-b border-gray-200 py-3">
              {comments.map((comment) => (
                <div
                  key={comment._id}
                  className="flex justify-between items-start border-b p-3 bg-gray-50 hover:bg-gray-100 transition duration-150"
                >
                  <div>
                    {editingCommentId === comment._id ? (
                      // Show the edit input only for the specific comment in edit mode
                      <>
                        <input
                          type="text"
                          value={editCommentText}
                          onChange={(e) => setEditCommentText(e.target.value)}
                          className="border p-2 w-full rounded-md"
                        />
                        <div className="flex space-x-2 mt-2">
                          <button
                            onClick={saveEditedComment}
                            className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 transition duration-200"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingCommentId(null)} // Exit edit mode
                            className="bg-gray-500 text-white p-2 rounded-lg hover:bg-gray-600 transition duration-200"
                          >
                            Cancel
                          </button>
                        </div>
                      </>
                    ) : (
                      // Show comment text and buttons when not in edit mode
                      <>
                        <p className="text-gray-800">{comment.text}</p>
                        <small className="text-gray-500 block">
                          {new Date(comment.date).toLocaleString()}
                        </small>
                        {/* <div className="flex space-x-2 mt-2">
                          <button
                            onClick={() =>
                              startEditingComment(comment._id, comment.text)
                            }
                            className="text-blue-600 hover:text-blue-700 transition duration-200"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteComment(comment._id)}
                            className="text-red-600 hover:text-red-700 transition duration-200"
                          >
                            Delete
                          </button>
                        </div> */}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add New Comment */}
          <div className="mt-4">
            <input
              type="text"
              placeholder="Enter your comment"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="border p-3 w-full rounded-md focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={handleCommentSubmit}
              className="bg-blue-600 text-white py-2 px-4 rounded-lg mt-3 w-full hover:bg-blue-700 transition duration-200"
            >
              Submit Comment
            </button>
          </div>
        </div>
      </div>

      {/* Modal for Fullscreen Image Swiper */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[10] ">
          <div className="bg-white p-6 w-3/4 h-3/4 overflow-auto">
            <button
              onClick={toggleModal}
              className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full"
            >
              Close
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
                    alt={`Full Image ${index + 1}`}
                    className="w-full h-96 object-cover"
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
