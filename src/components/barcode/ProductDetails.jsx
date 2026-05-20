import "./BarcodeScanner.css";

const ProductDetails = ({ product, healthRating }) => {
  if (!product) return null;

  const nutriments = product.nutriments || {};

  // Get nutrition grade color
  const getNutritionGradeColor = (grade) => {
    const colors = {
      a: "#1e8f4e", // Dark green
      b: "#75b000", // Light green
      c: "#ffc107", // Yellow
      d: "#ff7d00", // Orange
      e: "#e63e11", // Red
    };
    return colors[grade] || "#6c757d"; // Default gray
  };

  // Format nutrient value
  const formatNutrient = (value, unit = "g") => {
    if (value === undefined || value === null) return "N/A";
    return `${Number.parseFloat(value).toFixed(1)}${unit}`;
  };

  return (
    <div className="product-details">
      <h3>Product Information</h3>

      <div className="product-header">
        {product.image_url ? (
          <div className="product-image">
            <img
              src={product.image_url || "/placeholder.svg"}
              alt={product.product_name || "Product"}
            />
          </div>
        ) : (
          <div className="product-image product-image-placeholder">
            <i className="fas fa-box"></i>
          </div>
        )}

        <div className="product-info">
          <h4>{product.product_name || "Unknown Product"}</h4>
          {product.brands && <p className="product-brand">{product.brands}</p>}

          <div className="health-rating">
            <div
              className="rating-circle"
              style={{
                background: `conic-gradient(#28a745 ${healthRating}%, #e9ecef 0)`,
              }}
            >
              <span>{healthRating}</span>
            </div>
            <div className="rating-label">Health Score</div>
          </div>

          {product.nutrition_grades && (
            <div className="nutrition-grade">
              <div
                className="grade-badge"
                style={{
                  backgroundColor: getNutritionGradeColor(
                    product.nutrition_grades
                  ),
                }}
              >
                {product.nutrition_grades.toUpperCase()}
              </div>
              <div className="grade-label">Nutri-Score</div>
            </div>
          )}
        </div>
      </div>

      <div className="product-details-section">
        <h5>Ingredients</h5>
        <p className="ingredients">
          {product.ingredients_text || "No ingredients information available"}
        </p>
      </div>

      <div className="product-details-section">
        <h5>Nutrition Facts (per 100g)</h5>
        <div className="nutrition-table">
          <div className="nutrition-row">
            <div className="nutrition-label">Energy</div>
            <div className="nutrition-value">
              {formatNutrient(nutriments.energy_100g, "kcal")}
            </div>
          </div>
          <div className="nutrition-row">
            <div className="nutrition-label">Fat</div>
            <div className="nutrition-value">
              {formatNutrient(nutriments.fat_100g)}
            </div>
          </div>
          <div className="nutrition-row">
            <div className="nutrition-label">Saturated Fat</div>
            <div className="nutrition-value">
              {formatNutrient(nutriments.saturated_fat_100g)}
            </div>
          </div>
          <div className="nutrition-row">
            <div className="nutrition-label">Carbohydrates</div>
            <div className="nutrition-value">
              {formatNutrient(nutriments.carbohydrates_100g)}
            </div>
          </div>
          <div className="nutrition-row">
            <div className="nutrition-label">Sugars</div>
            <div className="nutrition-value">
              {formatNutrient(nutriments.sugars_100g)}
            </div>
          </div>
          <div className="nutrition-row">
            <div className="nutrition-label">Fiber</div>
            <div className="nutrition-value">
              {formatNutrient(nutriments.fiber_100g)}
            </div>
          </div>
          <div className="nutrition-row">
            <div className="nutrition-label">Proteins</div>
            <div className="nutrition-value">
              {formatNutrient(nutriments.proteins_100g)}
            </div>
          </div>
          <div className="nutrition-row">
            <div className="nutrition-label">Salt</div>
            <div className="nutrition-value">
              {formatNutrient(nutriments.salt_100g)}
            </div>
          </div>
        </div>
      </div>

      {product.allergens_tags && product.allergens_tags.length > 0 && (
        <div className="product-details-section">
          <h5>Allergens</h5>
          <div className="allergens-list">
            {product.allergens_tags.map((allergen, index) => (
              <span key={index} className="allergen-tag">
                {allergen.replace("en:", "")}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
