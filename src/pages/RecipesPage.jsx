"use client";

import { useState, useEffect } from "react";
import { Heart, Share2, Clock, AlertCircle, X } from "lucide-react";
import Sidebar from "../components/layout/Sidebar";
import "./recipes.css";

// TheMealDB API base URL
const API_BASE_URL = "https://www.themealdb.com/api/json/v1/1/";

// Sample recipe data
const sampleRecipes = [
  {
    id: 1,
    title: "Spaghetti Carbonara",
    image: "https://placehold.co/400x300/green/white?text=Spaghetti+Carbonara",
    realImage: null,
    readyInMinutes: 25,
    servings: 4,
    source: "FoodNetwork",
    diets: ["Vegetarian"],
    cuisines: ["Italian"],
    nutrition: {
      nutrients: [{ name: "Calories", amount: 650 }],
    },
    ingredients: [
      "400g spaghetti",
      "200g pancetta or guanciale",
      "4 large eggs",
      "50g pecorino cheese",
      "50g parmesan",
      "Freshly ground black pepper",
    ],
    instructions:
      "Bring a large pot of salted water to boil... Cook pasta until al dente... In a bowl, whisk eggs, cheese and pepper... Cook pancetta until crispy... Combine pasta with egg mixture while hot... Serve immediately with extra cheese.",
    sourceUrl: "#",
  },
  {
    id: 2,
    title: "Avocado Toast with Poached Eggs",
    image: "https://placehold.co/400x300/green/white?text=Avocado+Toast",
    realImage: null,
    readyInMinutes: 15,
    servings: 2,
    source: "AllRecipes",
    diets: ["Vegetarian", "High-Protein"],
    cuisines: ["American", "Breakfast"],
    nutrition: {
      nutrients: [{ name: "Calories", amount: 420 }],
    },
    ingredients: [
      "2 slices whole grain bread",
      "1 ripe avocado",
      "2 eggs",
      "Salt and pepper to taste",
      "Red pepper flakes (optional)",
      "Lemon juice",
    ],
    instructions:
      "Toast bread until golden and firm... Mash avocado in a bowl with salt, pepper and lemon juice... Poach eggs in simmering water for 3-4 minutes... Spread avocado on toast... Top with poached eggs... Season with salt, pepper and optional red pepper flakes.",
    sourceUrl: "#",
  },
  {
    id: 3,
    title: "Chicken Tikka Masala",
    image: "https://placehold.co/400x300/green/white?text=Chicken+Tikka+Masala",
    realImage: null,
    readyInMinutes: 45,
    servings: 4,
    source: "TastyRecipes",
    diets: ["High-Protein", "Gluten-Free"],
    cuisines: ["Indian"],
    nutrition: {
      nutrients: [{ name: "Calories", amount: 520 }],
    },
    ingredients: [
      "600g chicken breast",
      "200ml yogurt",
      "2 tbsp garam masala",
      "1 can tomato sauce",
      "1 onion",
      "3 garlic cloves",
      "1 tbsp ginger",
      "200ml heavy cream",
    ],
    instructions:
      "Mix yogurt with spices... Marinate chicken for at least 1 hour... Sauté onions, garlic and ginger... Add tomato sauce and bring to simmer... Cook chicken and add to sauce... Stir in cream and simmer for 10 minutes... Serve with rice or naan bread.",
    sourceUrl: "#",
  },
  {
    id: 4,
    title: "Greek Salad",
    image: "https://placehold.co/400x300/green/white?text=Greek+Salad",
    realImage: null,
    readyInMinutes: 15,
    servings: 4,
    source: "MediterraneanCooking",
    diets: ["Vegetarian", "Low-Carb", "Keto-Friendly"],
    cuisines: ["Greek", "Mediterranean"],
    nutrition: {
      nutrients: [{ name: "Calories", amount: 320 }],
    },
    ingredients: [
      "4 large tomatoes, chunked",
      "1 cucumber, sliced",
      "1 red onion, thinly sliced",
      "200g feta cheese, cubed",
      "100g kalamata olives",
      "2 tbsp extra virgin olive oil",
      "1 tbsp red wine vinegar",
      "1 tsp dried oregano",
      "Salt and pepper to taste",
    ],
    instructions:
      "Combine tomatoes, cucumber, and red onion in a large bowl... Add olives and feta cheese... In a small bowl, mix olive oil, vinegar, oregano, salt and pepper... Pour dressing over salad and toss gently... Serve immediately or chill for 30 minutes to enhance flavors.",
    sourceUrl: "#",
  },
];

const RecipesPage = () => {
  const [sortBy, setSortBy] = useState("time");
  const [view, setView] = useState("grid");
  const [filteredAndSortedRecipes, setFilteredAndSortedRecipes] = useState([]);
  const [favoriteRecipes, setFavoriteRecipes] = useState([]);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [currentIngredient, setCurrentIngredient] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Fetch categories from TheMealDB API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}categories.php`);
        const data = await response.json();
        if (data.categories) {
          setCategories(data.categories.slice(0, 8)); // Limit to 8 categories
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };

    fetchCategories();
  }, []);

  // Load sample data when component mounts
  useEffect(() => {
    // Sort recipes by time initially
    const loadInitialRecipes = async () => {
      setLoading(true);
      try {
        // Combine sample recipes with API recipes
        const apiRecipes = await fetchRandomMeals();
        const combinedRecipes = [...sampleRecipes, ...apiRecipes];

        // Sort by cooking time
        const sortedRecipes = combinedRecipes.sort(
          (a, b) => a.readyInMinutes - b.readyInMinutes
        );
        setFilteredAndSortedRecipes(sortedRecipes);
        setSearchPerformed(true);
      } catch (err) {
        setError("Failed to load recipes");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadInitialRecipes();
  }, []);

  // Fetch recipes by category
  const fetchRecipesByCategory = async (categoryName) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}filter.php?c=${categoryName}`
      );
      const data = await response.json();

      if (!data.meals) {
        setFilteredAndSortedRecipes([]);
        setLoading(false);
        return;
      }

      // Process up to 6 meals from the category
      const mealsToProcess = data.meals.slice(0, 6);
      const processedMeals = await Promise.all(
        mealsToProcess.map(async (meal) => {
          // Get full meal details
          try {
            const detailResponse = await fetch(
              `${API_BASE_URL}lookup.php?i=${meal.idMeal}`
            );
            const detailData = await detailResponse.json();
            const detailedMeal = detailData.meals[0];

            // Extract ingredients
            const ingredients = [];
            for (let i = 1; i <= 20; i++) {
              const ingredient = detailedMeal[`strIngredient${i}`];
              const measure = detailedMeal[`strMeasure${i}`];

              if (ingredient && ingredient.trim()) {
                ingredients.push(`${measure} ${ingredient}`.trim());
              }
            }

            return {
              id: Number.parseInt(detailedMeal.idMeal),
              title: detailedMeal.strMeal,
              image: detailedMeal.strMealThumb,
              realImage: detailedMeal.strMealThumb,
              readyInMinutes: Math.floor(Math.random() * 45) + 15, // Random time between 15-60 mins
              servings: Math.floor(Math.random() * 4) + 2, // Random servings between 2-6
              source: "TheMealDB",
              diets: detailedMeal.strTags
                ? detailedMeal.strTags.split(",").map((tag) => tag.trim())
                : [],
              cuisines: [detailedMeal.strArea || "International"],
              nutrition: {
                nutrients: [
                  {
                    name: "Calories",
                    amount: Math.floor(Math.random() * 500) + 200,
                  },
                ], // Random calories
              },
              ingredients: ingredients,
              instructions: detailedMeal.strInstructions,
              sourceUrl: detailedMeal.strSource || "#",
            };
          } catch (err) {
            console.error("Error fetching meal details:", err);
            return null;
          }
        })
      );

      // Filter out any null results
      const validMeals = processedMeals.filter((meal) => meal !== null);

      // Sort the meals based on current sort criteria
      const sortedMeals = [...validMeals];
      if (sortBy === "time") {
        sortedMeals.sort((a, b) => a.readyInMinutes - b.readyInMinutes);
      } else if (sortBy === "calories") {
        sortedMeals.sort((a, b) => {
          const aCalories =
            a.nutrition?.nutrients?.find((n) => n.name === "Calories")
              ?.amount || 0;
          const bCalories =
            b.nutrition?.nutrients?.find((n) => n.name === "Calories")
              ?.amount || 0;
          return aCalories - bCalories;
        });
      }

      setFilteredAndSortedRecipes(sortedMeals);
      setSearchPerformed(true);
    } catch (err) {
      setError("Failed to fetch recipes. Please try again.");
      console.error("Error fetching category recipes:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch random meals from API
  const fetchRandomMeals = async () => {
    const meals = [];

    try {
      // Fetch 5 random meals
      for (let i = 0; i < 5; i++) {
        const response = await fetch(`${API_BASE_URL}random.php`);
        const data = await response.json();

        if (data.meals && data.meals.length > 0) {
          const meal = data.meals[0];

          // Extract ingredients
          const ingredients = [];
          for (let j = 1; j <= 20; j++) {
            const ingredient = meal[`strIngredient${j}`];
            const measure = meal[`strMeasure${j}`];

            if (ingredient && ingredient.trim()) {
              ingredients.push(`${measure} ${ingredient}`.trim());
            }
          }

          meals.push({
            id: Number.parseInt(meal.idMeal),
            title: meal.strMeal,
            image: meal.strMealThumb,
            realImage: meal.strMealThumb,
            readyInMinutes: Math.floor(Math.random() * 45) + 15, // Random time between 15-60 mins
            servings: Math.floor(Math.random() * 4) + 2, // Random servings between 2-6
            source: "TheMealDB",
            diets: meal.strTags
              ? meal.strTags.split(",").map((tag) => tag.trim())
              : [],
            cuisines: [meal.strArea || "International"],
            nutrition: {
              nutrients: [
                {
                  name: "Calories",
                  amount: Math.floor(Math.random() * 500) + 200,
                },
              ], // Random calories
            },
            ingredients: ingredients,
            instructions: meal.strInstructions,
            sourceUrl: meal.strSource || "#",
          });
        }
      }

      return meals;
    } catch (err) {
      console.error("Error fetching random meals:", err);
      return [];
    }
  };

  // Sort recipes when sortBy changes
  useEffect(() => {
    if (filteredAndSortedRecipes.length > 0) {
      const sorted = [...filteredAndSortedRecipes];
      if (sortBy === "time") {
        sorted.sort((a, b) => a.readyInMinutes - b.readyInMinutes);
      } else if (sortBy === "calories") {
        sorted.sort((a, b) => {
          const aCalories =
            a.nutrition?.nutrients?.find((n) => n.name === "Calories")
              ?.amount || 0;
          const bCalories =
            b.nutrition?.nutrients?.find((n) => n.name === "Calories")
              ?.amount || 0;
          return aCalories - bCalories;
        });
      }
      setFilteredAndSortedRecipes(sorted);
    }
  }, [sortBy]);

  const toggleFavorite = (id) => {
    setFavoriteRecipes((prev) =>
      prev.includes(id)
        ? prev.filter((recipeId) => recipeId !== id)
        : [...prev, id]
    );
  };

  const viewRecipeDetails = (recipe) => {
    setSelectedRecipe(recipe);
    setShowRecipeModal(true);
  };

  const closeRecipeModal = () => {
    setShowRecipeModal(false);
    setSelectedRecipe(null);
  };

  const clearSearch = () => {
    // Logic to clear search
    setSearchPerformed(false);
    setFilteredAndSortedRecipes([]);
    setSelectedCategory(null);
  };

  const toggleView = () => {
    setView(view === "grid" ? "pinterest" : "grid");
  };

  const getApiSourceLabel = (source) => {
    // Logic to get source label
    return source || "Unknown Source";
  };

  // Handle category selection
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    fetchRecipesByCategory(category.strCategory);
  };

  // Handle ingredient selection
  const handleIngredientSelect = (ingredient) => {
    setCurrentIngredient(ingredient);
    // Simulate searching by ingredient
    setLoading(true);

    // Just use a timeout to simulate API call
    setTimeout(() => {
      fetchRandomMeals().then((meals) => {
        const filteredMeals = meals.slice(0, 3); // Just take first 3 recipes as a simulation
        setFilteredAndSortedRecipes([
          ...filteredMeals,
          ...sampleRecipes.slice(0, 2),
        ]);
        setSearchPerformed(true);
        setLoading(false);
      });
    }, 1000);
  };

  return (
    <div className="d-flex page-container">
      <Sidebar />
      <div className="content-area">
        <div className="bg-gray-100 min-h-screen p-4">
          <header className="mb-6">
            <h1 className="text-3xl font-bold text-green-700 mb-2">
              Recipe Finder
            </h1>
            <p className="text-gray-600">
              Find delicious recipes based on ingredients you have
            </p>
          </header>

          <main>
            {/* Categories */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-3">Popular Categories</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
                {categories.map((category) => (
                  <div
                    key={category.idCategory}
                    className={`cursor-pointer bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow ${
                      selectedCategory?.idCategory === category.idCategory
                        ? "ring-2 ring-green-500"
                        : ""
                    }`}
                    onClick={() => handleCategorySelect(category)}
                  >
                    <img
                      src={category.strCategoryThumb || "/placeholder.svg"}
                      alt={category.strCategory}
                      className="w-full h-24 object-cover"
                    />
                    <div className="p-2 text-center">
                      <h3 className="font-medium text-sm">
                        {category.strCategory}
                      </h3>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* View Toggle and Sorting Buttons */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex gap-2">
                <button
                  className={`px-3 py-1 rounded-full text-sm ${
                    sortBy === "time"
                      ? "bg-green-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  onClick={() => setSortBy("time")}
                >
                  Cooking Time
                </button>
                <button
                  className={`px-3 py-1 rounded-full text-sm ${
                    sortBy === "calories"
                      ? "bg-green-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  onClick={() => setSortBy("calories")}
                >
                  Calories
                </button>
              </div>

              <button
                className="px-3 py-1 bg-blue-500 text-white rounded-full text-sm"
                onClick={toggleView}
              >
                {view === "grid" ? "Pinterest View" : "Grid View"}
              </button>
            </div>

            {/* Loading Indicator */}
            {loading && (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg mb-6">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  <span>{error}</span>
                </div>
              </div>
            )}

            {/* Recipe Views */}
            {!loading && view === "pinterest" && (
              <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
                {filteredAndSortedRecipes.map((recipe) => {
                  const isFavorite = favoriteRecipes.includes(recipe.id);
                  return (
                    <div
                      key={recipe.id}
                      className="mb-4 break-inside-avoid-column group"
                    >
                      <div className="relative rounded-xl overflow-hidden bg-white shadow-md hover:shadow-xl transition-shadow duration-300">
                        <div className="relative">
                          <img
                            src={recipe.realImage || recipe.image}
                            alt={recipe.title}
                            className="w-full object-cover"
                            style={{
                              aspectRatio:
                                Math.random() > 0.5 ? "1/1" : "1/1.5",
                            }}
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <button
                              className="bg-white text-gray-800 font-medium py-2 px-4 rounded-full shadow-md hover:bg-green-500 hover:text-white transition-colors duration-300"
                              onClick={() => viewRecipeDetails(recipe)}
                            >
                              View Recipe
                            </button>
                          </div>
                          <div className="absolute top-2 right-2 flex flex-col gap-2">
                            <button
                              className={`p-2 rounded-full ${
                                isFavorite
                                  ? "bg-red-500 text-white"
                                  : "bg-white text-gray-600"
                              } shadow-md hover:scale-110 transition-transform`}
                              onClick={() => toggleFavorite(recipe.id)}
                            >
                              <Heart
                                size={16}
                                fill={isFavorite ? "#FFFFFF" : "none"}
                              />
                            </button>
                            <button className="p-2 rounded-full bg-white text-gray-600 shadow-md hover:scale-110 transition-transform">
                              <Share2 size={16} />
                            </button>
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-3">
                            <span className="inline-block bg-blue-500 bg-opacity-80 text-white text-xs px-2 py-1 rounded-full mb-1">
                              {getApiSourceLabel(recipe.source)}
                            </span>
                            {recipe.cuisines && recipe.cuisines.length > 0 && (
                              <span className="inline-block ml-1 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-full">
                                {recipe.cuisines[0]}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="p-3">
                          <h2 className="font-medium text-gray-800 hover:text-green-600 line-clamp-2">
                            {recipe.title}
                          </h2>

                          <div className="flex justify-between items-center mt-2 text-sm text-gray-600">
                            <span className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {recipe.readyInMinutes} min
                            </span>
                            <span className="font-medium bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs">
                              {recipe.nutrition?.nutrients
                                ?.find((n) => n.name === "Calories")
                                ?.amount.toFixed(0) || "N/A"}{" "}
                              kcal
                            </span>
                          </div>

                          {recipe.diets?.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {recipe.diets.slice(0, 2).map((diet, idx) => (
                                <span
                                  key={idx}
                                  className="text-xs bg-gray-100 px-2 py-0.5 rounded-full"
                                >
                                  {diet}
                                </span>
                              ))}
                              {recipe.diets.length > 2 && (
                                <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                                  +{recipe.diets.length - 2}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {!loading && view === "grid" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredAndSortedRecipes.map((recipe) => {
                  const isFavorite = favoriteRecipes.includes(recipe.id);
                  return (
                    <div
                      key={recipe.id}
                      className="rounded-xl overflow-hidden bg-white shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col"
                    >
                      <div className="relative">
                        <img
                          src={recipe.realImage || recipe.image}
                          alt={recipe.title}
                          className="w-full h-48 object-cover"
                        />
                        <div className="absolute top-2 left-2 bg-blue-500 bg-opacity-80 text-white text-xs px-2 py-1 rounded-full">
                          {getApiSourceLabel(recipe.source)}
                        </div>
                        {recipe.cuisines && recipe.cuisines.length > 0 && (
                          <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-full">
                            {recipe.cuisines[0]}
                          </div>
                        )}
                        <button
                          className={`absolute bottom-2 right-2 p-2 rounded-full ${
                            isFavorite
                              ? "bg-red-500 text-white"
                              : "bg-white text-gray-600"
                          } shadow-md hover:scale-110 transition-transform`}
                          onClick={() => toggleFavorite(recipe.id)}
                        >
                          <Heart
                            size={16}
                            fill={isFavorite ? "#FFFFFF" : "none"}
                          />
                        </button>
                      </div>

                      <div className="p-4 flex-grow flex flex-col">
                        <h2 className="text-lg font-medium mb-2 line-clamp-2">
                          {recipe.title}
                        </h2>

                        <div className="flex justify-between items-center mt-auto">
                          <span className="text-sm text-gray-500 flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {recipe.readyInMinutes} min
                          </span>
                          <span className="text-sm font-medium bg-green-100 text-green-800 px-2 py-1 rounded">
                            {recipe.nutrition?.nutrients
                              ?.find((n) => n.name === "Calories")
                              ?.amount.toFixed(0) || "N/A"}{" "}
                            kcal
                          </span>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-1 mb-3">
                          {recipe.diets?.slice(0, 3).map((diet, index) => (
                            <span
                              key={index}
                              className="text-xs bg-gray-100 px-2 py-1 rounded"
                            >
                              {diet}
                            </span>
                          ))}
                        </div>

                        <button
                          onClick={() => viewRecipeDetails(recipe)}
                          className="mt-auto block w-full bg-green-100 hover:bg-green-200 text-green-800 py-2 rounded-lg text-sm font-medium transition-colors text-center"
                        >
                          View Recipe
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {searchPerformed &&
              !loading &&
              filteredAndSortedRecipes.length === 0 &&
              !error && (
                <div className="bg-white p-12 rounded-lg shadow-md text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-6">
                    <AlertCircle className="w-8 h-8 text-yellow-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">No recipes found</h3>
                  <p className="text-gray-600 mb-6">
                    We couldn't find any recipes with your selected ingredients
                    and filters.
                  </p>
                  <div className="flex justify-center">
                    <button
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      onClick={clearSearch}
                    >
                      Start a new search
                    </button>
                  </div>
                </div>
              )}

            {!searchPerformed && !loading && (
              <div className="bg-white p-8 rounded-lg shadow-md text-center">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-8 w-8 text-green-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">
                      Add Ingredients
                    </h3>
                    <p className="text-gray-600">
                      Enter the ingredients you have in your kitchen.
                    </p>
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-8 w-8 text-green-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Find Recipes</h3>
                    <p className="text-gray-600">
                      We'll show you recipes you can make with what you have.
                    </p>
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-8 w-8 text-green-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                        />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">
                      Start Cooking
                    </h3>
                    <p className="text-gray-600">
                      Follow the recipe and enjoy your meal!
                    </p>
                  </div>
                </div>

                <h3 className="text-xl font-semibold mb-4">
                  Popular Ingredients to Try
                </h3>
                <div className="flex flex-wrap justify-center gap-2 max-w-xl mx-auto">
                  {[
                    "Chicken",
                    "Pasta",
                    "Rice",
                    "Potatoes",
                    "Eggs",
                    "Tomatoes",
                    "Onions",
                    "Garlic",
                    "Cheese",
                    "Milk",
                    "Butter",
                    "Flour",
                  ].map((ing, idx) => (
                    <button
                      key={idx}
                      className="px-3 py-1 bg-gray-100 hover:bg-green-100 rounded-full text-sm transition-colors"
                      onClick={() => handleIngredientSelect(ing)}
                    >
                      {ing}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </main>

          {/* Recipe Modal */}
          {showRecipeModal && selectedRecipe && (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Modal Header */}
                <div className="flex justify-between items-center p-4 border-b">
                  <h2 className="text-xl font-bold">{selectedRecipe.title}</h2>
                  <button
                    onClick={closeRecipeModal}
                    className="p-1 rounded-full hover:bg-gray-100"
                  >
                    <X size={24} />
                  </button>
                </div>

                {/* Modal Content */}
                <div className="overflow-y-auto p-4 flex-grow">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column - Image and Quick Facts */}
                    <div>
                      <img
                        src={selectedRecipe.realImage || selectedRecipe.image}
                        alt={selectedRecipe.title}
                        className="w-full h-64 object-cover rounded-lg mb-4"
                      />

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-semibold mb-3">Quick Facts</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-gray-600 text-sm">
                              Cooking Time
                            </p>
                            <p className="font-medium flex items-center">
                              <Clock className="w-4 h-4 mr-1 text-green-600" />
                              {selectedRecipe.readyInMinutes} minutes
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600 text-sm">Servings</p>
                            <p className="font-medium">
                              {selectedRecipe.servings} servings
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600 text-sm">Calories</p>
                            <p className="font-medium">
                              {selectedRecipe.nutrition?.nutrients
                                ?.find((n) => n.name === "Calories")
                                ?.amount.toFixed(0) || "N/A"}{" "}
                              kcal
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600 text-sm">Source</p>
                            <p className="font-medium">
                              {selectedRecipe.source}
                            </p>
                          </div>
                        </div>

                        {selectedRecipe.diets?.length > 0 && (
                          <div className="mt-4">
                            <p className="text-gray-600 text-sm mb-2">Diets</p>
                            <div className="flex flex-wrap gap-1">
                              {selectedRecipe.diets.map((diet, idx) => (
                                <span
                                  key={idx}
                                  className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded"
                                >
                                  {diet}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {selectedRecipe.cuisines?.length > 0 && (
                          <div className="mt-4">
                            <p className="text-gray-600 text-sm mb-2">
                              Cuisines
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {selectedRecipe.cuisines.map((cuisine, idx) => (
                                <span
                                  key={idx}
                                  className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                                >
                                  {cuisine}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right Column - Ingredients and Instructions */}
                    <div>
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-3 flex items-center">
                          <span className="w-6 h-6 bg-green-100 text-green-800 rounded-full inline-flex items-center justify-center mr-2 text-sm">
                            1
                          </span>
                          Ingredients
                        </h3>
                        <ul className="list-disc pl-6 space-y-2">
                          {selectedRecipe.ingredients.map((ingredient, idx) => (
                            <li key={idx} className="text-gray-700">
                              {ingredient}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-3 flex items-center">
                          <span className="w-6 h-6 bg-green-100 text-green-800 rounded-full inline-flex items-center justify-center mr-2 text-sm">
                            2
                          </span>
                          Instructions
                        </h3>
                        <div className="text-gray-700 space-y-4">
                          {selectedRecipe.instructions
                            .split("...")
                            .map(
                              (step, idx) =>
                                step.trim() && <p key={idx}>{step.trim()}</p>
                            )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="p-4 border-t flex justify-between">
                  <div>
                    <button
                      onClick={() => toggleFavorite(selectedRecipe.id)}
                      className={`flex items-center px-4 py-2 rounded-lg mr-2 ${
                        favoriteRecipes.includes(selectedRecipe.id)
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      <Heart
                        size={18}
                        className="mr-2"
                        fill={
                          favoriteRecipes.includes(selectedRecipe.id)
                            ? "currentColor"
                            : "none"
                        }
                      />
                      {favoriteRecipes.includes(selectedRecipe.id)
                        ? "Saved to Favorites"
                        : "Save to Favorites"}
                    </button>
                  </div>
                  <div className="flex">
                    <a
                      href={selectedRecipe.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                    >
                      <Share2 size={18} className="mr-2" />
                      Original Source
                    </a>
                    <button
                      onClick={closeRecipeModal}
                      className="ml-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Search Input - Adding this as a floating button */}
          <div className="fixed bottom-6 right-6">
            <button
              className="bg-green-600 hover:bg-green-700 text-white rounded-full p-4 shadow-lg flex items-center"
              onClick={() => {
                // Implementation for opening a search modal
                alert("Search functionality would open here");
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <span className="ml-2 hidden md:inline">Search Recipes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipesPage;
