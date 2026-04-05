'use client';

import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { useRef, useState } from 'react';

export default function CategoryFilter({
  categories,
  active,
  query,
}: {
  categories: string[];
  active?: string;
  query?: string;
}) {
  const router = useRouter();
  const [q, setQ] = useState(query ?? '');
  const inputRef = useRef<HTMLInputElement>(null);

  const nav = (cat?: string, search?: string) => {
    const params = new URLSearchParams();
    if (cat) params.set('category', cat);
    if (search) params.set('q', search);
    router.push(`/shop?${params.toString()}`);
  };

  return (
    <div style={{ marginBottom: 32, display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
      {/* Search */}
      <div style={{ position: 'relative', flexGrow: 1, minWidth: 200, maxWidth: 320 }}>
        <Search
          size={15}
          style={{
            position: 'absolute',
            left: 12,
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-muted)',
          }}
        />
        <input
          ref={inputRef}
          className="input"
          style={{ paddingLeft: 36 }}
          placeholder="Search products…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && nav(active, q)}
        />
      </div>

      {/* Category pills */}
      <button
        className={`btn ${!active ? 'btn-primary' : 'btn-ghost'}`}
        style={{ padding: '8px 16px', fontSize: '0.8rem' }}
        onClick={() => nav(undefined, q)}
      >
        All
      </button>
      {categories.map((cat) => (
        <button
          key={cat}
          className={`btn ${active === cat ? 'btn-primary' : 'btn-ghost'}`}
          style={{ padding: '8px 16px', fontSize: '0.8rem' }}
          onClick={() => nav(cat, q)}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
