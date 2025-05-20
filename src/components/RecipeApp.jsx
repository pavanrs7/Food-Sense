"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Heart,
  Search,
  Clock,
  AlertCircle,
  X,
  Filter,
  RefreshCw,
} from "lucide-react";
import "../css/recipes.css";

// TheMealDB API base URL
const API_BASE_URL = "https://www.themealdb.com/api/json/v1/1/";

const RecipeApp = () => {
  const [recipes, setRecipes] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedArea, setSelectedArea] = useState(null);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [favoriteRecipes, setFavoriteRecipes] = useState([]);
  const [view, setView] = useState("grid");
  const [sortBy, setSortBy] = useState("name");

  // Load favorites from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem("favoriteRecipes");
    if (savedFavorites) {
      setFavoriteRecipes(JSON.parse(savedFavorites));
    }
  }, []);

  // Save favorites to localStorage when they change
  useEffect(() => {
    localStorage.setItem("favoriteRecipes", JSON.stringify(favoriteRecipes));
  }, [favoriteRecipes]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}categories.php`);
        if (!response.ok) {
          throw new Error("Failed to fetch categories");
        }
        const data = await response.json();
        setCategories(data.categories || []);
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError("Failed to load categories. Please try again later.");
      }
    };

    fetchCategories();
  }, []);

  // Fetch areas (cuisines)
  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}list.php?a=list`);
        if (!response.ok) {
          throw new Error("Failed to fetch areas");
        }
        const data = await response.json();
        setAreas(data.meals || []);
      } catch (err) {
        console.error("Error fetching areas:", err);
      }
    };

    fetchAreas();
  }, []);

  // Fetch initial recipes
  useEffect(() => {
    const fetchInitialRecipes = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch recipes from multiple categories for variety
        const initialCategories = [
          "Chicken",
          "Vegetarian",
          "Seafood",
          "Dessert",
        ];
        let allRecipes = [];

        for (const category of initialCategories) {
          const response = await fetch(
            `${API_BASE_URL}filter.php?c=${category}`
          );
          if (!response.ok) {
            throw new Error(`Failed to fetch ${category} recipes`);
          }
          const data = await response.json();
          if (data.meals) {
            // Take 3 recipes from each category
            const categoryRecipes = data.meals.slice(0, 3);
            allRecipes = [...allRecipes, ...categoryRecipes];
          }
        }

        // Get full details for each recipe
        const detailedRecipes = await Promise.all(
          allRecipes.map(async (recipe) => {
            return await fetchRecipeDetails(recipe.idMeal);
          })
        );

        // Filter out any null results
        const validRecipes = detailedRecipes.filter(
          (recipe) => recipe !== null
        );

        setRecipes(validRecipes);
        setFilteredRecipes(validRecipes);
      } catch (err) {
        console.error("Error fetching initial recipes:", err);
        setError("Failed to load recipes. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialRecipes();
  }, []);

  // Fetch recipe details by ID
  const fetchRecipeDetails = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}lookup.php?i=${id}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch recipe details for ID: ${id}`);
      }

      const data = await response.json();
      if (!data.meals || data.meals.length === 0) {
        return null;
      }

      const meal = data.meals[0];

      // Extract ingredients and measures
      const ingredients = [];
      for (let i = 1; i <= 20; i++) {
        const ingredient = meal[`strIngredient${i}`];
        const measure = meal[`strMeasure${i}`];

        if (ingredient && ingredient.trim()) {
          ingredients.push({
            name: ingredient.trim(),
            measure: measure ? measure.trim() : "",
          });
        }
      }

      // Calculate approximate cooking time based on number of ingredients and steps
      const instructionSteps = meal.strInstructions
        .split(/\r\n|\r|\n/)
        .filter((step) => step.trim().length > 0);
      const approximateCookingTime = Math.max(
        15,
        Math.min(120, ingredients.length * 5 + instructionSteps.length * 3)
      );

      return {
        id: meal.idMeal,
        name: meal.strMeal,
        category: meal.strCategory,
        area: meal.strArea,
        instructions: meal.strInstructions,
        image: meal.strMealThumb,
        tags: meal.strTags
          ? meal.strTags.split(",").map((tag) => tag.trim())
          : [],
        youtube: meal.strYoutube,
        ingredients: ingredients,
        source: meal.strSource,
        cookingTime: approximateCookingTime,
        dateModified: meal.dateModified,
      };
    } catch (err) {
      console.error(`Error fetching recipe details for ID ${id}:`, err);
      return null;
    }
  };

  // Search recipes
  const searchRecipes = async (query) => {
    if (!query.trim()) {
      setFilteredRecipes(recipes);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}search.php?s=${query}`);
      if (!response.ok) {
        throw new Error("Failed to search recipes");
      }

      const data = await response.json();
      if (!data.meals) {
        setFilteredRecipes([]);
        setLoading(false);
        return;
      }

      // Get full details for each recipe
      const detailedRecipes = await Promise.all(
        data.meals.map(async (recipe) => {
          return await fetchRecipeDetails(recipe.idMeal);
        })
      );

      // Filter out any null results
      const validRecipes = detailedRecipes.filter((recipe) => recipe !== null);

      setFilteredRecipes(validRecipes);
    } catch (err) {
      console.error("Error searching recipes:", err);
      setError("Failed to search recipes. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault();
    searchRecipes(searchQuery);
  };

  // Filter recipes by category
  const filterByCategory = async (category) => {
    if (selectedCategory === category) {
      setSelectedCategory(null);
      setFilteredRecipes(recipes);
      return;
    }

    setSelectedCategory(category);
    setSelectedArea(null);
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}filter.php?c=${category.strCategory}`
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch ${category.strCategory} recipes`);
      }

      const data = await response.json();
      if (!data.meals) {
        setFilteredRecipes([]);
        setLoading(false);
        return;
      }

      // Get full details for each recipe
      const detailedRecipes = await Promise.all(
        data.meals.map(async (recipe) => {
          return await fetchRecipeDetails(recipe.idMeal);
        })
      );

      // Filter out any null results
      const validRecipes = detailedRecipes.filter((recipe) => recipe !== null);

      setFilteredRecipes(validRecipes);
    } catch (err) {
      console.error(
        `Error filtering by category ${category.strCategory}:`,
        err
      );
      setError("Failed to filter recipes. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Filter recipes by area (cuisine)
  const filterByArea = async (area) => {
    if (selectedArea === area) {
      setSelectedArea(null);
      setFilteredRecipes(recipes);
      return;
    }

    setSelectedArea(area);
    setSelectedCategory(null);
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}filter.php?a=${area.strArea}`
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch ${area.strArea} recipes`);
      }

      const data = await response.json();
      if (!data.meals) {
        setFilteredRecipes([]);
        setLoading(false);
        return;
      }

      // Get full details for each recipe
      const detailedRecipes = await Promise.all(
        data.meals.map(async (recipe) => {
          return await fetchRecipeDetails(recipe.idMeal);
        })
      );

      // Filter out any null results
      const validRecipes = detailedRecipes.filter((recipe) => recipe !== null);

      setFilteredRecipes(validRecipes);
    } catch (err) {
      console.error(`Error filtering by area ${area.strArea}:`, err);
      setError("Failed to filter recipes. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Toggle favorite status
  const toggleFavorite = (id) => {
    setFavoriteRecipes((prev) => {
      if (prev.includes(id)) {
        return prev.filter((recipeId) => recipeId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // View recipe details
  const viewRecipeDetails = async (id) => {
    setLoading(true);

    try {
      const recipe = await fetchRecipeDetails(id);
      if (recipe) {
        setSelectedRecipe(recipe);
        setShowModal(true);
      }
    } catch (err) {
      console.error("Error fetching recipe details:", err);
      setError("Failed to load recipe details. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Sort recipes
  const sortRecipes = useCallback(() => {
    const sorted = [...filteredRecipes];

    if (sortBy === "name") {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "time") {
      sorted.sort((a, b) => a.cookingTime - b.cookingTime);
    }

    setFilteredRecipes(sorted);
  }, [filteredRecipes, sortBy]);

  // Apply sorting when sort option changes
  useEffect(() => {
    if (filteredRecipes.length > 0) {
      sortRecipes();
    }
  }, [sortBy, sortRecipes]);

  // Reset filters
  const resetFilters = () => {
    setSelectedCategory(null);
    setSelectedArea(null);
    setSearchQuery("");
    setFilteredRecipes(recipes);
  };

  // Render loading skeletons
  const renderSkeletons = () => {
    return Array(8)
      .fill()
      .map((_, index) => (
        <div key={index} className="skeleton-card">
          <div className="skeleton skeleton-image"></div>
          <div className="skeleton skeleton-title"></div>
          <div className="skeleton skeleton-text"></div>
          <div className="skeleton-tags">
            <div className="skeleton skeleton-tag"></div>
            <div className="skeleton skeleton-tag"></div>
          </div>
        </div>
      ));
  };

  return (
    <div className="recipe-page-wrapper">
      <div className="recipe-page-header">
        <h1 className="recipe-page-title">Recipe Finder</h1>
        <p className="recipe-page-description">
          Discover delicious recipes from around the world
        </p>
      </div>

      {/* Search Bar */}
      <form
        onSubmit={handleSearch}
        className="search-container flex gap-2 mb-6"
      >
        <div className="relative flex-grow">
          <input
            type="text"
            className="search-input"
            placeholder="Search for recipes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-transparent border-none p-2"
          >
            <Search className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </form>

      {/* Categories */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold">Categories</h2>
          {(selectedCategory || selectedArea) && (
            <button
              onClick={resetFilters}
              className="flex items-center text-sm text-blue-600 hover:text-blue-800"
            >
              <RefreshCw className="w-4 h-4 mr-1" /> Reset Filters
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          {categories.slice(0, 10).map((category) => (
            <button
              key={category.idCategory}
              className={`px-3 py-1 rounded-full text-sm ${
                selectedCategory === category
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              onClick={() => filterByCategory(category)}
            >
              {category.strCategory}
            </button>
          ))}
        </div>
      </div>

      {/* Cuisines */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Cuisines</h2>
        <div className="flex flex-wrap gap-2 mb-4">
          {areas.slice(0, 10).map((area) => (
            <button
              key={area.strArea}
              className={`px-3 py-1 rounded-full text-sm ${
                selectedArea === area
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              onClick={() => filterByArea(area)}
            >
              {area.strArea}
            </button>
          ))}
        </div>
      </div>

      {/* View Toggle and Sorting */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-2">
          <button
            className={`px-3 py-1 rounded-full text-sm ${
              sortBy === "name"
                ? "bg-green-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            onClick={() => setSortBy("name")}
          >
            Sort by Name
          </button>
          <button
            className={`px-3 py-1 rounded-full text-sm ${
              sortBy === "time"
                ? "bg-green-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            onClick={() => setSortBy("time")}
          >
            Sort by Time
          </button>
        </div>

        <button
          className="px-3 py-1 bg-blue-500 text-white rounded-full text-sm flex items-center gap-1"
          onClick={() => setView(view === "grid" ? "list" : "grid")}
        >
          <Filter className="w-4 h-4" />
          {view === "grid" ? "List View" : "Grid View"}
        </button>
      </div>

      {/* Loading Indicator */}
      {loading && <div className="recipe-grid">{renderSkeletons()}</div>}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg mb-6">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* No Results */}
      {!loading && filteredRecipes.length === 0 && (
        <div className="bg-white p-12 rounded-lg shadow-md text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-6">
            <AlertCircle className="w-8 h-8 text-yellow-600" />
          </div>
          <h3 className="text-xl font-bold mb-2">No recipes found</h3>
          <p className="text-gray-600 mb-6">
            We couldn't find any recipes matching your search criteria. Try
            different keywords or filters.
          </p>
          <button
            onClick={resetFilters}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Recipe Grid */}
      {!loading && filteredRecipes.length > 0 && (
        <div className={view === "grid" ? "recipe-grid" : "space-y-4"}>
          {filteredRecipes.map((recipe) => {
            const isFavorite = favoriteRecipes.includes(recipe.id);

            return view === "grid" ? (
              <div key={recipe.id} className="recipe-card">
                <div className="recipe-image-container">
                  <img
                    src={recipe.image || "/placeholder.svg"}
                    alt={recipe.name}
                    className="recipe-image"
                    loading="lazy"
                  />
                </div>
                <div className="recipe-content">
                  <h3 className="recipe-title">{recipe.name}</h3>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {recipe.cookingTime} min
                    </span>
                    <button
                      onClick={() => toggleFavorite(recipe.id)}
                      className="p-2 rounded-full hover:bg-gray-100"
                    >
                      <Heart
                        className={`w-5 h-5 ${
                          isFavorite
                            ? "text-red-500 fill-red-500"
                            : "text-gray-400"
                        }`}
                      />
                    </button>
                  </div>
                  <div className="recipe-tags">
                    {recipe.category && (
                      <span className="recipe-tag">{recipe.category}</span>
                    )}
                    {recipe.area && (
                      <span className="recipe-tag">{recipe.area}</span>
                    )}
                  </div>
                  <button
                    onClick={() => viewRecipeDetails(recipe.id)}
                    className="mt-3 w-full bg-green-100 hover:bg-green-200 text-green-800 py-2 rounded-lg text-sm font-medium transition-colors text-center"
                  >
                    View Recipe
                  </button>
                </div>
              </div>
            ) : (
              <div
                key={recipe.id}
                className="flex bg-white rounded-lg shadow-md overflow-hidden"
              >
                <img
                  src={recipe.image || "/placeholder.svg"}
                  alt={recipe.name}
                  className="w-24 h-24 object-cover"
                  loading="lazy"
                />
                <div className="p-4 flex-grow flex flex-col">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium">{recipe.name}</h3>
                    <button
                      onClick={() => toggleFavorite(recipe.id)}
                      className="p-1 rounded-full hover:bg-gray-100"
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          isFavorite
                            ? "text-red-500 fill-red-500"
                            : "text-gray-400"
                        }`}
                      />
                    </button>
                  </div>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <Clock className="w-3 h-3 mr-1" />
                    {recipe.cookingTime} min
                  </div>
                  <div className="flex gap-2 mt-2">
                    {recipe.category && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                        {recipe.category}
                      </span>
                    )}
                    {recipe.area && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                        {recipe.area}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => viewRecipeDetails(recipe.id)}
                    className="mt-auto self-start text-sm text-green-600 hover:text-green-800"
                  >
                    View Recipe
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Recipe Detail Modal */}
      {showModal && selectedRecipe && (
        <div className="recipe-modal">
          <div className="recipe-modal-content">
            <div className="relative">
              <img
                src={selectedRecipe.image || "/placeholder.svg"}
                alt={selectedRecipe.name}
                className="w-full h-64 object-cover"
              />
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-800">
                  {selectedRecipe.name}
                </h2>
                <button
                  onClick={() => toggleFavorite(selectedRecipe.id)}
                  className={`p-2 rounded-full ${
                    favoriteRecipes.includes(selectedRecipe.id)
                      ? "bg-red-500 text-white"
                      : "bg-gray-100 text-gray-600"
                  } hover:scale-110 transition-transform`}
                >
                  <Heart
                    className="w-5 h-5"
                    fill={
                      favoriteRecipes.includes(selectedRecipe.id)
                        ? "currentColor"
                        : "none"
                    }
                  />
                </button>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {selectedRecipe.category && (
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                    {selectedRecipe.category}
                  </span>
                )}
                {selectedRecipe.area && (
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                    {selectedRecipe.area}
                  </span>
                )}
                {selectedRecipe.tags &&
                  selectedRecipe.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded"
                    >
                      {tag}
                    </span>
                  ))}
              </div>

              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg mb-6">
                <div className="text-center">
                  <p className="text-gray-500 text-sm">Time</p>
                  <p className="font-semibold">
                    {selectedRecipe.cookingTime} min
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-gray-500 text-sm">Cuisine</p>
                  <p className="font-semibold">{selectedRecipe.area}</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-500 text-sm">Category</p>
                  <p className="font-semibold">{selectedRecipe.category}</p>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Ingredients</h3>
                <ul className="list-disc pl-5 space-y-1">
                  {selectedRecipe.ingredients.map((ingredient, idx) => (
                    <li key={idx} className="text-gray-700">
                      {ingredient.measure} {ingredient.name}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Instructions</h3>
                <div className="text-gray-700 space-y-4">
                  {selectedRecipe.instructions
                    .split(/\r\n|\r|\n/)
                    .map(
                      (step, idx) =>
                        step.trim() && <p key={idx}>{step.trim()}</p>
                    )}
                </div>
              </div>

              {selectedRecipe.youtube && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Video Tutorial</h3>
                  <a
                    href={selectedRecipe.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Watch on YouTube
                  </a>
                </div>
              )}

              {selectedRecipe.source && (
                <div className="mt-6">
                  <a
                    href={selectedRecipe.source}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    View Original Recipe
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipeApp;
