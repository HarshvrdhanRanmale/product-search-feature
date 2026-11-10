import { useMemo, useState } from "react";
import "./App.css";

const products = [
  { id: 1, name: "Cloud headphones", category: "Electronics", price: 2499, emoji: "🎧", color: "lavender", badge: "Best seller", description: "Wireless sound for your everyday" },
  { id: 2, name: "Everyday backpack", category: "Accessories", price: 1899, emoji: "🎒", color: "peach", badge: "New", description: "Room for everything you need" },
  { id: 3, name: "Stoneware mug", category: "Home", price: 549, emoji: "☕", color: "mint", badge: "Cozy pick", description: "A cozy start to the morning" },
  { id: 4, name: "Desk lamp", category: "Home", price: 1299, emoji: "💡", color: "yellow", badge: "Desk upgrade", description: "A little more light for big ideas" },
  { id: 5, name: "Smart watch", category: "Electronics", price: 3299, emoji: "⌚", color: "blue", badge: "Tech pick", description: "Your day, at a glance" },
  { id: 6, name: "Canvas tote", category: "Accessories", price: 399, emoji: "👜", color: "pink", badge: "Everyday", description: "A simple carry-all for every day" },
];

const money = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

function App() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("featured");

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
  }, [search, category, minPrice, maxPrice, sort]);

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

        <div className="topbar-actions">
          <span className="demo-label">PRODUCT SEARCH DEMO</span>
          <button className="ghost-button" type="button">
            Saved
          </button>
          <button className="shop-button" type="button">
            Bag (0)
          </button>
        </div>
      </header>

      <section className="intro">
        <div className="intro-copy-block">
          <p className="eyebrow">A FEW GOOD FINDS</p>
          <h1>Find your next favorite.</h1>
          <p className="intro-copy">
            Browse the collection and use the filters to find just the right thing.
          </p>
        </div>

        <div className="intro-panel" aria-label="Store highlights">
          <div>
            <span className="panel-label">Curated</span>
            <strong>36 fresh picks</strong>
          </div>
          <div>
            <span className="panel-label">Shipping</span>
            <strong>Free over ₹1,999</strong>
          </div>
          <div>
            <span className="panel-label">Reviews</span>
            <strong>4.9/5 rated</strong>
          </div>
        </div>
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

        {visibleProducts.length > 0 ? (
          <div className="product-grid">
            {visibleProducts.map((product) => (
              <article className="product-card" key={product.id}>
                <div
                  className={`product-art ${product.color}`}
                  aria-hidden="true"
                >
                  <span className="product-emoji">{product.emoji}</span>
                  <span className="product-badge">{product.badge}</span>
                </div>
                <div className="product-info">
                  <div className="card-meta">
                    <p className="product-category">{product.category}</p>
                    <span className="mini-pill">{product.badge}</span>
                  </div>
                  <h2>{product.name}</h2>
                  <p className="product-description">{product.description}</p>

                  <div className="product-footer">
                    <p className="product-price">{money(product.price)}</p>
                    <button className="buy-button" type="button">
                      Add to bag
                    </button>
                  </div>
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