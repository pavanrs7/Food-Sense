"use client";

import { useState, useRef, useEffect } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "../../services/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import ProductDetails from "./ProductDetails";
import AlternativeProducts from "./AlternativeProducts";
import "./BarcodeScanner.css";

// Initialize Gemini API with the API key from environment variables
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

// Add fallback model - using the recommended model
const FALLBACK_MODEL = "gemini-1.5-flash";

// CORS proxy configuration
const CORS_PROXY = import.meta.env.DEV ? "https://proxy.cors.sh/" : "";

const BarcodeScanner = () => {
  const [scanning, setScanning] = useState(false);
  const [barcode, setBarcode] = useState(null);
  const [product, setProduct] = useState(null);
  const [alternatives, setAlternatives] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [scanSuccess, setScanSuccess] = useState(false);
  const [manualEntry, setManualEntry] = useState(false);
  const [manualBarcode, setManualBarcode] = useState("");
  const [cameraPermission, setCameraPermission] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [processingImage, setProcessingImage] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const DEBUG = true;

  useEffect(() => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError(
        "Your browser doesn't support camera access. Try using Chrome, Firefox, or Safari."
      );
      setCameraPermission(false);
    }
  }, []);

  const sampleBarcodes = [
    { code: "3017620422003", name: "Nutella" },
    { code: "5449000000996", name: "Coca-Cola" },
    { code: "8001505005592", name: "Barilla Pasta" },
    { code: "3175680011480", name: "Evian Water" },
    { code: "7622210449283", name: "Oreo Cookies" },
  ];

  const startCamera = async () => {
    setError(null);
    setCapturedImage(null);
    setScanning(true);

    try {
      console.log("Requesting camera access...");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;
      videoRef.current.srcObject = stream;

      videoRef.current.onloadedmetadata = () => {
        console.log(
          "Video metadata loaded:",
          videoRef.current.videoWidth,
          "x",
          videoRef.current.videoHeight
        );
        videoRef.current
          .play()
          .then(() => {
            console.log("Video playback started successfully");
            setCameraPermission(true);
          })
          .catch((err) => {
            console.error("Error playing video:", err);
            setError("Failed to start video playback. Please try again.");
            stopCamera();
          });
      };
    } catch (err) {
      console.error("Camera access error:", err);
      setCameraPermission(false);
      setError(
        `Camera access denied: ${err.message}. Please grant camera permissions.`
      );
      setScanning(false);
    }
  };

  const stopCamera = () => {
    console.log("Stopping camera...");
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setScanning(false);
    console.log("Camera stopped");
  };

  const captureFrame = () => {
    if (!videoRef.current || !canvasRef.current) {
      setError("Camera not initialized properly");
      return;
    }

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      console.log(`Video dimensions: ${canvas.width} x ${canvas.height}`);

      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageDataUrl = canvas.toDataURL("image/jpeg", 0.95);
      setCapturedImage(imageDataUrl);
      console.log("Image captured successfully");

      setProcessingImage(true);
      processImageWithGemini(imageDataUrl);
    } catch (err) {
      console.error("Error capturing frame:", err);
      setError("Failed to capture image. Please try again.");
      setProcessingImage(false);
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCapturedImage(e.target.result);
        setProcessingImage(true);
        processImageWithGemini(e.target.result).catch((err) =>
          console.error("Upload error:", err)
        );
      };
      reader.readAsDataURL(file);
    }
  };

  const processImageWithGemini = async (imageDataUrl) => {
    console.log("Starting image processing with Gemini API...");
    try {
      // Try with the fallback model first to avoid rate limits
      const model = genAI.getGenerativeModel({ model: FALLBACK_MODEL });
      const prompt =
        "Extract the 12 or 13 digit barcode number from this image. Return only the number if found, or 'not found' if no valid barcode is detected.";

      const base64Image = imageDataUrl.split(",")[1];
      const imageParts = [
        {
          inlineData: {
            data: base64Image,
            mimeType: "image/jpeg",
          },
        },
      ];

      try {
        const result = await model.generateContent([prompt, ...imageParts]);
        const responseText = result.response.text().trim();
        handleBarcodeResponse(responseText);
      } catch (fallbackError) {
        console.error("Fallback model error:", fallbackError);
        setError(
          "Failed to process image. Please try entering the barcode manually."
        );
        setManualEntry(true);
      }
    } catch (err) {
      console.error("Gemini API error:", err);
      setError(
        "Failed to process image. Please try entering the barcode manually."
      );
      setManualEntry(true);
    } finally {
      setProcessingImage(false);
    }
  };

  // Helper function to handle barcode response
  const handleBarcodeResponse = (responseText) => {
    console.log("Full extracted text:", responseText);

    if (responseText.match(/^\d{12,13}$/)) {
      let detectedBarcode = responseText;
      if (detectedBarcode.length === 12) {
        detectedBarcode = "0" + detectedBarcode;
        console.log("Converted 12-digit UPC-A to EAN-13:", detectedBarcode);
      }
      console.log("Found barcode:", detectedBarcode);
      setBarcode(detectedBarcode);
      setScanSuccess(true);
      fetchProductDetails(detectedBarcode);
    } else if (responseText === "not found") {
      console.log("No barcode detected by Gemini.");
      setError("No valid barcode found. Try adjusting alignment or lighting.");
    } else {
      console.log("Unexpected response from Gemini:", responseText);
      setError("Failed to interpret barcode. Try again with better alignment.");
    }
  };

  // Optimize fetchAlternatives for speed
  const fetchAlternatives = async (product) => {
    if (!product) {
      console.log("No product data available for alternatives");
      return [];
    }

    try {
      // Extract product information for comparison
      const productName = product.product_name || "";
      const productCategories = product.categories_tags || [];
      const productNutriScore = product.nutrition_grades || "e";
      const productNutriScoreValue = getNutriScoreValue(productNutriScore);

      console.log("Finding alternatives for:", productName);

      // Use Promise.all to fetch from multiple sources in parallel
      const searchPromises = [];

      // 1. Search by main category (most specific first)
      if (productCategories.length > 0) {
        // Sort categories from most specific to least specific
        const sortedCategories = [...productCategories].sort(
          (a, b) => b.length - a.length
        );

        // Take top 2 most specific categories for faster search
        const topCategories = sortedCategories.slice(0, 2);

        for (const category of topCategories) {
          const categoryName = category.replace("en:", "");
          searchPromises.push(
            fetch(
              `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(
                categoryName
              )}&search_simple=1&action=process&json=1&page_size=25`
            )
              .then((response) =>
                response.ok ? response.json() : { products: [] }
              )
              .then((data) => ({
                source: "category",
                category: categoryName,
                products: data.products || [],
              }))
              .catch(() => ({
                source: "category",
                category: categoryName,
                products: [],
              }))
          );
        }
      }

      // 2. Search by product name in parallel
      if (productName) {
        const productType = productName.split(" ").slice(0, 2).join(" ");
        searchPromises.push(
          fetch(
            `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(
              productType
            )}&search_simple=1&action=process&json=1&page_size=25`
          )
            .then((response) =>
              response.ok ? response.json() : { products: [] }
            )
            .then((data) => ({ source: "name", products: data.products || [] }))
            .catch(() => ({ source: "name", products: [] }))
        );
      }

      // Wait for all searches to complete
      const searchResults = await Promise.all(searchPromises);

      // Process all results
      let allProducts = [];
      for (const result of searchResults) {
        allProducts = [...allProducts, ...result.products];
      }

      // Filter and deduplicate
      const seenIds = new Set();
      const alternatives = allProducts
        .filter((alt) => {
          // Skip if we've seen this product already
          if (seenIds.has(alt.code)) return false;
          seenIds.add(alt.code);

          // Must be a different product
          if (alt.code === product.code) return false;

          // Must have a nutrition grade
          if (!alt.nutrition_grades) return false;

          // Must have product name and image
          if (!alt.product_name || !alt.image_url) return false;

          // Must have a better nutrition grade
          const altNutriScoreValue = getNutriScoreValue(alt.nutrition_grades);
          return altNutriScoreValue < productNutriScoreValue;
        })
        .map((alt) => ({
          id: alt.code,
          name: alt.product_name,
          image: alt.image_url,
          nutritionGrade: alt.nutrition_grades,
          brand: alt.brands || "",
          category:
            alt.categories_tags?.[0]?.replace("en:", "") || "Similar product",
        }))
        .sort((a, b) => {
          return (
            getNutriScoreValue(a.nutritionGrade) -
            getNutriScoreValue(b.nutritionGrade)
          );
        })
        .slice(0, 6); // Limit to 6 alternatives

      return alternatives;
    } catch (error) {
      console.error("Error in fetchAlternatives:", error);
      return [];
    }
  };

  // Function to fetch alternatives in the background
  const fetchAlternativesInBackground = async (product) => {
    try {
      // Set a loading state for alternatives
      setAlternatives([{ isLoading: true }]);

      // Start with quick fallback alternatives while real ones load
      const quickFallbacks = getQuickFallbackAlternatives(product);
      if (quickFallbacks.length > 0) {
        setAlternatives(
          quickFallbacks.map((alt) => ({ ...alt, isTemporary: true }))
        );
      }

      // Fetch real alternatives
      const alternativesList = await fetchAlternatives(product);

      if (alternativesList && alternativesList.length > 0) {
        setAlternatives(alternativesList);
      } else {
        // If no alternatives found, use complete fallback
        setAlternatives(getFallbackAlternatives(product));
      }
    } catch (altError) {
      console.error("Error fetching alternatives:", altError);
      setAlternatives(getFallbackAlternatives(product));
    }
  };

  // Quick fallback alternatives that load instantly
  const getQuickFallbackAlternatives = (product) => {
    if (!product) return [];

    // Get basic product info
    const productName = (product.product_name || "").toLowerCase();
    const productNutriScore = product.nutrition_grades || "e";

    // Return 2-3 generic alternatives based on product type
    if (productName.includes("chocolate")) {
      return [
        {
          id: "quick1",
          name: "Dark Chocolate",
          image:
            "https://images.openfoodfacts.org/images/products/301/762/042/2003/front_en.427.400.jpg",
          nutritionGrade: "c",
          category: "Chocolate",
        },
        {
          id: "quick2",
          name: "Organic Chocolate",
          image:
            "https://images.openfoodfacts.org/images/products/301/762/042/2003/front_en.427.400.jpg",
          nutritionGrade: "b",
          category: "Chocolate",
        },
      ];
    } else if (productName.includes("cola") || productName.includes("soda")) {
      return [
        {
          id: "quick1",
          name: "Sparkling Water",
          image:
            "https://images.openfoodfacts.org/images/products/327/408/000/5003/front_en.166.400.jpg",
          nutritionGrade: "a",
          category: "Beverages",
        },
        {
          id: "quick2",
          name: "Zero Sugar Option",
          image:
            "https://images.openfoodfacts.org/images/products/544/900/000/0996/front_en.198.400.jpg",
          nutritionGrade: "b",
          category: "Beverages",
        },
      ];
    }

    // Generic quick alternatives
    return [
      {
        id: "quick1",
        name: "Healthier Alternative",
        image:
          "https://images.openfoodfacts.org/images/products/default.400.jpg",
        nutritionGrade: getNutriScoreImproved(productNutriScore),
        category: "Healthier Option",
      },
      {
        id: "quick2",
        name: "Organic Option",
        image:
          "https://images.openfoodfacts.org/images/products/default.400.jpg",
        nutritionGrade: getNutriScoreImproved(productNutriScore),
        category: "Healthier Option",
      },
    ];
  };

  // Helper to get an improved nutri-score
  const getNutriScoreImproved = (score) => {
    const scores = ["a", "b", "c", "d", "e"];
    const currentIndex = scores.indexOf(score?.toLowerCase() || "e");
    // Return at least one grade better, or 'a' if already good
    return scores[Math.max(0, currentIndex - 1)];
  };

  // Helper function to convert nutrition grade to numeric value for comparison
  const getNutriScoreValue = (grade) => {
    const values = { a: 1, b: 2, c: 3, d: 4, e: 5 };
    return values[grade?.toLowerCase()] || 5; // Default to worst score if unknown
  };

  const fetchWithRetry = async (url, options, maxRetries = 3) => {
    for (let i = 0; i < maxRetries; i++) {
      try {
        const response = await fetch(url, options);
        if (!response.ok) {
          if (response.status === 429) {
            // If rate limited, wait longer before retrying
            await new Promise((resolve) =>
              setTimeout(resolve, Math.pow(2, i) * 2000)
            );
            continue;
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response;
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        // Wait before retrying (exponential backoff)
        await new Promise((resolve) =>
          setTimeout(resolve, Math.pow(2, i) * 1000)
        );
      }
    }
  };

  const fetchProductDetails = async (code) => {
    setLoading(true);
    try {
      console.log("Fetching product details for barcode:", code);

      const fetchOptions = {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        signal: AbortSignal.timeout(15000), // Reduced timeout to 15 seconds
      };

      // Fetch product details
      const productResponse = await fetchWithRetry(
        `https://world.openfoodfacts.org/api/v0/product/${code}.json`,
        fetchOptions
      );

      const productData = await productResponse.json();
      console.log("Product data received:", productData);

      if (productData.status === 1 && productData.product) {
        // Set product data immediately
        setProduct(productData.product);

        // Start fetching alternatives immediately in parallel
        // but don't await it here - let it run in the background
        fetchAlternativesInBackground(productData.product);

        // Handle Firebase in the background
        (async () => {
          try {
            await addDoc(collection(db, "productScans"), {
              barcode: code,
              productName:
                productData.product.product_name || "Unknown Product",
              nutriScore: productData.product.nutrition_grades || "unknown",
              timestamp: serverTimestamp(),
              nutritionalData: productData.product.nutriments || {},
            });
          } catch (firebaseError) {
            console.warn("Failed to save to Firebase:", firebaseError);
          }
        })();
      } else {
        console.log("Product not found in database:", productData);
        if (productData.status === 0) {
          setError(
            "This product exists in our database but has no detailed information yet."
          );
        } else {
          setError(
            "This product is not found in our database. Would you like to enter the product details manually?"
          );
        }
        setManualEntry(true);
      }
    } catch (err) {
      console.error("Error fetching product details:", err);
      if (err.name === "AbortError" || err.name === "TimeoutError") {
        setError("Request timed out. Please try again.");
      } else if (err.message.includes("Failed to fetch")) {
        setError(
          "Network error. Please check your internet connection and try again."
        );
      } else {
        setError(
          "Failed to fetch product details. Please try again or enter the details manually."
        );
      }
      setManualEntry(true);
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualBarcode.trim() && /^\d{12,13}$/.test(manualBarcode.trim())) {
      let code = manualBarcode.trim();
      if (code.length === 12) code = "0" + code;
      fetchProductDetails(code);
    } else {
      setError("Please enter a valid 12 or 13-digit barcode.");
    }
  };

  const useSampleBarcode = () => {
    const randomIndex = Math.floor(Math.random() * sampleBarcodes.length);
    setManualBarcode(sampleBarcodes[randomIndex].code);
  };

  const checkCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach((track) => track.stop());
      setCameraPermission(true);
      return true;
    } catch (err) {
      console.error("Camera permission error during check:", err);
      setCameraPermission(false);
      return false;
    }
  };

  useEffect(() => {
    console.log("Video element is ready in the DOM");
    checkCameraPermission();
    return () => stopCamera();
  }, []);

  // Add useEffect to track alternatives changes
  useEffect(() => {
    console.log("Alternatives state changed:", alternatives);
  }, [alternatives]);

  return (
    <div className="barcode-scanner-container">
      <h2>Barcode Scanner</h2>
      <p className="scanner-description">
        Scan or upload food product barcodes to check nutritional information
        and find healthier alternatives.
      </p>

      {!scanning && !barcode && (
        <div className="scanner-controls">
          <div className="scan-upload-buttons">
            <button
              className="btn btn-primary scan-btn"
              onClick={startCamera}
              disabled={loading}
            >
              <i className="fas fa-camera"></i> Open Camera
            </button>
            <label htmlFor="imageUpload" className="btn btn-primary scan-btn">
              <i className="fas fa-upload"></i> Upload Image
            </label>
            <input
              id="imageUpload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: "none" }}
              disabled={processingImage}
            />
          </div>
          <div className="manual-entry-toggle">
            <button
              className="btn btn-link"
              onClick={() => setManualEntry(!manualEntry)}
            >
              {manualEntry ? "Hide Manual Entry" : "Enter Barcode Manually"}
            </button>
          </div>
        </div>
      )}

      {manualEntry && !barcode && (
        <form onSubmit={handleManualSubmit} className="manual-entry-form">
          <div className="form-group mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Enter barcode number"
              value={manualBarcode}
              onChange={(e) => setManualBarcode(e.target.value)}
              required
            />
          </div>
          <div className="d-flex gap-2">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              Submit
            </button>
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={useSampleBarcode}
            >
              Use Sample Barcode
            </button>
          </div>
          <div className="mt-2 small text-muted">
            <p>
              Example barcodes: 3017620422003 (Nutella), 5449000000996
              (Coca-Cola).
            </p>
          </div>
        </form>
      )}

      {scanning && (
        <div className="scanner-view">
          <video
            ref={videoRef}
            className="scanner-video"
            autoPlay
            playsInline
            muted
          ></video>
          <canvas
            ref={canvasRef}
            className="drawingBuffer"
            style={{ display: "none" }}
          ></canvas>
          <div className="scanner-overlay">
            <div className="scanner-crosshair"></div>
          </div>
          <div className="scanner-buttons">
            <button
              className="btn btn-success capture-btn"
              onClick={captureFrame}
              disabled={processingImage}
            >
              <i className="fas fa-camera"></i> Capture
            </button>
            <button
              className="btn btn-danger cancel-scan-btn"
              onClick={stopCamera}
              disabled={processingImage}
            >
              <i className="fas fa-times"></i> Cancel
            </button>
          </div>
        </div>
      )}

      {loading && (
        <div className="loading-spinner">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}

      {capturedImage && !barcode && (
        <div className="captured-image-container mt-3 mb-3">
          <h5>Captured Image</h5>
          <img
            src={capturedImage || "/placeholder.svg"}
            alt="Captured frame"
            style={{
              maxWidth: "100%",
              maxHeight: "300px",
              border: "1px solid #ccc",
            }}
          />
          <div className="mt-2">
            <p className="text-muted small">
              {processingImage ? (
                <span>
                  <i className="fas fa-spinner fa-spin me-2"></i> Processing
                  image with Gemini...
                </span>
              ) : error ? (
                error
              ) : (
                "No barcode detected. Ensure barcode is centered below the lines in the frame."
              )}
            </p>
          </div>
        </div>
      )}

      {scanning && (
        <div className="scanner-guide mt-2 mb-3">
          <div className="alert alert-info text-center">
            <i className="fas fa-info-circle me-2"></i>
            Position barcode lines in the center of the frame, with numbers
            below, then press Capture
          </div>
          <div className="scanning-tips">
            <ul className="small text-muted">
              <li>Make sure barcode is well-lit and not blurry</li>
              <li>Hold camera 4-8 inches (10-20cm) from barcode</li>
              <li>Align barcode lines horizontally in the frame</li>
              <li>Ensure numbers are directly below the lines</li>
              <li>Try different angles or lighting if detection fails</li>
            </ul>
          </div>
        </div>
      )}

      {cameraPermission === false && (
        <div className="alert alert-warning camera-permission-alert">
          <i className="fas fa-exclamation-triangle"></i>
          <div>
            <strong>Camera access required</strong>
            <p>Please allow camera access in your browser settings.</p>
            <button
              className="btn btn-sm btn-outline-primary mt-2"
              onClick={startCamera}
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {scanSuccess && barcode && (
        <div className="scan-success-message">
          <div className="alert alert-success">
            <i className="fas fa-check-circle"></i> Barcode scanned
            successfully: {barcode}
          </div>
        </div>
      )}

      {error && (
        <div className="error-message alert alert-danger">
          <i className="fas fa-exclamation-circle"></i> {error}
        </div>
      )}

      {product && (
        <ProductDetails
          product={product}
          nutriScore={product.nutrition_grades}
        />
      )}

      {/* Alternatives Section */}
      {alternatives.length > 0 ? (
        <AlternativeProducts
          alternatives={alternatives}
          isLoading={alternatives.some((alt) => alt.isLoading)}
          isTemporary={alternatives.some((alt) => alt.isTemporary)}
        />
      ) : (
        product && (
          <div className="alternative-products">
            <h3>Healthier Alternatives</h3>
            <p className="alternatives-description">
              Searching for healthier alternatives...
            </p>
            <div className="loading-spinner-small">
              <div
                className="spinner-border spinner-border-sm text-primary"
                role="status"
              >
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          </div>
        )
      )}

      {barcode && (
        <div className="scan-again">
          <button
            className="btn btn-outline-primary"
            onClick={() => {
              setBarcode(null);
              setProduct(null);
              setAlternatives([]);
              setError(null);
              setScanSuccess(false);
              setCapturedImage(null);
              stopCamera();
            }}
          >
            <i className="fas fa-redo"></i> Scan Another Product
          </button>
        </div>
      )}
    </div>
  );
};

export default BarcodeScanner;

// Improved fallback alternatives function
const getFallbackAlternatives = (product) => {
  if (!product) return [];

  // Determine product type from categories or name
  const productName = (product.product_name || "").toLowerCase();
  const categories = (product.categories_tags || []).join(" ").toLowerCase();

  // Chocolate products
  if (productName.includes("chocolate") || categories.includes("chocolate")) {
    return [
      {
        id: "fallback1",
        name: "Dark Chocolate (70% Cocoa)",
        image:
          "https://images.openfoodfacts.org/images/products/301/762/042/2003/front_en.427.400.jpg",
        nutritionGrade: "c",
        category: "Chocolate",
      },
      {
        id: "fallback2",
        name: "Organic Dark Chocolate",
        image:
          "https://images.openfoodfacts.org/images/products/301/762/042/2003/front_en.427.400.jpg",
        nutritionGrade: "b",
        category: "Chocolate",
      },
      {
        id: "fallback3",
        name: "Sugar-Free Chocolate",
        image:
          "https://images.openfoodfacts.org/images/products/301/762/042/2003/front_en.427.400.jpg",
        nutritionGrade: "b",
        category: "Chocolate",
      },
      {
        id: "fallback4",
        name: "Cacao Nibs",
        image:
          "https://images.openfoodfacts.org/images/products/301/762/042/2003/front_en.427.400.jpg",
        nutritionGrade: "a",
        category: "Chocolate",
      },
    ];
  }
  // Soda/Cola products
  else if (
    productName.includes("cola") ||
    categories.includes("soda") ||
    categories.includes("beverage")
  ) {
    return [
      {
        id: "fallback1",
        name: "Sparkling Water",
        image:
          "https://images.openfoodfacts.org/images/products/327/408/000/5003/front_en.166.400.jpg",
        nutritionGrade: "a",
        category: "Beverages",
      },
      {
        id: "fallback2",
        name: "Diet Cola",
        image:
          "https://images.openfoodfacts.org/images/products/544/900/000/0996/front_en.198.400.jpg",
        nutritionGrade: "b",
        category: "Beverages",
      },
      {
        id: "fallback3",
        name: "Zero Sugar Cola",
        image:
          "https://images.openfoodfacts.org/images/products/544/900/000/0996/front_en.198.400.jpg",
        nutritionGrade: "b",
        category: "Beverages",
      },
      {
        id: "fallback4",
        name: "Fruit-Infused Water",
        image:
          "https://images.openfoodfacts.org/images/products/327/408/000/5003/front_en.166.400.jpg",
        nutritionGrade: "a",
        category: "Beverages",
      },
    ];
  }
  // Pasta products
  else if (productName.includes("pasta") || categories.includes("pasta")) {
    return [
      {
        id: "fallback1",
        name: "Whole Wheat Pasta",
        image:
          "https://images.openfoodfacts.org/images/products/800/150/500/5592/front_en.128.400.jpg",
        nutritionGrade: "a",
        category: "Pasta",
      },
      {
        id: "fallback2",
        name: "Brown Rice Pasta",
        image:
          "https://images.openfoodfacts.org/images/products/800/150/500/5592/front_en.128.400.jpg",
        nutritionGrade: "a",
        category: "Pasta",
      },
      {
        id: "fallback3",
        name: "Quinoa Pasta",
        image:
          "https://images.openfoodfacts.org/images/products/800/150/500/5592/front_en.128.400.jpg",
        nutritionGrade: "a",
        category: "Pasta",
      },
      {
        id: "fallback4",
        name: "Lentil Pasta",
        image:
          "https://images.openfoodfacts.org/images/products/800/150/500/5592/front_en.128.400.jpg",
        nutritionGrade: "a",
        category: "Pasta",
      },
    ];
  }
  // Snacks
  else if (
    productName.includes("cookie") ||
    productName.includes("snack") ||
    categories.includes("snack") ||
    categories.includes("cookie")
  ) {
    return [
      {
        id: "fallback1",
        name: "Whole Grain Crackers",
        image:
          "https://images.openfoodfacts.org/images/products/762/221/044/9283/front_en.374.400.jpg",
        nutritionGrade: "b",
        category: "Snacks",
      },
      {
        id: "fallback2",
        name: "Oat Cookies (Low Sugar)",
        image:
          "https://images.openfoodfacts.org/images/products/762/221/044/9283/front_en.374.400.jpg",
        nutritionGrade: "b",
        category: "Snacks",
      },
      {
        id: "fallback3",
        name: "Rice Cakes",
        image:
          "https://images.openfoodfacts.org/images/products/762/221/044/9283/front_en.374.400.jpg",
        nutritionGrade: "a",
        category: "Snacks",
      },
      {
        id: "fallback4",
        name: "Dried Fruit Mix",
        image:
          "https://images.openfoodfacts.org/images/products/762/221/044/9283/front_en.374.400.jpg",
        nutritionGrade: "a",
        category: "Snacks",
      },
    ];
  }
  // Water
  else if (productName.includes("water") || categories.includes("water")) {
    return [
      {
        id: "fallback1",
        name: "Spring Water",
        image:
          "https://images.openfoodfacts.org/images/products/317/568/001/1480/front_en.84.400.jpg",
        nutritionGrade: "a",
        category: "Water",
      },
      {
        id: "fallback2",
        name: "Mineral Water",
        image:
          "https://images.openfoodfacts.org/images/products/317/568/001/1480/front_en.84.400.jpg",
        nutritionGrade: "a",
        category: "Water",
      },
      {
        id: "fallback3",
        name: "Filtered Tap Water",
        image:
          "https://images.openfoodfacts.org/images/products/317/568/001/1480/front_en.84.400.jpg",
        nutritionGrade: "a",
        category: "Water",
      },
    ];
  }
  // Generic fallback alternatives
  else {
    return [
      {
        id: "fallback1",
        name: "Organic Alternative",
        image:
          "https://images.openfoodfacts.org/images/products/default.400.jpg",
        nutritionGrade: "a",
        category: "Healthier Option",
      },
      {
        id: "fallback2",
        name: "Low Sugar Version",
        image:
          "https://images.openfoodfacts.org/images/products/default.400.jpg",
        nutritionGrade: "b",
        category: "Healthier Option",
      },
      {
        id: "fallback3",
        name: "Whole Grain Option",
        image:
          "https://images.openfoodfacts.org/images/products/default.400.jpg",
        nutritionGrade: "b",
        category: "Healthier Option",
      },
      {
        id: "fallback4",
        name: "Natural Alternative",
        image:
          "https://images.openfoodfacts.org/images/products/default.400.jpg",
        nutritionGrade: "a",
        category: "Healthier Option",
      },
    ];
  }
};
