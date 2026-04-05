'use client';

import { Product } from '@/lib/types';
import { useCart } from '@/context/CartContext';
import { ShoppingCart, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();

  const handleAdd = () => {
    if (product.stock === 0) return;
    addItem(product);
    toast.success(`${product.name} added to cart`);
  };

  return (
    <div
      className="glass fade-in"
      style={{
        overflow: 'hidden',
        transition: 'transform 0.25s ease, box-shadow 0.25s ease',
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-6px)';
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          '0 16px 48px rgba(124,92,191,0.2)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
      }}
    >
      {/* Image */}
      <Link href={`/shop/${product.id}`}>
        <div
          style={{
            width: '100%',
            aspectRatio: '4/5',
            background: 'var(--surface-2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {product.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.image_url}
              alt={product.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.06)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
            />
          ) : (
            <Package size={40} style={{ color: 'var(--border)' }} />
          )}

          {/* Out of stock overlay */}
          {product.stock === 0 && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(10,10,15,0.7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span className="badge badge-danger">Out of Stock</span>
            </div>
          )}

          {/* Category badge */}
          {product.category && (
            <span
              className="badge badge-accent"
              style={{ position: 'absolute', top: 12, left: 12 }}
            >
              {product.category}
            </span>
          )}
        </div>
      </Link>

      {/* Info */}
      <div style={{ padding: '16px' }}>
        <Link href={`/shop/${product.id}`}>
          <h3
            style={{
              fontWeight: 700,
              fontSize: '0.95rem',
              marginBottom: 4,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {product.name}
          </h3>
        </Link>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: 12, minHeight: 36,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {product.description}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span
            className="gradient-text"
            style={{ fontWeight: 800, fontSize: '1.1rem' }}
          >
            ৳{product.price.toLocaleString()}
          </span>
          <button
            className="btn btn-primary"
            onClick={handleAdd}
            disabled={product.stock === 0}
            style={{ padding: '8px 14px', fontSize: '0.8rem', gap: 4 }}
          >
            <ShoppingCart size={15} />
            Add
          </button>
        </div>
        {product.stock > 0 && product.stock <= 5 && (
          <p style={{ color: 'var(--danger)', fontSize: '0.72rem', marginTop: 8, fontWeight: 500 }}>
            Only {product.stock} left!
          </p>
        )}
      </div>
    </div>
  );
}
