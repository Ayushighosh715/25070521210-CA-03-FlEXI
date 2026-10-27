/**
 * CategoryFilter Component
 * Sidebar filter control offering category switching, price range boundary limits,
 * sorting criteria, and filter clearing.
 */
import React from 'react';

const CATEGORIES = [
  'All',
  'AI Models',
  'Cloud Storage',
  'Servers & VPS',
  'Cloud Servers',
  'GPU for Training',
  'Kali Linux & Security Tools',
  'Books'
];

const CategoryFilter = ({
  selectedCategory,
  onSelectCategory,
  minPrice,
  maxPrice,
  onMinPriceChange,
  onMaxPriceChange,
  onApplyPriceFilter,
  sortBy,
  onSortChange,
  onResetFilters
}) => {
  return (
    <aside className="filters-sidebar">
      <div className="filter-header">
        <h3 className="filter-title">Filters</h3>
        <button className="filter-reset-link" onClick={onResetFilters}>
          Reset All
        </button>
      </div>

      {/* Sort By Dropdown */}
      <div className="filter-section">
        <label className="filter-label">Sort Products By</label>
        <select
          className="filter-select"
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
        >
          <option value="newest">✨ Newest Releases</option>
          <option value="price-asc">💸 Price: Low to High</option>
          <option value="price-desc">💎 Price: High to Low</option>
          <option value="rating">⭐ Highest Rated</option>
        </select>
      </div>

      {/* Categories List */}
      <div className="filter-section">
        <label className="filter-label">Categories</label>
        <div className="category-options-list">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`cat-filter-btn ${
                (selectedCategory === cat || (!selectedCategory && cat === 'All'))
                  ? 'active'
                  : ''
              }`}
              onClick={() => onSelectCategory(cat === 'All' ? '' : cat)}
            >
              <span className="cat-bullet">▪</span>
              <span className="cat-name">{cat === 'All' ? 'All Products' : cat}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Price Range Filter */}
      <div className="filter-section">
        <label className="filter-label">Price Range (₹ INR)</label>
        <div className="price-inputs-row">
          <div className="price-input-group">
            <span className="price-prefix">₹</span>
            <input
              type="number"
              className="price-number-input"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => onMinPriceChange(e.target.value)}
              min="0"
            />
          </div>
          <span className="price-separator">-</span>
          <div className="price-input-group">
            <span className="price-prefix">₹</span>
            <input
              type="number"
              className="price-number-input"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => onMaxPriceChange(e.target.value)}
              min="0"
            />
          </div>
        </div>
        <button
          className="btn btn-outline btn-block price-apply-btn"
          onClick={onApplyPriceFilter}
        >
          Apply Price
        </button>
      </div>
    </aside>
  );
};

export default CategoryFilter;

