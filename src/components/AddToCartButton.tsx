'use client';

import { Product } from '@/lib/types';
import { useCart } from '@/context/CartContext';
import { ShoppingCart, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { useState } from 'react';

export default function AddToCartButton({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    if (product.stock === 0) return;
    addItem(product);
    toast.success(`${product.name} added to cart`);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <button
      className="btn btn-primary"
      style={{ padding: '14px 32px', fontSize: '1rem', gap: 8 }}
      onClick={handleAdd}
      disabled={product.stock === 0 || added}
    >
      {added ? <><Check size={18} /> Added!</> : <><ShoppingCart size={18} /> Add to Cart</>}
    </button>
  );
}
