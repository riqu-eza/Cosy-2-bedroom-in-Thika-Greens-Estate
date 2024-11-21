/* eslint-disable react/prop-types */
import {
  FaWifi,
  FaTv,
  FaLeaf,
  FaSpa,
  FaSwimmingPool,
  FaParking,
  FaShower,
  FaCut,
  FaBed,
  FaUtensils,
  FaWineGlassAlt,
  FaBabyCarriage,
  FaRegBuilding,
  FaMapMarkerAlt,
  FaLock,
  FaDumbbell,
  FaSnowflake,
  FaArrowUp,
  FaTshirt,
  FaMountain,
  FaCoffee,
  FaFire,
} from 'react-icons/fa'; // Adjust imports as needed

// A mapping of amenity names to their corresponding React icons
const amenityIcons = {
  wifi: <FaWifi />,
  tv: <FaTv />,
  netflix:<FaTv/>,
  fresh: <FaLeaf />, // Fresh air, greenery
  wellness: <FaSpa />, // Spa or wellness facilities
  swimming: <FaSwimmingPool />,
  parking: <FaParking />,
  shower: <FaShower />,
  haircut: <FaCut />, // Haircut/barber services
  bed: <FaBed />, // Bed or sleeping arrangements
  dining: <FaUtensils />, // Dining or restaurant services
  drinks: <FaWineGlassAlt />, // Bar/Drinks service
  baby: <FaBabyCarriage />, // Baby/Child-friendly amenities
  security: <FaLock />, // Security features
  building: <FaRegBuilding />, // Property/building features
  location: <FaMapMarkerAlt />, // Location or neighborhood info
  accessibility: <FaMapMarkerAlt />, // Accessibility options
  quiet: <FaRegBuilding />, // Quiet neighborhood
  gym: <FaDumbbell />, // Gym facilities
  airConditioning: <FaSnowflake />, // Air conditioning
  elevator: <FaArrowUp />, // Elevator
  laundry: <FaTshirt />, // Laundry services
  balcony: <FaMountain />, // Balcony or view
  breakfast: <FaCoffee/>, // Breakfast included
  heating: <FaFire />, 
  hotShower: <FaShower />
};

// Component that displays an amenity with its icon
const Amenity = ({ amenity }) => {
  const icon = amenityIcons[amenity.toLowerCase()];

  return (
    <div className="flex items-center m-1 p-2 border border-gray-300 rounded-full text-sm">
      {icon && (
        <span className="mr-2 text-lg">{icon}</span> // Adjust styling as needed
      )}
      <span>{amenity}</span>
    </div>
  );
};

export default Amenity;
