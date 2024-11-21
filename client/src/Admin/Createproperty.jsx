/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from "react";
import Input from "../Ui/ux/Button";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { app } from "../firebase";

const Createproperty = () => {
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  // Define state for each input field
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    amenities: "",
    type: "",
    location: {
      country: "",
      county: "",
      address: { lat: "", lng: "", location: "" },
    },
    pricePerNight: "",
    imageUrls: [],
    checkInTime: "",
    checkOutTime: "",
    rules: "",
  });
  const [files, setFiles] = useState([]);

  const [uploading, setUploading] = useState(false);
  const [imageUploadError, setImageUploadError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (mapRef.current) {
      initMap(); // Initialize map only if mapRef is available
    }
  }, [mapRef]);

  const initMap = () => {
    const initialPosition = { lat: -1.286389, lng: 36.817223 };
    const map = new window.google.maps.Map(mapRef.current, {
      center: initialPosition,
      zoom: 12,
    });

    const marker = new window.google.maps.Marker({
      position: initialPosition,
      map: map,
      draggable: true,
    });

    markerRef.current = marker;

    marker.addListener("dragend", () => {
      const newLat = marker.getPosition().lat();
      const newLng = marker.getPosition().lng();
      setFormData((prev) => ({
        ...prev,
        location: {
          ...prev.location,
          address: { lat: newLat, lng: newLng, location: "" },
        },
      }));
      reverseGeocode(newLat, newLng);
    });
  };

  const reverseGeocode = (lat, lng) => {
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === "OK" && results[0]) {
        setFormData((prev) => ({
          ...prev,
          location: {
            ...prev.location,
            address: {
              ...prev.location.address,
              location: results[0].formatted_address,
            },
          },
        }));
      }
    });
  };

  const handleImageSubmit = () => {
    if (files.length > 0 && files.length + formData.imageUrls.length < 7) {
      setUploading(true);
      setImageUploadError(false);
      const promises = [];

      for (let i = 0; i < files.length; i++) {
        promises.push(storeImage(files[i]));
      }
      Promise.all(promises)
        .then((urls) => {
          setFormData((prev) => ({
            ...prev,
            imageUrls: prev.imageUrls.concat(urls),
          }));
          setImageUploadError(false);
          setUploading(false);
        })
        .catch((err) => {
          setImageUploadError("Image upload failed (2 MB max per image)", err);
          setUploading(false);
        });
    } else if (files.length === 0) {
      setImageUploadError("Select images to upload");
      setUploading(false);
    } else {
      setImageUploadError("You can only upload 6 images per listing");
      setUploading(false);
    }
  };

  const storeImage = async (file) => {
    return new Promise((resolve, reject) => {
      const storage = getStorage(app);
      const fileName = new Date().getTime() + file.name;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`The progress is ${progress}% done`);
        },
        (error) => {
          reject(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            resolve(downloadURL);
          });
        }
      );
    });
  };

  const handleRemoveImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_, i) => i !== index),
    }));
  };

  // Updated handleChange to support nested fields properly
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith("location.")) {
        const locationField = name.split(".")[1];

        setFormData((prev) => ({
            ...prev,
            location: {
                ...prev.location,
                [locationField]: value, // Update only the specific field
                address: {
                    ...prev.location.address // Ensure we keep the existing address structure
                }
            }
        }));
    } else {
        // Update all other fields normally
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    }
};


  
  

  // Submit handler to post data to API
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      console.log(formData);
      const response = await fetch("http://localhost:3004/api/listing/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to submit property information.");
      }

      const data = await response.json();
      console.log("Property submitted successfully:", data);
      // Reset the form on successful submission
      setFormData({
        name: "",
        description: "",
        amenities: "",
        type: "",
        location: {
          country: "",
          county: "",
          address: { lat: "", lng: "", location: "" },
        },
        pricePerNight: "",
        imageUrls: [],
        checkInTime: "",
        checkOutTime: "",
        rules: "",
      });
    } catch (error) {
      console.error("Error:", error);
      setErrorMessage("There was an issue submitting your data.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-lg border border-gray-300 mt-8">
      {/* Heading */}
      <h2 className="text-3xl font-bold text-center text-blue-700 mb-6">Add Property Information</h2>
      <p className="text-center text-gray-600 mb-4">Fill out the details to add your property.</p>
    
      {/* Main Grid for Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Property Name and Description */}
        <Input
          placeholder="Enter property name"
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="border rounded p-2"
        />
        <Input
          placeholder="Enter description"
          type="text"
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          className="border rounded p-2"
        />
    
        {/* Amenities and Type Selection */}
        <Input
          placeholder="Enter amenities (e.g., Wi-Fi, Parking)"
          type="text"
          name="amenities"
          value={formData.amenities}
          onChange={handleChange}
          required
          className="border rounded p-2"
        />
        <select
          name="type"
          value={formData.type}
          onChange={handleChange}
          required
          className="border rounded p-2 bg-gray-50"
        >
          <option value="">Select type</option>
          {/* Add property types here */}
          {["Studio Apartments", "One-Bedroom", "Two-Bedroom", "Three-Bedroom", "Four-Bedroom", "Five-Bedroom", "Cottages", "Cabins", "Farmhouse"].map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
    
        {/* Location Fields */}
        <h4 className="col-span-full text-xl font-semibold text-blue-700 mt-6">Location Details</h4>
        <Input
          placeholder="Enter country"
          type="text"
          name="location.country"
          value={formData.location.country}
          onChange={handleChange}
          required
          className="border rounded p-2"
        />
        <Input
          placeholder="Enter county"
          type="text"
          name="location.county"
          value={formData.location.county}
          onChange={handleChange}
          required
          className="border rounded p-2"
        />

        {/* Price, Check-In/Out Times */}
        <Input
          placeholder="Price per night"
          type="number"
          name="pricePerNight"
          value={formData.pricePerNight}
          onChange={handleChange}
          required
          className="border rounded p-2"
        />
        <Input
          placeholder="Check-in time (e.g., 14:00)"
          type="text"
          name="checkInTime"
          value={formData.checkInTime}
          onChange={handleChange}
          required
          className="border rounded p-2"
        />
        <Input
          placeholder="Check-out time (e.g., 11:00)"
          type="text"
          name="checkOutTime"
          value={formData.checkOutTime}
          onChange={handleChange}
          required
          className="border rounded p-2"
        />

        {/* Rules */}
        <Input
          placeholder="Enter rules (e.g., No smoking)"
          type="text"
          name="rules"
          value={formData.rules}
          onChange={handleChange}
          required
          className="col-span-full border rounded p-2"
        />
    
        {/* Image Upload Section */}
        <div className="col-span-full">
          <label className="block text-gray-700 font-bold mb-2">Upload Images (Max 6):</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setFiles(Array.from(e.target.files))}
            className="border rounded p-2"
          />
          {imageUploadError && <p className="text-red-600">{imageUploadError}</p>}
          <button type="button" onClick={handleImageSubmit} disabled={uploading} className="mt-2 bg-blue-500 text-white rounded p-2">
            {uploading ? "Uploading..." : "Upload Images"}
          </button>
        </div>

        {/* Display Uploaded Images */}
        <div className="col-span-full mt-4">
          <h4 className="text-lg font-semibold">Uploaded Images:</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {formData.imageUrls.map((url, index) => (
              <div key={index} className="relative">
                <img src={url} alt={`Uploaded ${index}`} className="w-full h-32 object-cover rounded" />
                <button
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-1 right-1 text-red-500"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Google Map for Location Selection */}
        <div className="col-span-full mt-6">
          <h4 className="text-lg font-semibold">Select Location on Map:</h4>
          <div
            ref={mapRef}
            className="h-64 w-full rounded border"
          ></div>
        </div>

        {/* Submit Button */}
        <div className="col-span-full mt-6">
          <button
            type="submit"
            onClick={handleSubmit}
            className="w-full bg-blue-500 text-white p-3 rounded hover:bg-blue-600"
          >
            {isLoading ? "Submitting..." : "Submit Property"}
          </button>
          {errorMessage && <p className="text-red-600 mt-2">{errorMessage}</p>}
        </div>
      </div>
    </form>
  );
};

export default Createproperty;
