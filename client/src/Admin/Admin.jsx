import { Link } from "react-router-dom";

const Admin = () => {
  return (
    <div className="flex space-x-4">
      <Link
        to="/create"
        className="text-white bg-green-500 px-4 py-2 rounded-md font-semibold hover:bg-green-600 transition duration-200"
      >
        Create Listing
      </Link>
      <Link
        to="/book-date"
        className="text-white bg-blue-500 px-4 py-2 rounded-md font-semibold hover:bg-blue-600 transition duration-200"
      >
        Add Book Date
      </Link>
      <Link
        to="/viewbookings"
        className="text-white bg-purple-500 px-4 py-2 rounded-md font-semibold hover:bg-blue-300 transition duration-200"
      >viewbookings</Link>
    </div>
  );
};

export default Admin;
