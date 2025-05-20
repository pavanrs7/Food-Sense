Food Sense 🍽️

Food Sense is a web application that empowers users to make healthy eating choices and reduce food waste. It offers tools to analyze food nutrition, discover recipes, and connect food donors with recipients. Built with React, Clerk for authentication, Firebase, and APIs like Google Gemini, OpenFoodFacts, and TheMealDB, it’s your one-stop platform for food awareness and community support. 🌱
✨ Features

🔐 Secure Authentication: Sign up and log in effortlessly with Clerk.
📷 Barcode Scanner: Scan food barcodes using OpenFoodFacts API to get nutritional info and healthier alternatives.
🐼 PandaBot: A friendly chatbot powered by Google Gemini API (gemini-1.5-flash) that analyzes food images or text for detailed nutritional breakdowns (calories, macronutrients, micronutrients, benefits, and tips).
🤝 Food Donation System:
Provider Form: List surplus food (e.g., from restaurants) with details like type, quantity, expiry, and location. 📍
Receiver Form: Register organizations (e.g., NGOs, shelters) to receive donated food, specifying capacity and location. 🏠
Distance Calculation: Matches providers and receivers by proximity using the Haversine formula. 📏


🍴 Recipe Finder: Explore recipes from TheMealDB API with search, category/cuisine filters, sorting, and favoriting. ⭐
🗺️ Location Integration: Auto-detects location or allows manual address entry (with geocoding), displayed on an interactive map.

🛠️ Tech Stack

Frontend: React, React-Bootstrap, Lucide-React icons 🚀
Authentication: Clerk for secure login/signup 🔒
APIs:
OpenFoodFacts API for barcode-based nutritional data 📊
Google Gemini API (gemini-1.5-flash) for food image/text analysis 🐼
TheMealDB API for recipe discovery 🍲


Backend: Firebase Firestore for storing provider/receiver data 🔥
Geolocation: Browser Geolocation API and geocoding service for location handling 🌍
Styling: Custom CSS, Tailwind CSS (assumed for some components) 🎨

📂 Project Structure

🔐 Authentication: Clerk secures access to features like donation forms and saved favorites.
📷 BarcodeScannerPage: Scans barcodes via OpenFoodFacts API for nutritional data and alternatives.
🐼 PandaBot: Analyzes food images or text descriptions using Gemini API.
📦 ProviderForm: Registers food providers (e.g., restaurants) with details and location in Firestore.
🏠 ReceiverForm: Registers food receivers (e.g., shelters) with capacity and location in Firestore.
🍴 RecipeApp: Fetches recipes from TheMealDB API, supporting search, filtering, sorting, and favoriting.
📏 Utility Functions:
calculateDistance: Computes distance between coordinates using the Haversine formula.
formatDistance: Formats distances as meters or kilometers for clear UI display.



🚀 Installation

Clone the Repository:
git clone https://github.com/your-username/food-sense.git
cd food-sense


Install Dependencies:
npm install


Set Up Environment Variables:Create a .env file in the root directory and add:
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_API_KEY=your_google_gemini_api_key
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id


Run the Application:
npm run dev

Access the app at http://localhost:5173 (or your configured port). 🌐


🎯 Usage

🔐 Sign Up/Login:

Create an account or log in via Clerk to access personalized features.


📷 Barcode Scanner:

Go to the Food Product Scanner page.
Scan a barcode with your camera or enter it manually.
View nutritional details and healthier options from OpenFoodFacts API.


🐼 PandaBot:

Open the PandaBot chat interface.
Upload a food image or describe a meal (e.g., “grilled chicken”).
Get a nutritional breakdown from the Gemini API.


🤝 Food Donation:

Providers: Submit surplus food details (type, quantity, expiry, location) via the Provider Form.
Receivers: Register an organization with capacity and location via the Receiver Form.
Locations are auto-detected or manually entered, saved in Firestore, and shown on a map.


🍴 Recipe Finder:

Search recipes by name or filter by category (e.g., Vegetarian) or cuisine (e.g., Italian).
Sort by name or cooking time, save favorites, and view details in a modal.


📏 Distance Matching:

The app calculates distances to connect providers and receivers efficiently.



🤝 Contributing
We welcome contributions! To get started:

Fork the repository.
Create a feature branch (git checkout -b feature/your-feature).
Commit changes (git commit -m 'Add your feature').
Push to the branch (git push origin feature/your-feature).
Open a pull request. 🚀

📜 License
This project is licensed under the MIT License.
📬 Contact
For questions or feedback, reach out to pavanshetty6228@gmail.com, prajith.1543@gmail.com,farhanakhtar2401@gmail.com or open an issue on GitHub. 🌟
