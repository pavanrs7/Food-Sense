import {
  Facebook,
  Instagram,
  Twitter,
  PinIcon as Pinterest,
  Youtube,
  Mail,
} from "lucide-react";
import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <h1 className="footer-title">Food Sense</h1>

          <div className="footer-links">
            <a href="/about" className="footer-link">
              About us
            </a>
            <a href="/features" className="footer-link">
              Features
            </a>
            <a href="/blogs" className="footer-link">
              Blogs
            </a>
            <a href="/food" className="footer-link">
              Food
            </a>
            <a href="/recipes" className="footer-link">
              Recipes
            </a>
            <a href="/reviews" className="footer-link">
              Reviews
            </a>
            <a href="/signin" className="footer-link">
              Sign in
            </a>
          </div>

          <div className="footer-social">
            <a href="#" className="social-icon">
              <Facebook />
            </a>
            <a href="#" className="social-icon">
              <Instagram />
            </a>
            <a href="#" className="social-icon">
              <Twitter />
            </a>
            <a href="#" className="social-icon">
              <Pinterest />
            </a>
            <a href="#" className="social-icon">
              <Youtube />
            </a>
            <a href="#" className="social-icon">
              <Mail />
            </a>
          </div>

          <div className="footer-secondary-links">
            <a href="/terms" className="footer-link">
              Terms & conditions
            </a>
            <a href="/privacy" className="footer-link">
              Privacy policy
            </a>
            <a href="/contact" className="footer-link">
              Contact
            </a>
            <a href="/cookies" className="footer-link">
              Cookie policy
            </a>
            <a href="/support" className="footer-link">
              Support
            </a>
          </div>

          <div className="footer-copyright">©2025. All Rights Reserved.</div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
