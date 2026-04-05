'use client';

import { useCart } from '@/context/CartContext';
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createClient } from '@/lib/supabase';
import toast from 'react-hot-toast';

export default function CartPage() {
  const { items, removeItem, updateQty, clearCart, total } = useCart();
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleCheckout = async () => {
    if (!form.name || !form.phone || !form.address) {
      toast.error('Please fill in name, phone, and address');
      return;
    }
    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    setLoading(true);
    const supabase = createClient();

    try {
      // Decrement stock
      for (const item of items) {
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

      // Insert order
      const orderItems = items.map((i) => ({
        product_id: i.product.id,
        name: i.product.name,
        qty: i.qty,
        price: i.product.price,
      }));

      const { data: order, error } = await supabase
        .from('orders')
        .insert({
          customer_name: form.name,
          customer_email: form.email || null,
          customer_phone: form.phone,
          customer_address: form.address,
          items: orderItems,
          total,
          source: 'store',
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;

      clearCart();
      router.push(`/checkout/success?orderId=${order.id}`);
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 20,
          padding: 40,
        }}
      >
        <ShoppingBag size={60} style={{ color: 'var(--border)' }} />
        <h2 style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Your cart is empty</h2>
        <Link href="/shop" className="btn btn-primary">
          <ArrowLeft size={16} /> Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 40 }}>
        <Link href="/shop" className="btn btn-ghost" style={{ padding: '8px 14px' }}>
          <ArrowLeft size={16} /> Shop
        </Link>
        <h1 className="gradient-text" style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '-1px' }}>
          Your Cart
        </h1>
      </div>

      <div style={{ display: 'grid', gap: 32, gridTemplateColumns: 'minmax(0,1fr) 360px' }}>
        {/* Cart items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {items.map(({ product, qty }) => (
            <div
              key={product.id}
              className="glass"
              style={{ padding: 16, display: 'flex', gap: 16, alignItems: 'center' }}
            >
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 10,
                  background: 'var(--surface-2)',
                  flexShrink: 0,
                  overflow: 'hidden',
                }}
              >
                {product.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={product.image_url}
                    alt={product.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ShoppingBag size={24} style={{ color: 'var(--border)' }} />
                  </div>
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 700, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {product.name}
                </p>
                <p className="gradient-text" style={{ fontWeight: 800 }}>
                  ৳{(product.price * qty).toLocaleString()}
                </p>
              </div>
              {/* Qty controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  className="btn btn-ghost"
                  style={{ padding: '6px', minWidth: 32, minHeight: 32 }}
                  onClick={() => updateQty(product.id, qty - 1)}
                >
                  <Minus size={14} />
                </button>
                <span style={{ fontWeight: 700, minWidth: 24, textAlign: 'center' }}>{qty}</span>
                <button
                  className="btn btn-ghost"
                  style={{ padding: '6px', minWidth: 32, minHeight: 32 }}
                  onClick={() => updateQty(product.id, qty + 1)}
                  disabled={qty >= product.stock}
                >
                  <Plus size={14} />
                </button>
                <button
                  className="btn btn-danger"
                  style={{ padding: '6px', minWidth: 32, minHeight: 32 }}
                  onClick={() => removeItem(product.id)}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Checkout form + summary */}
        <div className="glass" style={{ padding: 24, alignSelf: 'start', position: 'sticky', top: 80 }}>
          <h2 style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: 20 }}>
            Order Details
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
            <input className="input" name="name" placeholder="Full Name *" value={form.name} onChange={handleChange} />
            <input className="input" name="phone" placeholder="Phone *" value={form.phone} onChange={handleChange} />
            <input className="input" name="email" placeholder="Email (optional)" value={form.email} onChange={handleChange} />
            <input className="input" name="address" placeholder="Delivery Address *" value={form.address} onChange={handleChange} />
          </div>

          {/* COD notice */}
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 10,
              background: 'rgba(45,212,160,0.08)',
              border: '1px solid rgba(45,212,160,0.2)',
              color: 'var(--success)',
              fontSize: '0.8rem',
              display: 'flex',
              gap: 8,
              marginBottom: 20,
              alignItems: 'flex-start',
            }}
          >
            💵 <span>Cash on Delivery — Pay when your order arrives at your door.</span>
          </div>

          {/* Summary */}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, marginBottom: 20 }}>
            {items.map(({ product, qty }) => (
              <div
                key={product.id}
                style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 6 }}
              >
                <span>
                  {product.name} × {qty}
                </span>
                <span>৳{(product.price * qty).toLocaleString()}</span>
              </div>
            ))}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontWeight: 800,
                fontSize: '1.1rem',
                marginTop: 12,
                paddingTop: 12,
                borderTop: '1px solid var(--border)',
              }}
            >
              <span>Total</span>
              <span className="gradient-text">৳{total.toLocaleString()}</span>
            </div>
          </div>

          <button className="btn btn-success" style={{ width: '100%', padding: '14px' }} onClick={handleCheckout} disabled={loading}>
            {loading ? <span className="spinner" /> : '🛍️ Place Order (COD)'}
          </button>
        </div>
      </div>
    </div>
  );
}
