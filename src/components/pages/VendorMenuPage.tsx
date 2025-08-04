import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';

interface MealImage {
  id: number;
  mealId: number;
  url: string;
}

interface MealOption {
  id: number;
  mealOptionGroupId: number;
  name: string;
  price: number;
  image: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

interface MealOptionGroup {
  id: number;
  mealId: number;
  title: string;
  isRequired: boolean;
  minSelect: number;
  maxSelect: number;
  createdAt: string;
  updatedAt: string;
  options: MealOption[];
}

interface DietaryTag {
  id: number;
  mealId: number;
  tag: string;
}

interface Ingredient {
  id: number;
  mealId: number;
  name: string;
}

interface AvailableDay {
  id: number;
  mealId: number;
  day: string;
}

interface Meal {
  id: number;
  vendorId: number;
  title: string;
  description: string;
  image: string;
  type: string;
  configType: string;
  cuisine: string;
  isVeg: boolean;
  energyKcal: number;
  proteinGram: number;
  fatGram: number;
  fiberGram: number;
  carbsGram: number;
  basePrice: number;
  isAvailable: boolean;
  isWeekly: boolean;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  isVerified: boolean;
  deletedAt: null | string;
  mealImages: MealImage[];
  mealOptionGroups: MealOptionGroup[];
  dietaryTags: DietaryTag[];
  ingredients: Ingredient[];
  availableDays: AvailableDay[];
}

interface ApiResponse {
  message: string;
  verified: Meal[];
  unverified: Meal[];
}

const VendorMenuPage = () => {
  const { vendorId } = useParams<{ vendorId: string }>();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [verifyingId, setVerifyingId] = useState<number | null>(null);
  const token = Cookies.get('admin_token');

  useEffect(() => {
    fetchMeals();
  }, [vendorId]);

  const fetchMeals = async () => {
    try {
      setLoading(true);
      const response = await axios.get<ApiResponse>(
        `${import.meta.env.VITE_BASE_UR}/admin/get-vendor-meals/${vendorId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Combine verified and unverified meals
      setMeals([...response.data.verified, ...response.data.unverified]);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch meals');
      setLoading(false);
      console.error('Error fetching meals:', err);
    }
  };

  const verifyMeal = async (mealId: number) => {
    try {
      setVerifyingId(mealId);
      await axios.patch(
        `${import.meta.env.VITE_BASE_UR}admin/verify-vendor-meal/${mealId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Update the meal's verification status in the state
      setMeals(meals.map(meal => 
        meal.id === mealId ? { ...meal, isVerified: true } : meal
      ));
      
      toast.success('Meal verified successfully!');
    } catch (error) {
      console.error('Error verifying meal:', error);
      toast.error('Failed to verify meal');
    } finally {
      setVerifyingId(null);
    }
  };

  const getDayColor = (day: string) => {
    const colors: Record<string, string> = {
      MON: 'bg-blue-100 text-blue-800',
      TUE: 'bg-purple-100 text-purple-800',
      WED: 'bg-green-100 text-green-800',
      THU: 'bg-yellow-100 text-yellow-800',
      FRI: 'bg-red-100 text-red-800',
      SAT: 'bg-indigo-100 text-indigo-800',
      SUN: 'bg-pink-100 text-pink-800',
    };
    return colors[day] || 'bg-gray-100 text-gray-800';
  };

  const groupMealsByVerificationStatus = () => {
    const verified = meals.filter(meal => meal.isVerified);
    const unverified = meals.filter(meal => !meal.isVerified);
    return { verified, unverified };
  };

  const { verified, unverified } = groupMealsByVerificationStatus();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Vendor Menu</h1>
        <div className="flex space-x-2">
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
            Verified: {verified.length}
          </span>
          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
            Pending: {unverified.length}
          </span>
        </div>
      </div>
      
      {meals.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No meals available for this vendor.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Unverified Meals Section */}
          {unverified.length > 0 && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-700">Pending Verification</h2>
                <span className="text-sm text-gray-500">{unverified.length} meals awaiting approval</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {unverified.map((meal) => (
                  <MealCard 
                    key={meal.id} 
                    meal={meal} 
                    getDayColor={getDayColor} 
                    onVerify={verifyMeal}
                    isVerifying={verifyingId === meal.id}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Verified Meals Section */}
          {verified.length > 0 && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-700">Verified Meals</h2>
                <span className="text-sm text-gray-500">{verified.length} approved meals</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {verified.map((meal) => (
                  <MealCard 
                    key={meal.id} 
                    meal={meal} 
                    getDayColor={getDayColor} 
                    isVerified={true}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface MealCardProps {
  meal: Meal;
  getDayColor: (day: string) => string;
  onVerify?: (mealId: number) => void;
  isVerifying?: boolean;
  isVerified?: boolean;
}

const MealCard = ({ meal, getDayColor, onVerify, isVerifying, isVerified = false }: MealCardProps) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-gray-100">
      {/* Meal Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={`${import.meta.env.VITE_BASE_URL_IMG}${meal.image}`}
          alt={meal.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x200?text=Meal+Image';
          }}
        />
        <div className="absolute top-2 right-2 flex space-x-2">
          {!isVerified && (
            <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded">
              Unverified
            </span>
          )}
          {meal.isWeekly && (
            <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded">
              Weekly Special
            </span>
          )}
        </div>
      </div>

      {/* Meal Details */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h2 className="text-xl font-semibold text-gray-800">{meal.title}</h2>
          <span className="text-lg font-bold text-blue-600">₹{meal.basePrice}</span>
        </div>

        <p className="text-gray-600 mb-3 line-clamp-2">{meal.description}</p>

        {/* Quick Info */}
        <div className="flex flex-wrap gap-2 mb-3">
          <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded">
            {meal.type}
          </span>
          <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded">
            {meal.cuisine}
          </span>
          <span className={`px-2 py-1 text-xs rounded ${meal.isVeg ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
            {meal.isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
          </span>
        </div>

        {/* Expand/Collapse Button */}
        <button 
          onClick={() => setExpanded(!expanded)}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium mb-3 flex items-center"
        >
          {expanded ? 'Show less' : 'Show more details'}
          <svg 
            className={`ml-1 w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Expanded Details */}
        {expanded && (
          <div className="space-y-3">
            {/* Nutrition Information */}
            <div className="bg-gray-50 p-3 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Nutrition Information</h3>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="bg-blue-50 p-2 rounded">
                  <div className="text-sm font-medium text-blue-800">{meal.energyKcal}</div>
                  <div className="text-xs text-blue-600">Calories</div>
                </div>
                <div className="bg-green-50 p-2 rounded">
                  <div className="text-sm font-medium text-green-800">{meal.proteinGram}g</div>
                  <div className="text-xs text-green-600">Protein</div>
                </div>
                <div className="bg-yellow-50 p-2 rounded">
                  <div className="text-sm font-medium text-yellow-800">{meal.carbsGram}g</div>
                  <div className="text-xs text-yellow-600">Carbs</div>
                </div>
                <div className="bg-red-50 p-2 rounded">
                  <div className="text-sm font-medium text-red-800">{meal.fatGram}g</div>
                  <div className="text-xs text-red-600">Fat</div>
                </div>
              </div>
            </div>

            {/* Dietary Tags */}
            {meal.dietaryTags.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-1">Dietary Tags</h3>
                <div className="flex flex-wrap gap-1">
                  {meal.dietaryTags.map((tag) => (
                    <span key={tag.id} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                      {tag.tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Available Days */}
            {meal.availableDays.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-1">Available Days</h3>
                <div className="flex flex-wrap gap-1">
                  {meal.availableDays.map((day) => (
                    <span key={day.id} className={`px-2 py-1 text-xs rounded ${getDayColor(day.day)}`}>
                      {day.day}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Ingredients */}
            {meal.ingredients.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-1">Ingredients</h3>
                <div className="flex flex-wrap gap-1">
                  {meal.ingredients.map((ingredient) => (
                    <span key={ingredient.id} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                      {ingredient.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Customization Options */}
            {meal.mealOptionGroups.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-1">Customization Options</h3>
                {meal.mealOptionGroups.map((group) => (
                  <div key={group.id} className="mb-2">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-medium text-gray-600">
                        {group.title} {group.isRequired && '*'}
                      </h4>
                      <span className="text-xs text-gray-500">
                        Select {group.minSelect}-{group.maxSelect}
                      </span>
                    </div>
                    <div className="mt-1 space-y-1">
                      {group.options.map((option) => (
                        <div key={option.id} className="flex justify-between items-center text-xs">
                          <span>{option.name}</span>
                          {option.price > 0 && (
                            <span className="text-blue-600">+₹{option.price}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Additional Images */}
            {meal.mealImages.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-1">More Images</h3>
                <div className="flex space-x-2 overflow-x-auto pb-2">
                  {meal.mealImages.map((image) => (
                    <img
                      key={image.id}
                      src={`${import.meta.env.VITE_BASE_URL_IMG}${image.url}`}
                      alt="Meal"
                      className="h-16 w-16 object-cover rounded"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '';
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Verify Button for Unverified Meals */}
        {!isVerified && onVerify && (
          <div className="mt-4">
            <button
              onClick={() => onVerify(meal.id)}
              disabled={isVerifying}
              className={`w-full py-2 px-4 rounded-md text-white font-medium ${isVerifying ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {isVerifying ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying...
                </span>
              ) : 'Verify Meal'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorMenuPage;