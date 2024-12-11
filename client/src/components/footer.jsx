/* eslint-disable react/prop-types */
const Footer = ({ data }) => {
  return (
    <>
      <div className="min-h-72 mt-10 m-1 p-4 md:p-6 flex flex-col justify-around bg-black text-white">
        {/* Property Name Section */}
        <div className="text-center">
          <h2 className="text-3xl md:text-5xl font-serif leading-snug">
            {data ? data.name : "No Property Selected"}
          </h2>
          <p className="text-sm md:text-base text-slate-300 mt-2">
            Your #1 Destination
          </p>
        </div>

        {/* Copyright Section */}
        <div className="text-center mt-4 md:mt-6">
          <p className="text-xs md:text-sm">
            &copy; 2024 All rights reserved | Developed by{" "}
            <span className="text-blue-400">Dancah Technology</span>
          </p>
        </div>
      </div>
    </>
  );
};

export default Footer;
