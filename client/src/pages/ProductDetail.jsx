/**
 * ProductDetail Page
 * Displays full item specifications, high-resolution preview, quantity controls,
 * instant add-to-cart actions, and activity tracking for recommendation intelligence.
 */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';
import '../styles/productDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [addedNotice, setAddedNotice] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/products/${id}`);
        if (res.data.success) {
          const item = res.data.product;
          setProduct(item);
          setRelatedProducts(res.data.relatedProducts || []);
          setQuantity(1);

          // Log view activity for personalized recommendation engine
          api.post('/activity', {
            type: 'view',
            productId: item._id,
            category: item.category
          }).catch(() => {});
        }
      } catch (error) {
        console.error('Failed to load product details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  const handleQuantityChange = (delta) => {
    setQuantity((prev) => {
      const next = prev + delta;
      if (next < 1) return 1;
      if (product && next > product.stock) return product.stock;
      return next;
    });
  };

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, quantity);
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 2000);
  };

  const handleBuyNow = () => {
    if (!product) return;
    addToCart(product, quantity);
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="product-detail-loading">
        <div className="spinner"></div>
        <p>Loading technical specifications...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-not-found">
        <h2>Product Not Found</h2>
        <p>The developer tool or resource you are looking for is unavailable.</p>
        <Link to="/products" className="btn btn-primary">
          Back to Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="product-detail-page">
      <div className="detail-container">
        {/* Breadcrumb Navigation */}
        <nav className="detail-breadcrumbs">
          <Link to="/">Home</Link>
          <span className="crumb-sep">/</span>
          <Link to={`/products?category=${encodeURIComponent(product.category)}`}>
            {product.category}
          </Link>
          <span className="crumb-sep">/</span>
          <span className="crumb-current">{product.name}</span>
        </nav>

        {/* Product Hero Layout */}
        <div className="product-main-layout">
          {/* Left Column: Image Preview */}
          <div className="product-media-column">
            <div className="detail-image-box">
              <img
                src={product.image}
                alt={product.name}
                className="detail-large-image"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80';
                }}
              />
              <span className="detail-category-tag">{product.category}</span>
            </div>

            {/* Quick Guarantees */}
            <div className="detail-trust-badges">
              <div className="trust-item">
                <span className="trust-icon">⚡</span>
                <div>
                  <strong>Instant Delivery</strong>
                  <p>API keys and credentials provisioned automatically</p>
                </div>
              </div>
              <div className="trust-item">
                <span className="trust-icon">🛡️</span>
                <div>
                  <strong>Enterprise SLA</strong>
                  <p>99.99% high-availability guarantee</p>
                </div>
              </div>
              <div className="trust-item">
                <span className="trust-icon">🔄</span>
                <div>
                  <strong>7-Day Dev Warranty</strong>
                  <p>Technical support & configuration assistance</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Info, Pricing & Actions */}
          <div className="product-info-column">
            {product.subCategory && (
              <span className="subcategory-badge">{product.subCategory}</span>
            )}
            <h1 className="detail-product-title">{product.name}</h1>

            <div className="detail-meta-row">
              <div className="detail-rating">
                <span className="star-icon">★</span>
                <span className="rating-score">{product.rating ? product.rating.toFixed(1) : '4.8'}</span>
                <span className="rating-reviews">(Verified Developers)</span>
              </div>
              <span className="meta-divider">•</span>
              <div className="detail-stock">
                {product.stock > 0 ? (
                  <span className="stock-badge in-stock">
                    ● In Stock ({product.stock} units available)
                  </span>
                ) : (
                  <span className="stock-badge out-stock">● Currently Out of Stock</span>
                )}
              </div>
            </div>

            <hr className="detail-divider" />

            {/* Price Block */}
            <div className="detail-price-box">
              <span className="detail-price-label">Price:</span>
              <div className="detail-price-val">
                <span className="currency-sign">₹</span>
                <span className="price-digits">
                  {Number(product.price).toLocaleString('en-IN')}
                </span>
                <span className="tax-inclusive">(All taxes included)</span>
              </div>
            </div>

            {/* Description */}
            <div className="detail-description-section">
              <h3 className="section-label">Overview & Details</h3>
              <p className="detail-description-text">{product.description}</p>
            </div>

            {/* Tags / Badges */}
            {product.tags && product.tags.length > 0 && (
              <div className="detail-tags-section">
                <span className="tags-label">Keywords:</span>
                <div className="tags-container">
                  {product.tags.map((tag) => (
                    <span key={tag} className="tag-pill">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <hr className="detail-divider" />

            {/* Quantity Selector & Action Buttons */}
            {product.stock > 0 ? (
              <div className="purchase-controls">
                <div className="quantity-wrapper">
                  <span className="qty-label">Quantity:</span>
                  <div className="quantity-selector">
                    <button
                      className="qty-btn"
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                    >
                      -
                    </button>
                    <span className="qty-number">{quantity}</span>
                    <button
                      className="qty-btn"
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= product.stock}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="detail-action-buttons">
                  <button
                    className={`btn btn-primary btn-lg add-cart-btn ${addedNotice ? 'btn-success' : ''}`}
                    onClick={handleAddToCart}
                  >
                    {addedNotice ? '✓ Added to Cart!' : '🛒 Add to Cart'}
                  </button>
                  <button
                    className="btn btn-outline btn-lg buy-now-btn"
                    onClick={handleBuyNow}
                  >
                    ⚡ Buy Now
                  </button>
                </div>
              </div>
            ) : (
              <div className="out-of-stock-alert">
                This item is temporarily out of stock. Check back soon!
              </div>
            )}
          </div>
        </div>

        {/* Related Products in this category */}
        {relatedProducts.length > 0 && (
          <div className="related-products-section">
            <h2 className="related-title">Related {product.category} Tools</h2>
            <div className="products-grid">
              {relatedProducts.map((rel) => (
                <ProductCard key={rel._id} product={rel} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;

