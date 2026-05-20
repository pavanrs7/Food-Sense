import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  SignOutButton,
  useUser,
} from "@clerk/clerk-react";
import Sidebar from "./components/layout/Sidebar";
import Footer from "./components/layout/Footer";
import DashboardLanding from "./pages/DashboardLanding";
import NGO from "./pages/NGO";
import Provider from "./pages/Provider";
import Receiver from "./pages/Receiver";
import ProviderForm from "./components/forms/ProviderForm";
import ReceiverForm from "./components/forms/ReceiverForm";
import BarcodeScanner from "./pages/BarcodeScannerPage";
import PandaBot from "./pages/PandaBotPage";
import Profile from "./pages/ProfilePage";
import AuthPage from "./pages/AuthPage";
import SignOutPage from "./pages/SignOutPage";
import RecipesPage from "./pages/RecipesPage";
import "./App.css";

// Get the publishable key from environment variables
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// Protected route component
const ProtectedRoute = ({ children, userType }) => {
  const { user, isLoaded, isSignedIn } = useUser();

  if (!isLoaded) return null; // or a loading spinner

  if (!isSignedIn) {
    return <Navigate to="/auth" replace />;
  }

  // If no userType is specified, allow access
  if (!userType) {
    return children;
  }

  // If user has no role set, allow access to both forms
  if (!user.publicMetadata.role) {
    return children;
  }

  // If user has a role, check if it matches the required type
  if (user.publicMetadata.role !== userType) {
    // Instead of redirecting to dashboard, show an error message
    return (
      <div className="error-container">
        <h2>Access Denied</h2>
        <p>You need to be a {userType} to access this page.</p>
        <p>Please contact support if you believe this is an error.</p>
      </div>
    );
  }

  return children;
};

function App() {
  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      appearance={{
        elements: {
          formButtonPrimary: "auth-clerk-button",
          footerActionLink: "auth-clerk-link",
          formFieldInput: "auth-clerk-input",
          formFieldLabel: "auth-clerk-label",
          socialButtonsBlockButton: "auth-clerk-social-button",
        },
      }}
    >
      <Router>
        <div className="app">
          <Routes>
            {/* Root route - handle both signed-in and signed-out states */}
            <Route
              path="/"
              element={
                <>
                  <SignedIn>
                    <Navigate to="/dashboard" replace />
                  </SignedIn>
                  <SignedOut>
                    <Navigate to="/auth" replace />
                  </SignedOut>
                </>
              }
            />

            {/* Auth routes - accessible when signed out */}
            <Route
              path="/auth/*"
              element={
                <SignedOut>
                  <AuthPage />
                </SignedOut>
              }
            />

            {/* Sign out route - accessible to all */}
            <Route path="/sign-out" element={<SignOutPage />} />
            <Route path="/user/sign-out" element={<SignOutPage />} />

            {/* Dashboard layout route with nested routes */}
            <Route
              path="/dashboard"
              element={
                <SignedIn>
                  <>
                    <Sidebar />
                    <div className="app-content">
                      <div className="main-content">
                        <Outlet />
                      </div>
                      <Footer />
                    </div>
                  </>
                </SignedIn>
              }
            >
              <Route index element={<DashboardLanding />} />
              <Route path="ngo" element={<NGO />} />

              {/* Provider routes - only for providers */}
              <Route
                path="provider"
                element={
                  <ProtectedRoute userType="provider">
                    <div className="ngo-container">
                    <Provider />
                    </div>
                  </ProtectedRoute>
                }
              />
              <Route
                path="provider-form"
                element={
                  <ProtectedRoute userType="provider">
                    <div className="ngo-container">
                    <ProviderForm />
                    </div>
                  </ProtectedRoute>
                }
              />

              {/* Receiver routes - only for food receivers */}
              <Route
                path="receiver"
                element={
                  <ProtectedRoute userType="receiver">
                    <div className="ngo-container">
                    <Receiver />
                    </div>
                  </ProtectedRoute>
                }
              />
              <Route
                path="receiver-form"
                element={
                  <ProtectedRoute userType="receiver">
                    <div className="ngo-container">
                    <ReceiverForm />
                    </div>
                  </ProtectedRoute>
                }
              />

              {/* Common routes - accessible to all authenticated users */}
              <Route path="recipes" element={<RecipesPage />} />
              <Route path="scanner" element={<BarcodeScanner />} />
              <Route path="panda-bot" element={<PandaBot />} />
              <Route path="profile" element={<Profile />} />

              {/* Redirect to dashboard index if trying to access a non-existent route */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>

            {/* Compatibility with direct URL access */}
            <Route
              path="/ngo"
              element={
                <SignedIn>
                  <Navigate to="/dashboard/ngo" replace />
                </SignedIn>
              }
            />
            <Route
              path="/provider"
              element={
                <SignedIn>
                  <Navigate to="/dashboard/provider" replace />
                </SignedIn>
              }
            />
            <Route
              path="/provider-form"
              element={
                <SignedIn>
                  <Navigate to="/dashboard/provider-form" replace />
                </SignedIn>
              }
            />
            <Route
              path="/receiver"
              element={
                <SignedIn>
                  <Navigate to="/dashboard/receiver" replace />
                </SignedIn>
              }
            />
            <Route
              path="/receiver-form"
              element={
                <SignedIn>
                  <Navigate to="/dashboard/receiver-form" replace />
                </SignedIn>
              }
            />
            <Route
              path="/recipes"
              element={
                <SignedIn>
                  <Navigate to="/dashboard/recipes" replace />
                </SignedIn>
              }
            />
            <Route
              path="/scanner"
              element={
                <SignedIn>
                  <Navigate to="/dashboard/scanner" replace />
                </SignedIn>
              }
            />
            <Route
              path="/panda-bot"
              element={
                <SignedIn>
                  <Navigate to="/dashboard/panda-bot" replace />
                </SignedIn>
              }
            />
            <Route
              path="/profile"
              element={
                <SignedIn>
                  <Navigate to="/dashboard/profile" replace />
                </SignedIn>
              }
            />

            {/* Catch-all route - redirect to auth if not signed in */}
            <Route
              path="*"
              element={
                <>
                  <SignedIn>
                    <Navigate to="/dashboard" replace />
                  </SignedIn>
                  <SignedOut>
                    <Navigate to="/auth" replace />
                  </SignedOut>
                </>
              }
            />
          </Routes>
        </div>
      </Router>
    </ClerkProvider>
  );
}

export default App;
