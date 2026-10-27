/**
 * ProductCard Component
 * Displays product preview card with responsive image, pricing in INR, rating, stock status,
 * and quick add-to-cart interaction.
 */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const [adding, setAdding] = useState(false);

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setAdding(true);
    addToCart(product, 1);
    setTimeout(() => setAdding(false), 800);
  };

  const formattedPrice = Number(product.price).toLocaleString('en-IN');

  return (
    <div className="product-card">
      <Link to={`/products/${product._id}`} className="product-card-link">
        {/* Product Image */}
        <div className="product-image-container">
          <img
            src={product.image}
            alt={product.name}
            className="product-card-image"
            loading="lazy"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80';
            }}
          />
          <span className="product-category-badge">{product.category}</span>
          {product.featured && <span className="product-featured-badge">Featured</span>}
        </div>

        {/* Product Info */}
        <div className="product-card-body">
          {product.subCategory && (
            <span className="product-subcategory">{product.subCategory}</span>
          )}
          <h3 className="product-title" title={product.name}>
            {product.name}
          </h3>

          <div className="product-rating">
            <span className="star-icon">★</span>
            <span className="rating-value">{product.rating ? product.rating.toFixed(1) : '4.8'}</span>
            <span className="stock-indicator">
              {product.stock > 10 ? (
                <span className="in-stock">● In Stock ({product.stock})</span>
              ) : (
                <span className="low-stock">● Only {product.stock} left</span>
              )}
            </span>
          </div>

          <div className="product-card-footer">
            <div className="product-price">
              <span className="currency-symbol">₹</span>
              <span className="price-number">{formattedPrice}</span>
            </div>

            <button
              className={`btn-add-cart ${adding ? 'added' : ''}`}
              onClick={handleAdd}
              disabled={adding || product.stock === 0}
              title="Add to cart"
            >
              {adding ? '✓ Added' : '+ Add'}
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;

