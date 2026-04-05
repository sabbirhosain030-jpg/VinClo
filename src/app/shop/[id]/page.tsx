import { createServerSupabaseClient } from '@/lib/supabase-server';
import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import AddToCartButton from '@/components/AddToCartButton';
import { Package, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: product } = await supabase.from('products').select('*').eq('id', id).single();

  if (!product) notFound();

  return (
    <>
      <Navbar />
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 24px' }}>
        <Link href="/shop" className="btn btn-ghost" style={{ padding: '8px 14px', marginBottom: 32, display: 'inline-flex' }}>
          <ArrowLeft size={15} /> Back to Shop
        </Link>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48 }}>
          {/* Image */}
          <div
            style={{
              borderRadius: 20,
              overflow: 'hidden',
              background: 'var(--surface-2)',
              aspectRatio: '4/5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--border)',
            }}
          >
            {product.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <Package size={60} style={{ color: 'var(--border)' }} />
            )}
          </div>

          {/* Info */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            {product.category && <span className="badge badge-accent" style={{ marginBottom: 16, width: 'fit-content' }}>{product.category}</span>}
            <h1 style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.5px', marginBottom: 16 }}>
              {product.name}
            </h1>
            <p className="gradient-text" style={{ fontSize: '2.2rem', fontWeight: 900, marginBottom: 16 }}>
              ৳{product.price.toLocaleString()}
            </p>
            {product.description && (
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 24 }}>{product.description}</p>
            )}

            {/* Stock */}
            <div style={{ marginBottom: 28 }}>
              {product.stock === 0 ? (
                <span className="badge badge-danger">Out of Stock</span>
              ) : product.stock <= 5 ? (
                <span className="badge badge-danger">Only {product.stock} left!</span>
              ) : (
                <span className="badge badge-success">In Stock ({product.stock} available)</span>
              )}
            </div>

            <AddToCartButton product={product} />

            <div style={{ marginTop: 24, padding: '14px', background: 'var(--surface-2)', borderRadius: 12, border: '1px solid var(--border)', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              💵 Cash on Delivery &nbsp;|&nbsp; 🔄 7-Day Returns &nbsp;|&nbsp; 🚚 Nationwide Delivery
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
