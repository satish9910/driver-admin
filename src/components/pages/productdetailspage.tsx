import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Cookies from "js-cookie";
import { Header } from "../layout/Header";
import { Sidebar } from "../layout/Sidebar";

const ProductdetailsPage = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const role = Cookies.get("user_role");
  const isAdmin = role === "admin";
  const isVendor = role === "vendor";
  const token = Cookies.get(isAdmin ? "admin_token" : "vendor_token");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        let url = "";
        let options: RequestInit = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        if (isAdmin) {
          url = `${import.meta.env.VITE_BASE_UR}admin/get-meal-by-id/${productId}`;
        } else if (isVendor) {
          url = `${import.meta.env.VITE_BASE_UR}vendor/get-product/${productId}`;
        }

        const response = await fetch(url, options);

        if (!response.ok) {
          throw new Error("Failed to fetch product");
        }

        const data = await response.json();
        setProduct(data.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId, token, isAdmin, isVendor]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        Loading...
      </div>
    );
  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        Error: {error}
      </div>
    );
  if (!product)
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        Product not found
      </div>
    );

  const increaseQuantity = () => setQuantity((prev) => prev + 1);
  const decreaseQuantity = () =>
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  // Get all images including the main image
  const allImages = [
    product.image,
    ...product.mealImages.map((img: any) => img.url)
  ];

  // Format day names
  const formatDay = (dayCode: string) => {
    const days: Record<string, string> = {
      MON: "Monday",
      TUE: "Tuesday",
      WED: "Wednesday",
      THU: "Thursday",
      FRI: "Friday",
      SAT: "Saturday",
      SUN: "Sunday"
    };
    return days[dayCode] || dayCode;
  };

  return (
    <div className="min-h-screen max-w-6xl bg-white text-gray-900 mx-auto">
      <div className="flex">
        <main className="flex-1 container mx-auto px-6 py-12">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Meal Details</h1>
          </div>

          <div className="flex flex-col lg:flex-row">
            {/* Meal Images */}
            <div className="lg:w-1/2 mb-10 lg:mb-0">
              <div className="bg-gray-50 p-8 flex items-center justify-center h-96 mb-4">
                <img
                  src={`${import.meta.env.VITE_BASE_URL_IMG}${allImages[selectedImage]}`}
                  alt={product.title}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              <div className="grid grid-cols-4 gap-2">
                {allImages.map((image: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`h-24 bg-gray-50 flex items-center justify-center p-2 ${
                      selectedImage === index ? "ring-2 ring-black" : ""
                    }`}
                  >
                    <img
                      src={`${import.meta.env.VITE_BASE_URL_IMG}${image}`}
                      alt={`${product.title} thumbnail ${index}`}
                      className="max-h-full max-w-full object-contain"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Meal Info */}
            <div className="lg:w-1/2 lg:pl-16">
              <div className="mb-6">
                <span className="text-sm text-gray-500 uppercase tracking-wider">
                  {product.type} • {product.cuisine}
                </span>
                <h1 className="text-3xl font-serif font-light mt-2 mb-4">
                  {product.title}
                </h1>
                <div className="flex items-center mb-6">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-yellow-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-gray-500 text-sm ml-2">
                    (24 reviews)
                  </span>
                </div>
              </div>

              <div className="mb-8">
                <span className="text-2xl font-serif">₹{product.basePrice.toFixed(2)}</span>
                <div className="mt-2 text-sm text-gray-500">
                  {product.isVeg ? "Vegetarian" : "Non-Vegetarian"} • {product.energyKcal} kcal
                </div>
              </div>

              <div className="mb-8">
                <h2 className="text-lg font-medium mb-4">Description</h2>
                <p className="text-gray-700 leading-relaxed">
                  {product.description}
                </p>
              </div>

              <div className="mb-8">
                <h2 className="text-lg font-medium mb-4">Nutritional Information</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded">
                    <div className="text-gray-500 text-sm">Protein</div>
                    <div className="font-medium">{product.proteinGram}g</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded">
                    <div className="text-gray-500 text-sm">Carbs</div>
                    <div className="font-medium">{product.carbsGram}g</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded">
                    <div className="text-gray-500 text-sm">Fat</div>
                    <div className="font-medium">{product.fatGram}g</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded">
                    <div className="text-gray-500 text-sm">Fiber</div>
                    <div className="font-medium">{product.fiberGram}g</div>
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <h2 className="text-lg font-medium mb-4">Ingredients</h2>
                <ul className="list-disc pl-5 text-gray-700 space-y-1">
                  {product.ingredients.map((ingredient: any) => (
                    <li key={ingredient.id}>{ingredient.name}</li>
                  ))}
                </ul>
              </div>

              <div className="mb-8">
                <h2 className="text-lg font-medium mb-4">Dietary Tags</h2>
                <div className="flex flex-wrap gap-2">
                  {product.dietaryTags.map((tag: any) => (
                    <span key={tag.id} className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                      {tag.tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mb-8">
                <h2 className="text-lg font-medium mb-4">Available Days</h2>
                <div className="flex flex-wrap gap-2">
                  {product.availableDays.map((day: any) => (
                    <span key={day.id} className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                      {formatDay(day.day)}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mb-8">
                <h2 className="text-lg font-medium mb-4">Vendor Information</h2>
                <div className="bg-gray-50 p-4 rounded">
                  <div className="font-medium">{product.vendor.businessName}</div>
                  <div className="text-gray-600">By {product.vendor.name}</div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProductdetailsPage;