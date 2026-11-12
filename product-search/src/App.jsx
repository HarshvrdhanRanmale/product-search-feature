import { useEffect, useMemo, useState, useCallback } from "react";
import "./App.css";

const money = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

/* ── tiny SVG icons (inline so no extra deps) ── */
const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const CartIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);

const StarIcon = ({ filled }) => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill={filled ? "#f59e0b" : "none"} stroke="#f59e0b" strokeWidth="2">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const FilterIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);

const XIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const HeartIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

/* ── Rating stars component ── */
function Rating({ value = 4.2, count = 128 }) {
  return (
    <span className="rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <StarIcon key={star} filled={star <= Math.round(value)} />
      ))}
      <span className="rating-count">({count})</span>
    </span>
  );
}

/* ── Skeleton loading card ── */
function SkeletonCard() {
  return (
    <article className="product-card skeleton-card">
      <div className="product-art skeleton-art">
        <div className="skeleton-pulse" />
      </div>
      <div className="product-info">
        <div className="skeleton-line skeleton-line-sm" />
        <div className="skeleton-line skeleton-line-md" />
        <div className="skeleton-line skeleton-line-lg" />
        <div className="skeleton-line skeleton-line-sm" />
      </div>
    </article>
  );
}

/* ── Active filter pill ── */
function FilterPill({ label, onClear }) {
  return (
    <span className="filter-pill">
      {label}
      <button onClick={onClear} aria-label={`Remove filter: ${label}`}>
        <XIcon />
      </button>
    </span>
  );
}

/* ── Fake ratings/reviews for demo ── */
const ratings = {
  1: { stars: 4.5, count: 312 },
  2: { stars: 4.2, count: 187 },
  3: { stars: 4.8, count: 94 },
  4: { stars: 4.1, count: 256 },
  5: { stars: 4.6, count: 441 },
  6: { stars: 4.3, count: 63 },
};

function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("featured");
  const [wishlist, setWishlist] = useState(new Set());
  const [addedToCart, setAddedToCart] = useState(null);

  useEffect(() => {
    let ignore = false;

    async function loadProducts() {
      try {
        const response = await fetch("/api/products");

        if (!response.ok) {
          throw new Error(`Could not load products (${response.status})`);
        }

        const data = await response.json();

        if (!ignore) {
          setProducts(data);
        }
      } catch (loadError) {
        if (!ignore) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Could not load products."
          );
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      ignore = true;
    };
  }, []);

  const visibleProducts = useMemo(() => {
    const term = search.trim().toLowerCase();

    return products
      .filter((product) => {
        const matchesSearch =
          !term ||
          product.name.toLowerCase().includes(term) ||
          product.category.toLowerCase().includes(term);
        const matchesCategory =
          category === "All" || product.category === category;
        const matchesMin =
          minPrice === "" || product.price >= Number(minPrice);
        const matchesMax =
          maxPrice === "" || product.price <= Number(maxPrice);

        return matchesSearch && matchesCategory && matchesMin && matchesMax;
      })
      .sort((a, b) => {
        if (sort === "low") return a.price - b.price;
        if (sort === "high") return b.price - a.price;
        return a.id - b.id;
      });
  }, [products, search, category, minPrice, maxPrice, sort]);

  const activeFilters = useMemo(() => {
    const filters = [];
    if (category !== "All") filters.push({ key: "category", label: category });
    if (minPrice) filters.push({ key: "min", label: `Min: ₹${minPrice}` });
    if (maxPrice) filters.push({ key: "max", label: `Max: ₹${maxPrice}` });
    if (sort !== "featured") filters.push({ key: "sort", label: sort === "low" ? "Price ↑" : "Price ↓" });
    return filters;
  }, [category, minPrice, maxPrice, sort]);

  function clearFilters() {
    setSearch("");
    setCategory("All");
    setMinPrice("");
    setMaxPrice("");
    setSort("featured");
  }

  function removeFilter(key) {
    if (key === "category") setCategory("All");
    if (key === "min") setMinPrice("");
    if (key === "max") setMaxPrice("");
    if (key === "sort") setSort("featured");
  }

  const toggleWishlist = useCallback((id) => {
    setWishlist((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleAddToCart = useCallback((id) => {
    setAddedToCart(id);
    setTimeout(() => setAddedToCart(null), 1500);
  }, []);

  const categories = useMemo(() => {
    const cats = new Set(products.map((p) => p.category));
    return ["All", ...Array.from(cats).sort()];
  }, [products]);

  return (
    <main className="store">
      {/* ── Top bar ── */}
      <header className="topbar">
        <a className="brand" href="/" aria-label="Little Market home">
          <span className="brand-mark">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
          </span>
          <span className="brand-text">little market</span>
        </a>

        <nav className="topbar-nav">
          <span className="nav-link active">Shop</span>
          <span className="nav-link">Collections</span>
          <span className="nav-link">About</span>
        </nav>

        <div className="topbar-actions">
          <span className="demo-label">PRODUCT SEARCH DEMO</span>
        </div>
      </header>

      {/* ── Hero section ── */}
      <section className="hero">
        <div className="hero-content">
          <span className="hero-badge">🔥 New arrivals</span>
          <h1>
            Find your next<br />
            <span className="hero-accent">favorite.</span>
          </h1>
          <p className="hero-copy">
            Browse our curated collection and use the filters below to discover just the right thing for you.
          </p>

          <div className="hero-stats">
            <div className="stat">
              <strong>200+</strong>
              <span>Products</span>
            </div>
            <div className="stat-divider" />
            <div className="stat">
              <strong>50+</strong>
              <span>Brands</span>
            </div>
            <div className="stat-divider" />
            <div className="stat">
              <strong>4.8★</strong>
              <span>Rating</span>
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-float hero-float-1">🎧</div>
          <div className="hero-float hero-float-2">⌚</div>
          <div className="hero-float hero-float-3">☕</div>
          <div className="hero-card">
            <div className="hero-card-inner">
              <span className="hero-card-emoji">🛍️</span>
              <p>Shop the latest trends</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Filter toolbar ── */}
      <section className="toolbar" aria-label="Product filters">
        <div className="toolbar-row">
          <label className="search-field">
            <span className="search-icon"><SearchIcon /></span>
            <input
              type="search"
              placeholder="Search products or categories…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search products or categories"
            />
          </label>

          <label className="control">
            <span>Category</span>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              {categories.map((cat) => (
                <option key={cat}>{cat}</option>
              ))}
            </select>
          </label>

          <label className="control price-control">
            <span>Min price (₹)</span>
            <input
              type="number"
              min="0"
              placeholder="0"
              value={minPrice}
              onChange={(event) => setMinPrice(event.target.value)}
            />
          </label>

          <label className="control price-control">
            <span>Max price (₹)</span>
            <input
              type="number"
              min="0"
              placeholder="Any"
              value={maxPrice}
              onChange={(event) => setMaxPrice(event.target.value)}
            />
          </label>

          <label className="control sort-control">
            <span>Sort by</span>
            <select value={sort} onChange={(event) => setSort(event.target.value)}>
              <option value="featured">Featured</option>
              <option value="low">Price: low → high</option>
              <option value="high">Price: high → low</option>
            </select>
          </label>
        </div>

        {activeFilters.length > 0 && (
          <div className="active-filters">
            <FilterIcon />
            {activeFilters.map((f) => (
              <FilterPill key={f.key} label={f.label} onClear={() => removeFilter(f.key)} />
            ))}
            <button className="clear-all-btn" onClick={clearFilters}>
              Clear all
            </button>
          </div>
        )}
      </section>

      {/* ── Results ── */}
      <section className="results">
        <div className="results-heading">
          <p>
            Showing <strong>{visibleProducts.length}</strong>{" "}
            {visibleProducts.length === 1 ? "item" : "items"}
          </p>
          {(search || activeFilters.length > 0) && (
            <button className="clear-button" onClick={clearFilters}>
              Reset all filters
            </button>
          )}
        </div>

        {loading ? (
          <div className="product-grid">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <SkeletonCard key={n} />
            ))}
          </div>
        ) : error ? (
          <div className="error-state" role="alert">
            <span className="error-icon">⚠️</span>
            <h2>Something went wrong</h2>
            <p>{error}</p>
            <button className="reset-button" onClick={() => window.location.reload()}>
              Try again
            </button>
          </div>
        ) : visibleProducts.length > 0 ? (
          <div className="product-grid">
            {visibleProducts.map((product) => (
              <article className="product-card" key={product.id}>
                <div
                  className={`product-art ${product.color}`}
                  aria-hidden="true"
                >
                  <button
                    className={`wishlist-btn ${wishlist.has(product.id) ? "wishlisted" : ""}`}
                    onClick={() => toggleWishlist(product.id)}
                    aria-label={wishlist.has(product.id) ? "Remove from wishlist" : "Add to wishlist"}
                  >
                    <HeartIcon />
                  </button>
                  <span className="product-emoji">{product.emoji}</span>
                </div>
                <div className="product-info">
                  <div className="card-meta">
                    <p className="product-category">{product.category}</p>
                    {product.price < 600 && <span className="deal-badge">Great Deal</span>}
                  </div>
                  <h2>{product.name}</h2>
                  <p className="product-description">{product.description}</p>
                  <Rating
                    value={ratings[product.id]?.stars ?? 4.0}
                    count={ratings[product.id]?.count ?? 100}
                  />
                  <div className="product-footer">
                    <p className="product-price">{money(product.price)}</p>
                    <button
                      className={`buy-button ${addedToCart === product.id ? "added" : ""}`}
                      onClick={() => handleAddToCart(product.id)}
                    >
                      <CartIcon />
                      {addedToCart === product.id ? "Added!" : "Add to Cart"}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-illustration">
              <span>🔎</span>
            </div>
            <h2>No matching products</h2>
            <p>Try adjusting your search or filters to find what you&apos;re looking for.</p>
            <button className="reset-button" onClick={clearFilters}>
              Show all products
            </button>
          </div>
        )}
      </section>

      <footer>
        <div className="footer-content">
          <span className="footer-brand">
            <span className="brand-mark brand-mark-sm">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
            </span>
            Little Market
          </span>
          <span className="footer-dot">·</span>
          <span>A student e-commerce feature project</span>
        </div>
      </footer>
    </main>
  );
}

export default App;
