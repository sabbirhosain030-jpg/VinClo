import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main
        style={{
          minHeight: 'calc(100vh - 64px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '60px 24px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background glow */}
        <div
          style={{
            position: 'absolute',
            top: '20%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 600,
            height: 600,
            background: 'radial-gradient(ellipse, rgba(124,92,191,0.18) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <div className="fade-in" style={{ maxWidth: 720, position: 'relative' }}>
          <span className="badge badge-accent" style={{ marginBottom: 24, display: 'inline-flex' }}>
            New Collection 2026
          </span>
          <h1
            className="gradient-text"
            style={{
              fontSize: 'clamp(3rem, 8vw, 5.5rem)',
              fontWeight: 900,
              lineHeight: 1.05,
              letterSpacing: '-2px',
              marginBottom: 24,
            }}
          >
            Style that moves with you.
          </h1>
          <p
            style={{
              fontSize: '1.15rem',
              color: 'var(--text-muted)',
              lineHeight: 1.7,
              marginBottom: 40,
              maxWidth: 520,
              margin: '0 auto 40px',
            }}
          >
            VinClo brings premium clothing and accessories crafted for the modern wardrobe. Timeless design, exceptional quality.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/shop" className="btn btn-primary" style={{ padding: '14px 32px', fontSize: '1rem' }}>
              Shop the Collection
            </Link>
            <Link href="/shop" className="btn btn-ghost" style={{ padding: '14px 32px', fontSize: '1rem' }}>
              View Lookbook
            </Link>
          </div>
        </div>

        {/* Feature pills */}
        <div
          style={{
            marginTop: 80,
            display: 'flex',
            gap: 16,
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          {['Free Delivery on orders over ৳2000', 'Cash on Delivery', '7-Day Easy Returns', 'Authentic Fabrics'].map((f) => (
            <span
              key={f}
              style={{
                padding: '8px 18px',
                borderRadius: 99,
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
                color: 'var(--text-muted)',
                fontSize: '0.8rem',
                fontWeight: 500,
              }}
            >
              {f}
            </span>
          ))}
        </div>
      </main>
    </>
  );
}
