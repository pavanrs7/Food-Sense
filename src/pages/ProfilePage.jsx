import Sidebar from "../components/layout/Sidebar";
import FoodSenseProfile from "../components/profile/FoodSenseProfile";

const ProfilePage = () => {
  return (
    <div className="d-flex page-container">
      <Sidebar />
      <div className="content-area">
        <div className="page-header mb-4 text-center py-4">
          <h1>Your Profile</h1>
          <p className="lead">
            Manage your personal information and view your donation history
          </p>
        </div>

        <FoodSenseProfile />
      </div>
    </div>
  );
};

export default ProfilePage;
