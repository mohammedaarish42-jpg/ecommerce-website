const { useState, useEffect, useMemo } = React;

const formatPrice = p => "₹" + p.toLocaleString("en-IN");
const CATEGORIES = ["All", ...new Set(PRODUCTS.map(p => p.category))];

function loadCart() {
    try { return JSON.parse(localStorage.getItem("cart")) || {}; } catch { return {}; }
}

function Header({ search, setSearch, cartCount, openCart }) {
    return (
        <header className="header">
            <h1 className="logo">ShopEase</h1>
            <input className="search" type="text" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} />
            <button className="cart-btn" onClick={openCart}>🛒 Cart <span className="badge">{cartCount}</span></button>
        </header>
    );
}

function Filters({ category, setCategory, sort, setSort, maxPrice, setMaxPrice }) {
    return (
        <div className="filters">
            <div className="chips">
                {CATEGORIES.map(c => <button key={c} className={c === category ? "chip active" : "chip"} onClick={() => setCategory(c)}>{c}</button>)}
            </div>
            <div className="controls">
                <label>Max price: <strong>{formatPrice(maxPrice)}</strong>
                    <input type="range" min="300" max="4000" step="100" value={maxPrice} onChange={e => setMaxPrice(+e.target.value)} />
                </label>
                <select value={sort} onChange={e => setSort(e.target.value)}>
                    <option value="default">Sort: Featured</option>
                    <option value="low">Price: Low to High</option>
                    <option value="high">Price: High to Low</option>
                    <option value="rating">Top Rated</option>
                </select>
            </div>
        </div>
    );
}

function ProductCard({ product, onView, onAdd }) {
    return (
        <article className="card">
            <div className="card-img" style={{ background: product.color }} onClick={() => onView(product)} role="button" tabIndex="0" aria-label={`View ${product.name}`}>
                {product.icon}
            </div>
            <div className="card-body">
                <span className="category">{product.category}</span>
                <h3 onClick={() => onView(product)}>{product.name}</h3>
                <div className="rating">★ {product.rating} <span> / 5</span></div>
                <div className="card-footer"><span className="price">{formatPrice(product.price)}</span><button onClick={() => onAdd(product.id)}>Add to Cart</button></div>
            </div>
        </article>
    );
}

function ProductDetails({ product, onClose, onAdd }) {
    return (
        <div className="overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <button className="close" onClick={onClose} aria-label="Close">✕</button>
                <div className="modal-img" style={{ background: product.color }}>{product.icon}</div>
                <div className="modal-info">
                    <span className="category">{product.category}</span><h2>{product.name}</h2>
                    <div className="rating">★ {product.rating} / 5</div>
                    <p>{product.description}</p>
                    <div className="price big">{formatPrice(product.price)}</div>
                    <button onClick={() => { onAdd(product.id); onClose(); }}>Add to Cart</button>
                </div>
            </div>
        </div>
    );
}

function Cart({ cart, onClose, changeQty }) {
    const items = Object.entries(cart).map(([id, qty]) => ({ ...PRODUCTS.find(p => p.id === +id), qty }));
    const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);
    return (
        <div className="overlay" onClick={onClose}>
            <aside className="cart" onClick={e => e.stopPropagation()}>
                <div className="cart-header"><h2>Your Cart</h2><button className="close" onClick={onClose}>✕</button></div>
                {items.length === 0 ? <p className="empty">Your cart is empty.</p> : <>
                    {items.map(i => <div key={i.id} className="cart-item">
                        <span className="cart-icon" style={{ background: i.color }}>{i.icon}</span>
                        <div className="cart-info"><strong>{i.name}</strong><span>{formatPrice(i.price)}</span></div>
                        <div className="qty"><button onClick={() => changeQty(i.id, -1)} aria-label="Decrease quantity">−</button><span>{i.qty}</span><button onClick={() => changeQty(i.id, 1)} aria-label="Increase quantity">+</button></div>
                    </div>)}
                    <div className="total">Total: <strong>{formatPrice(total)}</strong></div>
                    <button className="checkout" onClick={() => alert("Thank you for your order! This is a demo checkout.")}>Checkout</button>
                </>}
            </aside>
        </div>
    );
}

function App() {
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("All");
    const [sort, setSort] = useState("default");
    const [maxPrice, setMaxPrice] = useState(4000);
    const [selected, setSelected] = useState(null);
    const [cartOpen, setCartOpen] = useState(false);
    const [cart, setCart] = useState(loadCart);

    useEffect(() => { try { localStorage.setItem("cart", JSON.stringify(cart)); } catch {} }, [cart]);

    const changeQty = (id, delta) => setCart(prev => {
        const qty = (prev[id] || 0) + delta;
        const next = { ...prev };
        if (qty <= 0) delete next[id]; else next[id] = qty;
        return next;
    });

    const visible = useMemo(() => {
        const q = search.toLowerCase();
        let list = PRODUCTS.filter(p => (category === "All" || p.category === category) && p.price <= maxPrice && p.name.toLowerCase().includes(q));
        if (sort === "low") list = [...list].sort((a, b) => a.price - b.price);
        if (sort === "high") list = [...list].sort((a, b) => b.price - a.price);
        if (sort === "rating") list = [...list].sort((a, b) => b.rating - a.rating);
        return list;
    }, [search, category, sort, maxPrice]);

    const cartCount = Object.values(cart).reduce((a, b) => a + b, 0);

    return <>
        <Header search={search} setSearch={setSearch} cartCount={cartCount} openCart={() => setCartOpen(true)} />
        <main>
            <section className="hero">
                <span className="hero-kicker">THE EVERYDAY EDIT</span>
                <h2>Thoughtful finds.<br /><em>Better living.</em></h2>
                <p>Curated essentials for your everyday moments.</p>
                <a href="#collection">Explore the collection <span>↓</span></a>
            </section>
            <section id="collection" aria-label="Product collection">
                <div className="section-heading"><div><span className="eyebrow">MADE FOR YOUR EVERYDAY</span><h2>Discover the collection</h2></div><span className="section-note">Considered picks, just for you.</span></div>
                <Filters category={category} setCategory={setCategory} sort={sort} setSort={setSort} maxPrice={maxPrice} setMaxPrice={setMaxPrice} />
                <p className="count">{visible.length} products</p>
                <div className="grid">{visible.map(p => <ProductCard key={p.id} product={p} onView={setSelected} onAdd={id => changeQty(id, 1)} />)}</div>
                {visible.length === 0 && <p className="empty">No products match your search.</p>}
            </section>
        </main>
        <footer className="footer"><span className="logo">ShopEase</span><span>Simple choices. Everyday style.</span></footer>
        {selected && <ProductDetails product={selected} onClose={() => setSelected(null)} onAdd={id => changeQty(id, 1)} />}
        {cartOpen && <Cart cart={cart} onClose={() => setCartOpen(false)} changeQty={changeQty} />}
    </>;
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
