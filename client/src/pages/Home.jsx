/**
 * Home Page
 * Main landing page featuring interactive hero banner, category cards,
 * activity-based "Recommended for You" section, Featured products, and Trending developer gear.
 */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';
import '../styles/home.css';

const CATEGORIES_DATA = [
  { name: 'AI Models', icon: '🧠', desc: 'Fine-tuned weights, API tokens & datasets' },
  { name: 'Cloud Storage', icon: '💾', desc: 'S3 buckets, database vaults & block NVMe' },
  { name: 'Servers & VPS', icon: '🖥️', desc: 'High-frequency VPS & bare-metal servers' },
  { name: 'Cloud Servers', icon: '☁️', desc: 'AWS, Azure & GCP scalable compute' },
  { name: 'GPU for Training', icon: '⚡', desc: 'RTX 4090, A100 & H100 compute nodes' },
  { name: 'Kali Linux & Security Tools', icon: '🛡️', desc: 'Pentest labs, Flipper Zero & Kali VPS' },
  { name: 'Books', icon: '📚', desc: 'Software engineering, ML, Python & Cloud' }
];

const Home = () => {
  const [featured, setFeatured] = useState([]);
  const [trending, setTrending] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);

        // Fetch highlights (featured & trending)
        const highlightsRes = await api.get('/products/highlights');
        if (highlightsRes.data.success) {
          setFeatured(highlightsRes.data.featured || []);
          setTrending(highlightsRes.data.trending || []);
        }

        // Fetch smart recommendations based on user history or trending fallback
        const recsRes = await api.get('/activity/recommendations');
        if (recsRes.data.success) {
          setRecommendations(recsRes.data.recommendations || []);
        }
      } catch (error) {
        console.error('Failed to load home page products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-pill">
            <span className="pill-dot">●</span> 210+ Developer Tools & Cloud Resources in Stock
          </div>
          <h1 className="hero-title">
            Equip Your <span className="gradient-text">Developer Arsenal</span>
          </h1>
          <p className="hero-description">
            The dedicated e-commerce hub for programmers, DevOps engineers, and AI researchers.
            Deploy VPS instances, rent H100 GPUs, buy model weights, and master clean code.
          </p>
          <div className="hero-cta-group">
            <Link to="/products" className="btn btn-primary btn-lg">
              Explore All Products →
            </Link>
            <Link to="/products?category=GPU for Training" className="btn btn-outline btn-lg">
              Browse GPU Clusters ⚡
            </Link>
          </div>

          {/* Quick Metrics Bar */}
          <div className="hero-metrics">
            <div className="metric-item">
              <span className="metric-val">210+</span>
              <span className="metric-label">Developer Products</span>
            </div>
            <div className="metric-divider"></div>
            <div className="metric-item">
              <span className="metric-val">Instant</span>
              <span className="metric-label">Key Provisioning</span>
            </div>
            <div className="metric-divider"></div>
            <div className="metric-item">
              <span className="metric-val">99.99%</span>
              <span className="metric-label">Uptime Architecture</span>
            </div>
            <div className="metric-divider"></div>
            <div className="metric-item">
              <span className="metric-val">UPI & COD</span>
              <span className="metric-label">Instant Checkout</span>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="section-container">
        <div className="section-header">
          <div>
            <h2 className="section-title">Browse by Category</h2>
            <p className="section-subtitle">Targeted infrastructure and developer essentials</p>
          </div>
          <Link to="/products" className="view-all-link">
            View All Categories →
          </Link>
        </div>

        <div className="category-cards-grid">
          {CATEGORIES_DATA.map((cat) => (
            <Link
              key={cat.name}
              to={`/products?category=${encodeURIComponent(cat.name)}`}
              className="category-card"
            >
              <div className="category-card-icon">{cat.icon}</div>
              <h3 className="category-card-title">{cat.name}</h3>
              <p className="category-card-desc">{cat.desc}</p>
              <span className="category-card-arrow">Explore →</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Recommended for You Section (Activity Driven) */}
      <section className="section-container recommendations-section">
        <div className="section-header">
          <div>
            <div className="recommendation-badge">
              <span>🎯</span> Personalized For You
            </div>
            <h2 className="section-title">Recommended for You</h2>
            <p className="section-subtitle">
              Intelligent suggestions tuned to your recent searches and viewed tools
            </p>
          </div>
        </div>

        {loading ? (
          <div className="loading-state">Loading personalized recommendations...</div>
        ) : recommendations.length > 0 ? (
          <div className="products-grid">
            {recommendations.slice(0, 4).map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <p className="empty-state">Browse products to see personalized recommendations!</p>
        )}
      </section>

      {/* Featured Products */}
      <section className="section-container">
        <div className="section-header">
          <div>
            <h2 className="section-title">Featured Developer Hardware & Software</h2>
            <p className="section-subtitle">Hand-picked gear and cloud instances for serious builders</p>
          </div>
          <Link to="/products" className="view-all-link">
            See More →
          </Link>
        </div>

        {loading ? (
          <div className="loading-state">Loading featured products...</div>
        ) : (
          <div className="products-grid">
            {featured.slice(0, 8).map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Developer Perks Banner */}
      <section className="perks-strip">
        <div className="perk-box">
          <span className="perk-icon">⚡</span>
          <h4>Instant Provisioning</h4>
          <p>Cloud instances, API keys, and model download credentials issued automatically.</p>
        </div>
        <div className="perk-box">
          <span className="perk-icon">🔒</span>
          <h4>Encrypted & Private</h4>
          <p>End-to-end security audits with isolated tenant VPCs and zero logging policies.</p>
        </div>
        <div className="perk-box">
          <span className="perk-icon">💳</span>
          <h4>Flexible Payments</h4>
          <p>Checkout instantly via standard UPI QR code or choose Cash on Delivery (COD).</p>
        </div>
        <div className="perk-box">
          <span className="perk-icon">👨‍💻</span>
          <h4>Developer Support</h4>
          <p>Direct assistance from Linux system engineers and machine learning practitioners.</p>
        </div>
      </section>

      {/* Trending This Week */}
      <section className="section-container">
        <div className="section-header">
          <div>
            <h2 className="section-title">Trending This Week</h2>
            <p className="section-subtitle">Top-performing compute nodes and developer gear right now</p>
          </div>
          <Link to="/products" className="view-all-link">
            Explore All Trending →
          </Link>
        </div>

        {loading ? (
          <div className="loading-state">Loading trending products...</div>
        ) : (
          <div className="products-grid">
            {trending.slice(0, 8).map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;

