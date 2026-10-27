/**
 * Footer Component
 * Dark-tech responsive footer displaying quick navigation links, category shortcuts,
 * tech stack credentials, and college submission metadata.
 */
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-container">
          {/* Brand Info */}
          <div className="footer-col brand-col">
            <Link to="/" className="footer-logo">
              <span className="logo-badge">&lt;/&gt;</span>
              <span className="logo-text">Dev<span className="logo-highlight">Store</span></span>
            </Link>
            <p className="footer-tagline">
              The premier marketplace engineered for software engineers, machine learning researchers, and security analysts.
            </p>
            <div className="submission-badge">
              <span className="badge-dot">●</span> <strong>Course Assignment: CA-03</strong>
              <div className="student-id">Roll / Reg No: 25070521210</div>
            </div>
          </div>

          {/* Quick Categories */}
          <div className="footer-col">
            <h4 className="footer-heading">Product Catalog</h4>
            <ul className="footer-links">
              <li><Link to="/products?category=AI Models">AI Models & Weights</Link></li>
              <li><Link to="/products?category=Cloud Storage">Cloud Storage & S3</Link></li>
              <li><Link to="/products?category=Servers & VPS">Servers & VPS Nodes</Link></li>
              <li><Link to="/products?category=Cloud Servers">Cloud Instances</Link></li>
              <li><Link to="/products?category=GPU for Training">GPU Training Clusters</Link></li>
              <li><Link to="/products?category=Kali Linux & Security Tools">Kali & Security Hardware</Link></li>
              <li><Link to="/products?category=Books">Developer & ML Books</Link></li>
            </ul>
          </div>

          {/* Platform & Account */}
          <div className="footer-col">
            <h4 className="footer-heading">Customer Center</h4>
            <ul className="footer-links">
              <li><Link to="/cart">Shopping Cart</Link></li>
              <li><Link to="/my-orders">Track Orders</Link></li>
              <li><Link to="/login">Developer Sign In</Link></li>
              <li><Link to="/signup">Register Account</Link></li>
              <li><span className="footer-text-muted">Instant API Key Delivery</span></li>
              <li><span className="footer-text-muted">99.99% Uptime SLA</span></li>
            </ul>
          </div>

          {/* Tech Stack Details for Viva */}
          <div className="footer-col tech-col">
            <h4 className="footer-heading">Architecture & Stack</h4>
            <div className="tech-tags">
              <span className="tech-tag">React 18</span>
              <span className="tech-tag">Vite</span>
              <span className="tech-tag">Plain CSS</span>
              <span className="tech-tag">Node.js</span>
              <span className="tech-tag">Express</span>
              <span className="tech-tag">MongoDB</span>
              <span className="tech-tag">Mongoose</span>
              <span className="tech-tag">JWT Auth</span>
              <span className="tech-tag">UPI QR Engine</span>
            </div>
            <p className="viva-note">
              Full-Stack MERN Architecture with persistent database synchronization, UPI QR generation, and activity-driven recommendation engine.
            </p>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-container">
          <p>© {new Date().getFullYear()} DevStore. Built for Developers, by Developers.</p>
          <p className="footer-credit">College Assignment Submission • 25070521210-CA-03</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

