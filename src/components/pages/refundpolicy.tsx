import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Cookies from "js-cookie";
import Modal from "react-modal";

// Make sure to bind modal to your appElement (http://reactcommunity.org/react-modal/accessibility/)
Modal.setAppElement("#root");

const RefundPolicy = () => {
  const [aboutData, setAboutData] = useState({
    title: "",
    description: "",
    image: null,
    previewImage: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [existingData, setExistingData] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const token = Cookies.get("admin_token");

  // Fetch existing about us data
  useEffect(() => {
    const fetchAboutUs = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_UR}admin/get-return-policy`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data && response.data.data) {
          setExistingData(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching Refund policy data:", error);
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

  const openEditModal = () => {
    if (existingData) {
      setAboutData({
        title: existingData.title || "",
        description: existingData.description || "",
        image: null,
        previewImage: existingData.image || "",
      });
    }
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
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
        `${import.meta.env.VITE_BASE_UR}admin/add-return-policy`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data && response.data.data) {
        setExistingData(response.data.data);
        toast.success(
          existingData
            ? "Refund policy updated successfully!"
            : "Refund policy created successfully!"
        );
      }
      closeModal();
    } catch (error) {
      console.error("Error submitting refund policy data:", error);
      toast.error(
        error.response?.data?.message ||
          "An error occurred while saving Refund Policy data"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container px-4 py-8 mx-auto  sm:px-6 lg:px-8">
      <ToastContainer position="top-right" autoClose={5000} />
      <h1 className="text-2xl font-bold mb-6">Refund Policy Management</h1>

      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6">
        {isLoading && !existingData ? (
          <p>Loading...</p>
        ) : existingData ? (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">
                {existingData.title}
              </h2>
              <p className="text-gray-700 whitespace-pre-line">
                {existingData.description}
              </p>
            </div>
            {existingData.image && (
              <div className="mb-4">
                <img
                  src={`${import.meta.env.VITE_BASE_URL_IMG}${
                    existingData.image
                  }`}
                  alt="Refund Policy"
                  className="max-w-full h-auto max-h-60 rounded-md"
                />
              </div>
            )}
            <button
              onClick={openEditModal}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
            >
              {existingData ? "Edit Refund Policy" : "Add Refund Policy"}
            </button>
          </div>
        ) : (
          <div>
            <p className="mb-4">No Refund Policy content found.</p>
            <button
              onClick={openEditModal}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
            >
              Create Refund Policy
            </button>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Add Refund Policy"
        className="modal-content bg-white rounded-lg shadow-xl p-4 sm:p-6 w-full sm:w-11/12 md:w-4/5 lg:w-3/4 xl:w-2/3 mx-auto my-12 max-h-[90vh] overflow-y-auto"
        overlayClassName="modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
      >
        <h2 className="text-xl sm:text-2xl font-bold mb-6">
          {existingData ? "Edit Refund Policy" : "Create Refund Policy"}
        </h2>
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

          {aboutData.previewImage && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-1">
                Image Preview:
              </p>
              <img
                src={
                  aboutData.previewImage.startsWith("blob:")
                    ? aboutData.previewImage
                    : `${import.meta.env.VITE_BASE_URL_IMG}${
                        aboutData.previewImage
                      }`
                }
                alt="Preview"
                className="max-w-full h-auto max-h-40 rounded-md"
              />
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-end gap-3 sm:space-x-3">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-colors duration-200"
            >
              {isLoading
                ? "Saving..."
                : existingData
                ? "Update Refund Policy"
                : "Save Refund Policy"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default RefundPolicy;