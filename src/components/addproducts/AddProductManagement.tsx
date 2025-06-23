import { useState, useRef, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";

const AddProductManagement = () => {
  const [product, setProduct] = useState({
    name: "",
    description: "",
    mainCategoryId: "",
    subCategoryId: "",
    vendorId: "",
    variants: [
      {
        sku: "",
        price: "",
        stock: "",
        attributes: [
          { name: "color", value: "" },
          { name: "size", value: "" },
        ],
      },
    ],
  });
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [mainCategories, setMainCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const fileInputRef = useRef(null);

  const token = Cookies.get("admin_token");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch main categories
        const mainCategoriesResponse = await axios.get(
          `${import.meta.env.VITE_BASE_UR}admin/get-all-main-categories`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setMainCategories(mainCategoriesResponse.data.categories || []);

        // Fetch sub categories
        const subCategoriesResponse = await axios.get(
          `${import.meta.env.VITE_BASE_UR}admin/get-all-sub-categories`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setSubCategories(subCategoriesResponse.data.subCategories || []);

        // Fetch vendors
        const vendorsResponse = await axios.get(
          `${import.meta.env.VITE_BASE_UR}admin/all-vendors`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setVendors(vendorsResponse.data.vendors || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleVariantChange = (variantIndex, e) => {
    const { name, value } = e.target;
    const updatedVariants = [...product.variants];
    updatedVariants[variantIndex][name] = value;
    setProduct((prev) => ({ ...prev, variants: updatedVariants }));
  };

  const handleAttributeChange = (variantIndex, attrIndex, e) => {
    const { name, value } = e.target;
    const updatedVariants = [...product.variants];
    updatedVariants[variantIndex].attributes[attrIndex][name] = value;
    setProduct((prev) => ({ ...prev, variants: updatedVariants }));
  };

  const addVariant = () => {
    setProduct((prev) => ({
      ...prev,
      variants: [
        ...prev.variants,
        {
          sku: "",
          price: "",
          stock: "",
          attributes: [
            { name: "color", value: "" },
            { name: "size", value: "" },
          ],
        },
      ],
    }));
  };

  const addAttribute = (variantIndex) => {
    const updatedVariants = [...product.variants];
    updatedVariants[variantIndex].attributes.push({ name: "", value: "" });
    setProduct((prev) => ({ ...prev, variants: updatedVariants }));
  };

  const removeVariant = (index) => {
    if (product.variants.length <= 1) return;
    const updatedVariants = product.variants.filter((_, i) => i !== index);
    setProduct((prev) => ({ ...prev, variants: updatedVariants }));
  };

  const removeAttribute = (variantIndex, attrIndex) => {
    const updatedVariants = [...product.variants];
    if (updatedVariants[variantIndex].attributes.length <= 1) return;
    updatedVariants[variantIndex].attributes = updatedVariants[
      variantIndex
    ].attributes.filter((_, i) => i !== attrIndex);
    setProduct((prev) => ({ ...prev, variants: updatedVariants }));
  };

  const handleImageChange = (e) => {
    setImages([...e.target.files]);
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccess(false);

    try {
      const formData = new FormData();
      formData.append("name", product.name);
      formData.append("description", product.description);
      formData.append("mainCategoryId", product.mainCategoryId);
      formData.append("subCategoryId", product.subCategoryId);
      formData.append("vendorId", product.vendorId);
      formData.append("variants", JSON.stringify(product.variants));

      images.forEach((image, index) => {
        formData.append(`images_${index}`, image);
      });

      const token = Cookies.get("admin_token");
      await axios.post(
        `${import.meta.env.VITE_BASE_UR}admin/add-product`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setSuccess(true);
      // Reset form
      setProduct({
        name: "",
        description: "",
        mainCategoryId: "",
        subCategoryId: "",
        vendorId: "",
        variants: [
          {
            sku: "",
            price: "",
            stock: "",
            attributes: [
              { name: "color", value: "" },
              { name: "size", value: "" },
            ],
          },
        ],
      });
      setImages([]);
    } catch (error) {
      console.error("Error adding product:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter subcategories based on selected main category
  const filteredSubCategories = product.mainCategoryId
    ? subCategories.filter(
        (subCat) => subCat.mainCategoryId === parseInt(product.mainCategoryId)
      )
    : [];

  if (loadingCategories) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          <div className="p-8 border-b border-gray-200">
            {success && (
              <div className="mb-6 p-4 bg-green-50 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-green-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">
                      Product added successfully!
                    </h3>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Product Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={product.name}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gold-500 focus:border-gold-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label
                    htmlFor="mainCategoryId"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Main Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="mainCategoryId"
                    name="mainCategoryId"
                    value={product.mainCategoryId}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gold-500 focus:border-gold-500 sm:text-sm"
                  >
                    <option value="">Select a category</option>
                    {mainCategories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="subCategoryId"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Sub Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="subCategoryId"
                    name="subCategoryId"
                    value={product.subCategoryId}
                    onChange={handleChange}
                    required
                    disabled={!product.mainCategoryId}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gold-500 focus:border-gold-500 sm:text-sm"
                  >
                    <option value="">Select a sub-category</option>
                    {filteredSubCategories.map((subCategory) => (
                      <option key={subCategory.id} value={subCategory.id}>
                        {subCategory.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="vendorId"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Vendor <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="vendorId"
                    name="vendorId"
                    value={product.vendorId}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gold-500 focus:border-gold-500 sm:text-sm"
                  >
                    <option value="">Select a vendor</option>
                    {vendors.map((vendor) => (
                      <option key={vendor.id} value={vendor.id}>
                        {vendor.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700"
                >
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  value={product.description}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gold-500 focus:border-gold-500 sm:text-sm"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Product Variants
                  </h3>
                  <button
                    type="button"
                    onClick={addVariant}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-blue-700 hover:bg-gold-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold-500"
                  >
                    Add Variant
                  </button>
                </div>

                <div className="space-y-4">
                  {product.variants.map((variant, variantIndex) => (
                    <div
                      key={variantIndex}
                      className="bg-gray-50 p-4 rounded-lg relative border border-gray-200"
                    >
                      {product.variants.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeVariant(variantIndex)}
                          className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                        >
                          <svg
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      )}
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div>
                          <label
                            htmlFor={`sku-${variantIndex}`}
                            className="block text-sm font-medium text-gray-700"
                          >
                            SKU <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            id={`sku-${variantIndex}`}
                            name="sku"
                            value={variant.sku}
                            onChange={(e) =>
                              handleVariantChange(variantIndex, e)
                            }
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gold-500 focus:border-gold-500 sm:text-sm"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor={`price-${variantIndex}`}
                            className="block text-sm font-medium text-gray-700"
                          >
                            Price <span className="text-red-500">*</span>
                          </label>
                          <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <span className="text-gray-500 sm:text-sm">
                                ₹
                              </span>
                            </div>
                            <input
                              type="number"
                              id={`price-${variantIndex}`}
                              name="price"
                              value={variant.price}
                              onChange={(e) =>
                                handleVariantChange(variantIndex, e)
                              }
                              required
                              className="border border-gray-300 block w-full pl-7 pr-5 sm:text-sm rounded-md py-2 px-3"
                              placeholder="0.00"
                              min="0"
                              step="0.01"
                            />
                          </div>
                        </div>
                        <div>
                          <label
                            htmlFor={`stock-${variantIndex}`}
                            className="block text-sm font-medium text-gray-700"
                          >
                            Stock <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            id={`stock-${variantIndex}`}
                            name="stock"
                            value={variant.stock}
                            onChange={(e) =>
                              handleVariantChange(variantIndex, e)
                            }
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gold-500 focus:border-gold-500 sm:text-sm"
                            min="0"
                          />
                        </div>
                      </div>
                      <div>
                        <label
                          htmlFor={`sellingprice-${variantIndex}`}
                          className="block text-sm font-medium text-gray-700 mt-2"
                        >
                          Selling Price <span className="text-red-500">*</span>
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 sm:text-sm">₹</span>
                          </div>
                          <input
                            type="number"
                            id={`sellingprice-${variantIndex}`}
                            name="sellingprice"
                            value={variant.sellingprice}
                            onChange={(e) =>
                              handleVariantChange(variantIndex, e)
                            }
                            required
                            className="border border-gray-300 block w-[300px] pl-7 pr-4 sm:text-sm rounded-md py-2 px-3"
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                          />
                        </div>
                      </div>

                      <div className="mt-6">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-medium text-gray-900">
                            Attributes
                          </h3>
                          <button
                            type="button"
                            onClick={() => addAttribute(variantIndex)}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-blue-700 hover:bg-gold-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold-500"
                          >
                            Add Attribute
                          </button>
                        </div>
                        <div className="space-y-4">
                          {variant.attributes.map((attribute, attrIndex) => (
                            <div
                              key={attrIndex}
                              className="grid grid-cols-1 gap-4 sm:grid-cols-2 relative"
                            >
                              {variant.attributes.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    removeAttribute(variantIndex, attrIndex)
                                  }
                                  className="absolute top-0 right-0 text-gray-400 hover:text-red-500"
                                >
                                  <svg
                                    className="h-5 w-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M6 18L18 6M6 6l12 12"
                                    />
                                  </svg>
                                </button>
                              )}
                              <div>
                                <label
                                  htmlFor={`attr-name-${variantIndex}-${attrIndex}`}
                                  className="block text-sm font-medium text-gray-700"
                                >
                                  Attribute Name
                                </label>
                                <input
                                  type="text"
                                  id={`attr-name-${variantIndex}-${attrIndex}`}
                                  name="name"
                                  value={attribute.name}
                                  onChange={(e) =>
                                    handleAttributeChange(
                                      variantIndex,
                                      attrIndex,
                                      e
                                    )
                                  }
                                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gold-500 focus:border-gold-500 sm:text-sm"
                                  placeholder="e.g. color, size"
                                />
                              </div>
                              <div>
                                <label
                                  htmlFor={`attr-value-${variantIndex}-${attrIndex}`}
                                  className="block text-sm font-medium text-gray-700"
                                >
                                  Attribute Value
                                </label>
                                <input
                                  type="text"
                                  id={`attr-value-${variantIndex}-${attrIndex}`}
                                  name="value"
                                  value={attribute.value}
                                  onChange={(e) =>
                                    handleAttributeChange(
                                      variantIndex,
                                      attrIndex,
                                      e
                                    )
                                  }
                                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gold-500 focus:border-gold-500 sm:text-sm"
                                  placeholder="e.g. red, large"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Product Images
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  multiple
                  className="hidden"
                  accept="image/*"
                />
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-gold-600 hover:text-gold-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-gold-500"
                      >
                        <span onClick={triggerFileInput}>Upload files</span>
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF up to 10MB
                    </p>
                  </div>
                </div>
                {images.length > 0 && (
                  <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                    {Array.from(images).map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Preview ${index}`}
                          className="h-24 w-full object-cover rounded"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-5">
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-black hover:bg-gold-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white bg-black"
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
                      </>
                    ) : (
                      "Add Product"
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProductManagement;
