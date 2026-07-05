import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { productsAPI } from "../api";
import "./SearchBar.css";

export default function SearchBar({ onClose }) {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const [hasSearched, setHasSearched] = useState(false);

  // Auto-focus on open
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    const timer = setTimeout(() => {
      performSearch(query.trim());
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const performSearch = async (searchTerm) => {
    setLoading(true);
    setHasSearched(true);
    
    try {
      // Fetch all products (or use search endpoint if available)
      const res = await productsAPI.getAll({ page: 1, pageSize: 100 });
      const allProducts = res.data?.items || [];
      
      // Filter on the client side
      const filtered = allProducts.filter(p => {
        const search = searchTerm.toLowerCase();
        return (
          p.name?.toLowerCase().includes(search) ||
          p.description?.toLowerCase().includes(search) ||
          p.category?.toLowerCase().includes(search)
        );
      });
      
      setResults(filtered.slice(0, 6)); // Show top 6 results
      setHighlighted(-1);
    } catch (err) {
      console.error("Search failed:", err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        onClose?.();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  // Keyboard shortcuts
  const handleKeyDown = useCallback((e) => {
    if (e.key === "Escape") {
      onClose?.();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted(prev => Math.min(prev + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted(prev => Math.max(prev - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlighted >= 0 && results[highlighted]) {
        handleSelectProduct(results[highlighted]);
      } else if (query.trim()) {
        handleViewAll();
      }
    }
  }, [highlighted, results, query]);

  const handleSelectProduct = (product) => {
    navigate(`/products/${product.id}`);
    onClose?.();
  };

  const handleViewAll = () => {
    navigate(`/products?search=${encodeURIComponent(query)}`);
    onClose?.();
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setHasSearched(false);
    inputRef.current?.focus();
  };

  return (
    <div className="nl-search-overlay" onKeyDown={handleKeyDown}>
      <div className="nl-search-container" ref={containerRef}>
        {/* Search Input */}
        <div className="nl-search-input-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22" className="nl-search-input-icon">
            <circle cx="11" cy="11" r="8"/>
            <path d="M21 21l-4.35-4.35"/>
          </svg>
          
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for hijabs, abayas, accessories..."
            className="nl-search-input"
            autoComplete="off"
          />
          
          {query && (
            <button
              type="button"
              className="nl-search-clear"
              onClick={handleClear}
              aria-label="Clear search"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          )}

          <button
            type="button"
            className="nl-search-close"
            onClick={onClose}
            aria-label="Close search"
          >
            <span>ESC</span>
          </button>
        </div>

        {/* Results Dropdown */}
        {(query.trim() || hasSearched) && (
          <div className="nl-search-results">
            {loading ? (
              <div className="nl-search-loading">
                <div className="nl-search-spinner"></div>
                <span>Searching...</span>
              </div>
            ) : results.length === 0 && hasSearched ? (
              <div className="nl-search-empty">
                <div className="nl-search-empty__icon">🔍</div>
                <h4>No results found</h4>
                <p>Try a different search term</p>
                <div className="nl-search-suggestions">
                  <span>Try:</span>
                  {["Hijab", "Abaya", "Gift Box"].map(s => (
                    <button
                      key={s}
                      className="nl-search-suggestion"
                      onClick={() => setQuery(s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                <div className="nl-search-results-list">
                  {results.map((product, i) => {
                    const id = product.id;
                    const name = product.name || "Product";
                    const price = Number(product.finalPrice || product.originalPrice || 0);
                    const image = product.frontImageUrl || "/product1.png";
                    const category = product.category || "";
                    const isHighlighted = highlighted === i;

                    return (
                      <div
                        key={id}
                        className={`nl-search-result ${isHighlighted ? "highlighted" : ""}`}
                        onClick={() => handleSelectProduct(product)}
                        onMouseEnter={() => setHighlighted(i)}
                      >
                        <img
                          src={image}
                          alt={name}
                          onError={(e) => { e.target.src = "/product1.png"; }}
                        />
                        <div className="nl-search-result__info">
                          <div className="nl-search-result__name">{name}</div>
                          {category && (
                            <div className="nl-search-result__cat">{category}</div>
                          )}
                        </div>
                        <div className="nl-search-result__price">
                          ₦{price.toLocaleString()}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button className="nl-search-view-all" onClick={handleViewAll}>
                  View all {results.length} result{results.length !== 1 ? "s" : ""} for "{query}"
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                    <line x1="5" y1="12" x2="19" y2="12"/>
                    <polyline points="12 5 19 12 12 19"/>
                  </svg>
                </button>
              </>
            )}
          </div>
        )}

        {/* Initial state — Popular searches */}
        {!query.trim() && !hasSearched && (
          <div className="nl-search-popular">
            <div className="nl-search-popular__title">Popular Searches</div>
            <div className="nl-search-popular__tags">
              {["Chiffon Hijab", "Abaya", "Jersey Set", "Gift Box", "New Arrivals"].map(s => (
                <button
                  key={s}
                  className="nl-search-popular__tag"
                  onClick={() => setQuery(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}