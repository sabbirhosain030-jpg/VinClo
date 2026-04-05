'use client';

import Link from 'next/link';
import { ShoppingBag, Menu, X } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useState } from 'react';

export default function Navbar() {
  const { count } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'rgba(10,10,15,0.85)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border)',
        padding: '0 24px',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      {/* Brand */}
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: 'linear-gradient(135deg,#7c5cbf,#5f8bee)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 900,
            fontSize: 14,
            color: '#fff',
          }}
        >
          V
        </span>
        <span
          className="gradient-text"
          style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.5px' }}
        >
          VinClo
        </span>
      </Link>

      {/* Desktop Links */}
      <div
        style={{ display: 'flex', alignItems: 'center', gap: 32 }}
        className="hidden-mobile"
      >
        <Link href="/shop" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500, transition: 'color 0.2s' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
        >
          Shop
        </Link>
        <Link href="/cart" style={{ position: 'relative', display: 'flex', alignItems: 'center', color: 'var(--text)' }}>
          <ShoppingBag size={22} />
          {count > 0 && (
            <span
              style={{
                position: 'absolute',
                top: -8,
                right: -8,
                background: 'linear-gradient(135deg,#7c5cbf,#5f8bee)',
                color: '#fff',
                width: 18,
                height: 18,
                borderRadius: '50%',
                fontSize: '0.65rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {count}
            </span>
          )}
        </Link>
      </div>

      {/* Mobile hamburger */}
      <button
        className="show-mobile"
        onClick={() => setMenuOpen(!menuOpen)}
        style={{ background: 'none', border: 'none', color: 'var(--text)', cursor: 'pointer' }}
      >
        {menuOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          style={{
            position: 'absolute',
            top: 64,
            left: 0,
            right: 0,
            background: 'var(--surface)',
            borderBottom: '1px solid var(--border)',
            padding: '16px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          <Link href="/shop" onClick={() => setMenuOpen(false)} style={{ color: 'var(--text)', fontWeight: 500 }}>Shop</Link>
          <Link href="/cart" onClick={() => setMenuOpen(false)} style={{ color: 'var(--text)', fontWeight: 500 }}>
            Cart {count > 0 && `(${count})`}
          </Link>
        </div>
      )}
    </nav>
  );
}
