import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Cookies from "js-cookie";

const TermsOfServicePage = () => {
  const [formData, setFormData] = useState({
    title: "Terms and Conditions",
    description: "",
    image: null,
    previewImage: null,
  });
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [existingData, setExistingData] = useState(null);

  const token = Cookies.get("admin_token");

  // Fetch existing terms data
  useEffect(() => {
    const fetchTerms = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_UR}admin/get-terms-and-conditions`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.data) {
          setExistingData(response.data);
          setFormData({
            title: response.data.title || "Terms and Conditions",
            description: response.data.description || "",
            previewImage: response.data.imageUrl || null,
          });
          setIsEditing(true);
        }
      } catch (error) {
        console.error("Error fetching terms and conditions:", error);
      }
    };

    fetchTerms();
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
        ? `${import.meta.env.VITE_BASE_UR}admin/add-terms-and-conditions`
        : `${import.meta.env.VITE_BASE_UR}admin/add-terms-and-conditions`;

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
        `Terms and Conditions ${isEditing ? "updated" : "added"} successfully!`
      );
      setExistingData(response.data);
      setIsEditing(true);
    } catch (error) {
      console.error("Error:", error);
      toast.error(
        `Failed to ${isEditing ? "update" : "add"} Terms and Conditions`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-6xl px-4 py-8 ml-56 mt-14">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Terms of Service Management
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
              Terms Content
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={15}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              placeholder="Enter the terms and conditions content here..."
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="image"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Featured Image
            </label>
            <div className="flex items-center gap-4">
              <input
                type="file"
                id="image"
                name="image"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {formData.previewImage && (
                <div className="shrink-0">
                  <img
                    src={formData.previewImage}
                    alt="Preview"
                    className="w-24 h-24 object-cover border border-gray-200 rounded"
                  />
                </div>
              )}
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Upload an image that represents your terms (optional)
            </p>
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => {
                setFormData({
                  title: "Terms and Conditions",
                  description: "",
                  image: null,
                  previewImage: null,
                });
                setIsEditing(false);
              }}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Reset Form
            </button>
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
                "Update Terms"
              ) : (
                "Save Terms"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TermsOfServicePage;
