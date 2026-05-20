import { Link } from "react-router-dom";

function Header() {
  return (
    <header className="header container">
      <div className="logo">
        <img src="/assets/panda-logo.png" alt="Food Sense Logo" />
        <span>Food Sense</span>
      </div>
      <button className="navbar-toggler d-md-none" type="button">
        <span className="navbar-toggler-icon"></span>
      </button>
    </header>
  );
}

export default Header;
