import { useEffect, useMemo, useState } from "react";
import "./App.css";

const money = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("featured");

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

  function clearFilters() {
    setSearch("");
    setCategory("All");
    setMinPrice("");
    setMaxPrice("");
    setSort("featured");
  }

  return (
    <main className="store">
      <header className="topbar">
        <a className="brand" href="/" aria-label="Little Market home">
          <span className="brand-mark">L</span>
          little market
        </a>
        <span className="demo-label">PRODUCT SEARCH DEMO</span>
      </header>

      <section className="intro">
        <p className="eyebrow">A FEW GOOD FINDS</p>
        <h1>Find your next favorite.</h1>
        <p className="intro-copy">
          Browse the collection and use the filters to find just the right thing.
        </p>
      </section>

      <section className="toolbar" aria-label="Product filters">
        <label className="search-field">
          <span aria-hidden="true">⌕</span>
          <input
            type="search"
            placeholder="Search products or categories"
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
            <option>All</option>
            <option>Electronics</option>
            <option>Accessories</option>
            <option>Home</option>
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
            <option value="low">Price: low to high</option>
            <option value="high">Price: high to low</option>
          </select>
        </label>
      </section>

      <section className="results">
        <div className="results-heading">
          <p>
            <strong>{visibleProducts.length}</strong>{" "}
            {visibleProducts.length === 1 ? "item" : "items"}
          </p>
          <button className="clear-button" onClick={clearFilters}>
            Clear filters
          </button>
        </div>

        {loading ? (
          <p>Loading products…</p>
        ) : error ? (
          <p role="alert">Product error: {error}</p>
        ) : visibleProducts.length > 0 ? (
          <div className="product-grid">
            {visibleProducts.map((product) => (
              <article className="product-card" key={product.id}>
                <div
                  className={`product-art ${product.color}`}
                  aria-hidden="true"
                >
                  <span>{product.emoji}</span>
                </div>
                <div className="product-info">
                  <p className="product-category">{product.category}</p>
                  <h2>{product.name}</h2>
                  <p className="product-description">{product.description}</p>
                  <p className="product-price">{money(product.price)}</p>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <span aria-hidden="true">🔎</span>
            <h2>No matching products</h2>
            <p>Try a different search or clear your filters.</p>
            <button className="reset-button" onClick={clearFilters}>
              Show all products
            </button>
          </div>
        )}
      </section>

      <footer>Little Market · A student e-commerce feature project</footer>
    </main>
  );
}

export default App;