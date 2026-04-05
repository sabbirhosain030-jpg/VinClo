import { createServerSupabaseClient } from '@/lib/supabase-server';
import { Product } from '@/lib/types';
import Navbar from '@/components/Navbar';
import ProductCard from '@/components/ProductCard';
import CategoryFilter from '@/components/CategoryFilter';

export const metadata = {
  title: 'Shop | VinClo',
  description: 'Browse the full VinClo collection — clothing, accessories, and more.',
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createServerSupabaseClient();

  let query = supabase.from('products').select('*').order('created_at', { ascending: false });

  if (params.category) {
    query = query.eq('category', params.category);
  }
  if (params.q) {
    query = query.ilike('name', `%${params.q}%`);
  }

  const { data: products, error } = await query;

  // Get distinct categories
  const { data: catData } = await supabase
    .from('products')
    .select('category')
    .not('category', 'is', null);

  const categories = [...new Set((catData ?? []).map((p) => p.category).filter(Boolean))] as string[];

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <h1
            className="gradient-text"
            style={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-1px', marginBottom: 8 }}
          >
            The Collection
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>
            {products?.length ?? 0} items available
          </p>
        </div>

        {/* Filters */}
        <CategoryFilter categories={categories} active={params.category} query={params.q} />

        {/* Grid */}
        {error ? (
          <div
            className="glass"
            style={{ padding: 40, textAlign: 'center', color: 'var(--danger)' }}
          >
            Failed to load products. Please check your Supabase configuration.
          </div>
        ) : !products || products.length === 0 ? (
          <div
            className="glass"
            style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}
          >
            No products found.
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: 24,
            }}
          >
            {products.map((p: Product) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
