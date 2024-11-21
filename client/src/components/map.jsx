/* eslint-disable react/prop-types */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef } from "react";

const Map = ({ isEditable = false, initialPosition, onAddressChange }) => {
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    // Initialize the map only when the component mounts
    const initMap = () => {
      const defaultPosition = initialPosition || { lat: -1.286389, lng: 36.817223 }; // Default to Nairobi

      const map = new window.google.maps.Map(mapRef.current, {
        center: defaultPosition,
        zoom: 12,
      });

      const marker = new window.google.maps.Marker({
        position: defaultPosition,
        map: map,
        draggable: isEditable, // Enable dragging only if in "edit" mode
      });

      markerRef.current = marker;

      if (isEditable) {
        // Update location when the marker is dragged
        marker.addListener("dragend", () => {
          const newLat = marker.getPosition().lat();
          const newLng = marker.getPosition().lng();

          // Reverse geocode to get address
          reverseGeocode(newLat, newLng);

          // Pass updated coordinates back to parent component
          onAddressChange?.({
            lat: newLat,
            lng: newLng,
            address: "", // Placeholder until reverse geocode updates this
          });
        });
      }
    };

    // Initialize map and marker when Google Maps API is loaded
    if (window.google && window.google.maps) {
      initMap();
    }
  }, [initialPosition, isEditable, onAddressChange]);

  // Function to reverse geocode latitude and longitude
  const reverseGeocode = (lat, lng) => {
    const geocoder = new window.google.maps.Geocoder();

    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === "OK" && results[0]) {
        const address = results[0].formatted_address;

        // Pass full address back to parent component if callback exists
        onAddressChange?.({
          lat,
          lng,
          address,
        });
      } else {
        console.error("Geocode was not successful for the following reason:", status);
      }
    });
  };

  return (
    <div
      ref={mapRef}
      style={{ height: "300px", width: "100%", marginTop: "20px" }}
      className="border border-gray-300 rounded"
    ></div>
  );
};

export default Map;
