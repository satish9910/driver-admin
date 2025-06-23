import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Cookies from "js-cookie";

const PrivacyPolicy = () => {
  const [formData, setFormData] = useState({
    title: "Privacy Policy",
    description: "",
    image: null,
    previewImage: null,
  });
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [existingData, setExistingData] = useState(null);
  const token = Cookies.get("admin_token");
  // Fetch existing privacy policy data
  useEffect(() => {
    const fetchPrivacyPolicy = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_UR}admin/get-privacy-policy`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.data) {
          setExistingData(response.data);
          setFormData({
            title: response.data.title || "Privacy Policy",
            description: response.data.description || "",
            previewImage: response.data.imageUrl || null,
          });
          setIsEditing(true);
        }
        toast.success(
          response.data
            ? "Privacy Policy fetched successfully!"
            : "No existing Privacy Policy found."
        );
      } catch (error) {
        console.error("Error fetching privacy policy:", error);
      }
    };

    fetchPrivacyPolicy();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        image: file,
        previewImage: URL.createObjectURL(file),
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    data.append("title", formData.title);
    data.append("description", formData.description);
    if (formData.image) {
      data.append("image", formData.image);
    }

    try {
      const url = isEditing
        ? `${import.meta.env.VITE_BASE_UR}admin/add-privacy-policy`
        : `${import.meta.env.VITE_BASE_UR}admin/add-privacy-policy`;

      const response = await axios({
        method: isEditing ? "post" : "post",
        url: url,
        data: data,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success(
        `Privacy Policy ${isEditing ? "updated" : "added"} successfully!`
      );
      setExistingData(response.data);
      setIsEditing(true);
    } catch (error) {
      console.error("Error:", error);
      toast.error(`Failed to ${isEditing ? "update" : "add"} Privacy Policy`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-6xl px-4 py-8 ml-56 mt-14">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Privacy Policy Management
      </h1>

      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={12}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="image"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Image
            </label>
            <input
              type="file"
              id="image"
              name="image"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {formData.previewImage && (
              <div className="mt-4">
                <img
                  src={formData.previewImage}
                  alt="Preview"
                  className="max-w-xs max-h-40 object-contain border border-gray-200 rounded"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-2 rounded-md text-white ${
                loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
              } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </span>
              ) : isEditing ? (
                "Update Privacy Policy"
              ) : (
                "Add Privacy Policy"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
