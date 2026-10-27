/**
 * SearchBar Component
 * Provides live auto-suggestions dropdown, keyboard navigation, and activity logging on search query submission.
 */
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const SearchBar = ({ onSearchSubmit }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  // Debounced fetch suggestions
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await api.get(`/products/suggestions?q=${encodeURIComponent(query.trim())}`);
        if (res.data.success) {
          setSuggestions(res.data.suggestions || []);
          setShowSuggestions(true);
        }
      } catch (err) {
        console.error('Failed to fetch search suggestions', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    // Log search activity to backend for recommendations
    try {
      api.post('/activity', {
        type: 'search',
        searchQuery: query.trim()
      }).catch(() => {});
    } catch (err) {}

    setShowSuggestions(false);
    if (onSearchSubmit) onSearchSubmit();
    navigate(`/products?search=${encodeURIComponent(query.trim())}`);
  };

  const handleSuggestionClick = (item) => {
    setShowSuggestions(false);
    setQuery('');
    if (onSearchSubmit) onSearchSubmit();
    navigate(`/products/${item._id}`);
  };

  return (
    <div className="search-bar-wrapper" ref={searchRef}>
      <form onSubmit={handleSearch} className="search-form">
        <span className="search-input-icon">🔍</span>
        <input
          type="text"
          className="search-input"
          placeholder="Search AI weights, VPS, GPUs, Kali tools, books..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (suggestions.length > 0) setShowSuggestions(true);
          }}
        />
        {query && (
          <button
            type="button"
            className="search-clear-btn"
            onClick={() => {
              setQuery('');
              setSuggestions([]);
            }}
          >
            ✕
          </button>
        )}
        <button type="submit" className="search-submit-btn">
          Search
        </button>
      </form>

      {/* Auto-suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="search-suggestions-dropdown">
          <div className="suggestions-header">Quick Results</div>
          {suggestions.map((item) => (
            <div
              key={item._id}
              className="suggestion-item"
              onClick={() => handleSuggestionClick(item)}
            >
              <img
                src={item.image}
                alt={item.name}
                className="suggestion-thumb"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=100&q=80';
                }}
              />
              <div className="suggestion-info">
                <span className="suggestion-name">{item.name}</span>
                <div className="suggestion-meta">
                  <span className="suggestion-category">{item.category}</span>
                  <span className="suggestion-price">₹{item.price.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          ))}
          <div
            className="suggestion-footer"
            onClick={handleSearch}
          >
            View all results for "{query}" →
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;

