'use client';

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase';
import { Product, OrderItem } from '@/lib/types';
import Receipt from '@/components/Receipt';
import { useReactToPrint } from 'react-to-print';
import toast from 'react-hot-toast';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  Printer,
  LogOut,
  Package,
  ShoppingCart,
  X,
  CheckCircle,
  RefreshCw,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface POSCartItem {
  product: Product;
  qty: number;
}

interface CompletedOrder {
  id: string;
  customerName: string;
  items: OrderItem[];
  total: number;
  createdAt: string;
}

export default function POSPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [products, setProducts] = useState<Product[]>([]);
  const [filtered, setFiltered] = useState<Product[]>([]);
  const [cart, setCart] = useState<POSCartItem[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [completedOrder, setCompletedOrder] = useState<CompletedOrder | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  const receiptRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: receiptRef,
    documentTitle: `VinClo Receipt`,
  });

  // Load user
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUserEmail(data.user.email ?? '');
    });
  }, [supabase.auth]);

  // Load products
  const loadProducts = useCallback(async () => {
    setLoadingProducts(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('name');
    if (!error && data) {
      setProducts(data);
      setFiltered(data);
      const cats = [...new Set(data.map((p: Product) => p.category).filter(Boolean))] as string[];
      setCategories(cats);
    }
    setLoadingProducts(false);
  }, [supabase]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Filter products
  useEffect(() => {
    let result = products;
    if (search) result = result.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
    if (category) result = result.filter((p) => p.category === category);
    setFiltered(result);
  }, [search, category, products]);

  const addToCart = (product: Product) => {
    if (product.stock === 0) return;
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        if (existing.qty >= product.stock) {
          toast.error(`Max stock: ${product.stock}`);
          return prev;
        }
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [...prev, { product, qty: 1 }];
    });
  };

  const updateQty = (id: string, qty: number) => {
    if (qty <= 0) {
      setCart((prev) => prev.filter((i) => i.product.id !== id));
      return;
    }
    setCart((prev) =>
      prev.map((i) => (i.product.id === id ? { ...i, qty } : i))
    );
  };

  const total = cart.reduce((s, i) => s + i.product.price * i.qty, 0);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  const handleCharge = async () => {
    if (cart.length === 0) { toast.error('Cart is empty'); return; }
    if (!customerName.trim()) { toast.error('Enter customer name'); return; }
    setLoading(true);

    try {
      for (const item of cart) {
        const { data: prod } = await supabase
          .from('products')
          .select('stock')
          .eq('id', item.product.id)
          .single();
        if (!prod || prod.stock < item.qty) {
          toast.error(`Insufficient stock for ${item.product.name}`);
          setLoading(false);
          return;
        }
        await supabase
          .from('products')
          .update({ stock: prod.stock - item.qty })
          .eq('id', item.product.id);
      }

      const orderItems: OrderItem[] = cart.map((i) => ({
        product_id: i.product.id,
        name: i.product.name,
        qty: i.qty,
        price: i.product.price,
      }));

      const { data: order, error } = await supabase
        .from('orders')
        .insert({
          customer_name: customerName,
          items: orderItems,
          total,
          source: 'pos',
          status: 'completed',
        })
        .select()
        .single();

      if (error) throw error;

      setCompletedOrder({
        id: order.id,
        customerName,
        items: orderItems,
        total,
        createdAt: order.created_at,
      });
      setShowReceipt(true);
      setCart([]);
      setCustomerName('');
      await loadProducts(); // refresh stock
      toast.success('Order completed!');
    } catch {
      toast.error('Failed to process order');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg)', overflow: 'hidden' }}>
      {/* Top bar */}
      <header
        style={{
          height: 56,
          background: 'var(--surface)',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 7,
              background: 'linear-gradient(135deg,#7c5cbf,#5f8bee)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              fontSize: 13,
              color: '#fff',
            }}
          >
            V
          </div>
          <span className="gradient-text" style={{ fontWeight: 800, fontSize: '1rem' }}>
            VinClo POS
          </span>
          <span className="badge badge-accent" style={{ fontSize: '0.65rem' }}>Staff Terminal</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{userEmail}</span>
          <button className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: '0.8rem', gap: 6 }} onClick={handleLogout}>
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </header>

      {/* Main 2-column layout */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* LEFT: Product Grid */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRight: '1px solid var(--border)' }}>
          {/* Search & filter bar */}
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 10, flexWrap: 'wrap', background: 'var(--surface)' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 160 }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                className="input"
                style={{ paddingLeft: 32, height: 36, fontSize: '0.82rem' }}
                placeholder="Search products…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button
              className={`btn ${category === '' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ padding: '6px 12px', fontSize: '0.78rem' }}
              onClick={() => setCategory('')}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                className={`btn ${category === cat ? 'btn-primary' : 'btn-ghost'}`}
                style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                onClick={() => setCategory(cat)}
              >
                {cat}
              </button>
            ))}
            <button className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: '0.78rem' }} onClick={loadProducts}>
              <RefreshCw size={13} />
            </button>
          </div>

          {/* Product tiles */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
            {loadingProducts ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
                <span className="spinner" />
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                  gap: 12,
                }}
              >
                {filtered.map((product) => {
                  const inCart = cart.find((i) => i.product.id === product.id);
                  return (
                    <button
                      key={product.id}
                      onClick={() => addToCart(product)}
                      disabled={product.stock === 0}
                      style={{
                        background: inCart ? 'rgba(124,92,191,0.18)' : 'var(--surface-2)',
                        border: inCart ? '1px solid rgba(124,92,191,0.5)' : '1px solid var(--border)',
                        borderRadius: 12,
                        padding: 0,
                        cursor: product.stock === 0 ? 'not-allowed' : 'pointer',
                        opacity: product.stock === 0 ? 0.5 : 1,
                        textAlign: 'left',
                        overflow: 'hidden',
                        transition: 'all 0.15s ease',
                        position: 'relative',
                      }}
                    >
                      {/* Image */}
                      <div style={{ aspectRatio: '1', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                        {product.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <Package size={28} style={{ color: 'var(--border)' }} />
                        )}
                      </div>
                      <div style={{ padding: '10px 10px 8px' }}>
                        <p style={{ fontSize: '0.8rem', fontWeight: 700, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text)' }}>
                          {product.name}
                        </p>
                        <p className="gradient-text" style={{ fontSize: '0.9rem', fontWeight: 800, margin: '4px 0 0' }}>
                          ৳{product.price.toLocaleString()}
                        </p>
                        <p style={{ fontSize: '0.7rem', color: product.stock <= 3 ? 'var(--danger)' : 'var(--text-muted)', margin: '2px 0 0' }}>
                          Stock: {product.stock}
                        </p>
                      </div>
                      {inCart && (
                        <div
                          style={{
                            position: 'absolute',
                            top: 6,
                            right: 6,
                            background: 'linear-gradient(135deg,#7c5cbf,#5f8bee)',
                            color: '#fff',
                            width: 20,
                            height: 20,
                            borderRadius: '50%',
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {inCart.qty}
                        </div>
                      )}
                    </button>
                  );
                })}
                {filtered.length === 0 && (
                  <div style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--text-muted)', paddingTop: 40 }}>
                    No products found
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Order Panel */}
        <div
          style={{
            width: 320,
            display: 'flex',
            flexDirection: 'column',
            background: 'var(--surface)',
            flexShrink: 0,
          }}
        >
          {/* Panel header */}
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <ShoppingCart size={16} style={{ color: 'var(--accent-light)' }} />
            <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Current Order</span>
            {cartCount > 0 && (
              <span className="badge badge-accent" style={{ marginLeft: 'auto', fontSize: '0.7rem' }}>
                {cartCount} item{cartCount > 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* Customer name */}
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
            <input
              className="input"
              style={{ fontSize: '0.82rem', height: 36 }}
              placeholder="Customer Name *"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
          </div>

          {/* Cart items */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '8px 12px' }}>
            {cart.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 160, gap: 12, color: 'var(--text-muted)' }}>
                <ShoppingCart size={32} style={{ opacity: 0.3 }} />
                <span style={{ fontSize: '0.8rem' }}>Tap products to add them</span>
              </div>
            ) : (
              cart.map(({ product, qty }) => (
                <div
                  key={product.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 0',
                    borderBottom: '1px solid var(--border)',
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '0.8rem', fontWeight: 600, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {product.name}
                    </p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                      ৳{product.price.toLocaleString()} ea.
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <button
                      className="btn btn-ghost"
                      style={{ padding: 4, minWidth: 26, minHeight: 26, fontSize: '0.75rem' }}
                      onClick={() => updateQty(product.id, qty - 1)}
                    >
                      <Minus size={12} />
                    </button>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, minWidth: 20, textAlign: 'center' }}>{qty}</span>
                    <button
                      className="btn btn-ghost"
                      style={{ padding: 4, minWidth: 26, minHeight: 26 }}
                      onClick={() => updateQty(product.id, qty + 1)}
                      disabled={qty >= product.stock}
                    >
                      <Plus size={12} />
                    </button>
                    <button
                      className="btn btn-danger"
                      style={{ padding: 4, minWidth: 26, minHeight: 26 }}
                      onClick={() => updateQty(product.id, 0)}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-light)', minWidth: 56, textAlign: 'right' }}>
                    ৳{(product.price * qty).toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Total + Charge */}
          <div style={{ padding: '16px', borderTop: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Total</span>
              <span className="gradient-text" style={{ fontSize: '1.4rem', fontWeight: 900 }}>
                ৳{total.toLocaleString()}
              </span>
            </div>
            <button
              id="pos-charge-btn"
              className="btn btn-success"
              style={{ width: '100%', padding: '13px', fontSize: '0.9rem' }}
              onClick={handleCharge}
              disabled={loading || cart.length === 0}
            >
              {loading ? <span className="spinner" /> : '⚡ Charge (COD)'}
            </button>
            {cart.length > 0 && (
              <button
                className="btn btn-danger"
                style={{ width: '100%', marginTop: 8, padding: '9px', fontSize: '0.78rem' }}
                onClick={() => setCart([])}
              >
                <Trash2 size={13} /> Clear Order
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Receipt Modal */}
      {showReceipt && completedOrder && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 20,
          }}
        >
          <div
            className="glass fade-in"
            style={{ maxWidth: 420, width: '100%', padding: 24, position: 'relative' }}
          >
            <button
              onClick={() => setShowReceipt(false)}
              style={{
                position: 'absolute',
                top: 14,
                right: 14,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)',
              }}
            >
              <X size={18} />
            </button>

            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <CheckCircle size={36} style={{ color: 'var(--success)', marginBottom: 8 }} />
              <h2 style={{ fontWeight: 800, fontSize: '1.2rem', margin: 0 }}>Order Complete!</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: 4 }}>
                #{completedOrder.id.slice(0, 8).toUpperCase()} — {completedOrder.customerName}
              </p>
            </div>

            {/* Receipt preview (white background) */}
            <div
              style={{
                background: '#fff',
                borderRadius: 10,
                overflow: 'hidden',
                maxHeight: 340,
                overflowY: 'auto',
                marginBottom: 20,
                border: '1px solid var(--border)',
              }}
            >
              <Receipt
                ref={receiptRef}
                orderId={completedOrder.id}
                customerName={completedOrder.customerName}
                items={completedOrder.items}
                total={completedOrder.total}
                createdAt={completedOrder.createdAt}
                cashier={userEmail}
              />
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                id="print-receipt-btn"
                className="btn btn-primary"
                style={{ flex: 1, padding: '11px', gap: 6 }}
                onClick={() => handlePrint()}
              >
                <Printer size={15} /> Print Receipt
              </button>
              <button
                className="btn btn-ghost"
                style={{ flex: 1, padding: '11px' }}
                onClick={() => setShowReceipt(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
