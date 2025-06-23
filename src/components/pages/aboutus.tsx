import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Cookies from "js-cookie";

const AboutUsPage = () => {
  const [aboutData, setAboutData] = useState({
    title: "",
    description: "",
    image: null,
    previewImage: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [existingImage, setExistingImage] = useState("");

  // Fetch existing about us data if available
  useEffect(() => {
    const fetchAboutUs = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_UR}admin/get-about-us`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (response.data && response.data.data) {
          setAboutData({
            title: response.data.data.title || "",
            description: response.data.data.description || "",
            image: null,
            previewImage: response.data.data.imageUrl || "",
          });
          setExistingImage(response.data.data.imageUrl || "");
          setEditMode(true);
        }
      } catch (error) {
        console.error("Error fetching about us data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAboutUs();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAboutData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAboutData((prev) => ({
        ...prev,
        image: file,
        previewImage: URL.createObjectURL(file),
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData();
    formData.append("title", aboutData.title);
    formData.append("description", aboutData.description);
    if (aboutData.image) {
      formData.append("image", aboutData.image);
    }

    const token = Cookies.get("admin_token");

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_UR}admin/add-about-us`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success(
        editMode
          ? "About Us updated successfully!"
          : "About Us created successfully!"
      );
      setEditMode(true);
      if (response.data && response.data.data && response.data.data.imageUrl) {
        setExistingImage(response.data.data.imageUrl);
      }
    } catch (error) {
      console.error("Error submitting about us data:", error);
      toast.error(
        error.response?.data?.message ||
          "An error occurred while saving About Us data"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container max-w-6xl px-4 py-8 ml-56 mt-14">
      <ToastContainer position="top-right" autoClose={5000} />
      <h1 className="text-2xl font-bold mb-6">About Us Management</h1>

      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={aboutData.title}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={aboutData.description}
              onChange={handleInputChange}
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="image"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Image
            </label>
            <input
              type="file"
              id="image"
              name="image"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {(aboutData.previewImage || existingImage) && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-1">
                Image Preview:
              </p>
              <img
                src={aboutData.previewImage || existingImage}
                alt="Preview"
                className="max-w-full h-auto max-h-60 rounded-md"
              />
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isLoading
                ? "Saving..."
                : editMode
                ? "Update About Us"
                : "Save About Us"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AboutUsPage;
