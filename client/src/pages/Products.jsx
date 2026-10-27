/**
 * Products Catalog Page
 * Full multi-criteria product directory featuring category filters, price boundary inputs,
 * sorting selector, responsive grid, and pagination.
 */
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';
import CategoryFilter from '../components/CategoryFilter';
import '../styles/products.css';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Read query parameters from URL
  const currentCategory = searchParams.get('category') || '';
  const currentSearch = searchParams.get('search') || '';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const currentSort = searchParams.get('sort') || 'newest';
  const currentMinPrice = searchParams.get('minPrice') || '';
  const currentMaxPrice = searchParams.get('maxPrice') || '';

  // Local state for price inputs before applying
  const [minPriceInput, setMinPriceInput] = useState(currentMinPrice);
  const [maxPriceInput, setMaxPriceInput] = useState(currentMaxPrice);

  const [products, setProducts] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch products whenever search params change
  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        setLoading(true);

        const params = new URLSearchParams();
        if (currentCategory && currentCategory !== 'All') params.append('category', currentCategory);
        if (currentSearch) params.append('search', currentSearch);
        if (currentSort) params.append('sort', currentSort);
        if (currentMinPrice) params.append('minPrice', currentMinPrice);
        if (currentMaxPrice) params.append('maxPrice', currentMaxPrice);
        params.append('page', currentPage.toString());
        params.append('limit', '12');

        const res = await api.get(`/products?${params.toString()}`);
        if (res.data.success) {
          setProducts(res.data.products || []);
          setTotalPages(res.data.totalPages || 1);
          setTotalProducts(res.data.total || 0);
        }
      } catch (error) {
        console.error('Failed to fetch catalog products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCatalog();
  }, [currentCategory, currentSearch, currentPage, currentSort, currentMinPrice, currentMaxPrice]);

  // Update a specific URL param while keeping others
  const updateParam = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    // Reset to page 1 whenever filters change
    if (key !== 'page') {
      newParams.set('page', '1');
    }
    setSearchParams(newParams);
  };

  const handleCategorySelect = (category) => {
    updateParam('category', category);
  };

  const handleSortChange = (sortOption) => {
    updateParam('sort', sortOption);
  };

  const handleApplyPrice = () => {
    const newParams = new URLSearchParams(searchParams);
    if (minPriceInput) newParams.set('minPrice', minPriceInput);
    else newParams.delete('minPrice');

    if (maxPriceInput) newParams.set('maxPrice', maxPriceInput);
    else newParams.delete('maxPrice');

    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handleResetFilters = () => {
    setMinPriceInput('');
    setMaxPriceInput('');
    setSearchParams({});
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    updateParam('page', newPage.toString());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="products-page">
      <div className="catalog-container">
        {/* Sidebar Filters */}
        <CategoryFilter
          selectedCategory={currentCategory}
          onSelectCategory={handleCategorySelect}
          minPrice={minPriceInput}
          maxPrice={maxPriceInput}
          onMinPriceChange={setMinPriceInput}
          onMaxPriceChange={setMaxPriceInput}
          onApplyPriceFilter={handleApplyPrice}
          sortBy={currentSort}
          onSortChange={handleSortChange}
          onResetFilters={handleResetFilters}
        />

        {/* Catalog Main Content */}
        <main className="catalog-main">
          {/* Active Filter Chips & Results Summary */}
          <div className="catalog-toolbar">
            <div className="catalog-results-info">
              <h2 className="catalog-title">
                {currentCategory ? currentCategory : currentSearch ? `Results for "${currentSearch}"` : 'All Developer Products'}
              </h2>
              <span className="results-count">
                Showing {products.length} of {totalProducts} products
              </span>
            </div>

            {/* Active Filters Display */}
            {(currentCategory || currentSearch || currentMinPrice || currentMaxPrice) && (
              <div className="active-filter-chips">
                {currentCategory && (
                  <span className="filter-chip">
                    Category: {currentCategory}
                    <button onClick={() => updateParam('category', '')}>✕</button>
                  </span>
                )}
                {currentSearch && (
                  <span className="filter-chip">
                    Query: "{currentSearch}"
                    <button onClick={() => updateParam('search', '')}>✕</button>
                  </span>
                )}
                {(currentMinPrice || currentMaxPrice) && (
                  <span className="filter-chip">
                    Price: ₹{currentMinPrice || '0'} - ₹{currentMaxPrice || '∞'}
                    <button onClick={() => {
                      setMinPriceInput('');
                      setMaxPriceInput('');
                      updateParam('minPrice', '');
                      updateParam('maxPrice', '');
                    }}>✕</button>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="loading-grid">
              <div className="spinner"></div>
              <p>Scanning product catalog...</p>
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="products-grid">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    className="page-nav-btn"
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                  >
                    ← Previous
                  </button>

                  <div className="page-numbers">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                      <button
                        key={pageNum}
                        className={`page-number-btn ${currentPage === pageNum ? 'active' : ''}`}
                        onClick={() => handlePageChange(pageNum)}
                      >
                        {pageNum}
                      </button>
                    ))}
                  </div>

                  <button
                    className="page-nav-btn"
                    disabled={currentPage === totalPages}
                    onClick={() => handlePageChange(currentPage + 1)}
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="empty-catalog-state">
              <span className="empty-icon">🔎</span>
              <h3>No products found matching your criteria</h3>
              <p>Try clearing your price filters, searching for broader terms, or choosing a different category.</p>
              <button className="btn btn-primary" onClick={handleResetFilters}>
                Reset All Filters
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Products;

