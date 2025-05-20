import "./BarcodeScanner.css";

const AlternativeProducts = ({ alternatives, isLoading, isTemporary }) => {
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

  if (!alternatives || alternatives.length === 0) {
    return null; // Don't render anything if no alternatives
  }

  return (
    <div className="alternative-products">
      <h3>Healthier Alternatives</h3>

      {isLoading ? (
        <p className="alternatives-description">
          <span>Searching for healthier alternatives...</span>
          <span
            className="spinner-border spinner-border-sm ms-2"
            role="status"
            aria-hidden="true"
          ></span>
        </p>
      ) : isTemporary ? (
        <p className="alternatives-description">
          <span>Finding the best alternatives for you...</span>
          <span
            className="spinner-border spinner-border-sm ms-2"
            role="status"
            aria-hidden="true"
          ></span>
        </p>
      ) : (
        <p className="alternatives-description">
          Here are some healthier alternatives to consider:
        </p>
      )}

      <div className="alternatives-grid">
        {alternatives
          .filter((alt) => !alt.isLoading)
          .map((alt, index) => (
            <div
              key={index}
              className={`alternative-card ${
                alt.isTemporary ? "alternative-card-temporary" : ""
              }`}
            >
              <div className="alternative-image">
                {alt.image ? (
                  <img
                    src={alt.image || "/placeholder.svg"}
                    alt={alt.name || "Alternative product"}
                  />
                ) : (
                  <div className="image-placeholder">
                    <i className="fas fa-box"></i>
                  </div>
                )}
              </div>

              <div className="alternative-info">
                <h5>{alt.name || "Unknown Product"}</h5>

                {alt.category && (
                  <div className="alternative-category">
                    <span>{alt.category}</span>
                  </div>
                )}

                <div className="alternative-ratings">
                  {alt.nutritionGrade && (
                    <div className="nutrition-grade-small">
                      <div
                        className="grade-badge-small"
                        style={{
                          backgroundColor: getNutritionGradeColor(
                            alt.nutritionGrade
                          ),
                        }}
                      >
                        {alt.nutritionGrade.toUpperCase()}
                      </div>
                      <span className="grade-label-small">Nutri-Score</span>
                    </div>
                  )}
                </div>

                <a
                  href={`https://world.openfoodfacts.org/product/${alt.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-sm btn-outline-primary view-details-btn"
                >
                  View Details
                </a>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default AlternativeProducts;
