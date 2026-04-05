import Link from 'next/link';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { CheckCircle } from 'lucide-react';

export const metadata = { title: 'Order Confirmed | VinClo' };

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createServerSupabaseClient();

  let order = null;
  if (params.orderId) {
    const { data } = await supabase
      .from('orders')
      .select('*')
      .eq('id', params.orderId)
      .single();
    order = data;
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
      }}
    >
      <div
        className="glass fade-in"
        style={{ maxWidth: 520, width: '100%', padding: 40, textAlign: 'center' }}
      >
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            background: 'rgba(45,212,160,0.15)',
            border: '2px solid rgba(45,212,160,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
          }}
        >
          <CheckCircle size={36} style={{ color: 'var(--success)' }} />
        </div>
        <h1 className="gradient-text" style={{ fontSize: '2rem', fontWeight: 900, marginBottom: 12 }}>
          Order Confirmed!
        </h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>
          Thank you for shopping with VinClo. Your order has been received and will be delivered via
          Cash on Delivery.
        </p>

        {order && (
          <div
            style={{
              background: 'var(--surface-2)',
              borderRadius: 12,
              padding: 20,
              marginBottom: 28,
              textAlign: 'left',
            }}
          >
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: 8 }}>
              Order #{order.id.slice(0, 8).toUpperCase()}
            </p>
            {(order.items as { name: string; qty: number; price: number }[]).map((item, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.85rem',
                  marginBottom: 6,
                }}
              >
                <span>
                  {item.name} × {item.qty}
                </span>
                <span>৳{(item.price * item.qty).toLocaleString()}</span>
              </div>
            ))}
            <div
              style={{
                borderTop: '1px solid var(--border)',
                paddingTop: 12,
                marginTop: 8,
                display: 'flex',
                justifyContent: 'space-between',
                fontWeight: 700,
              }}
            >
              <span>Total</span>
              <span className="gradient-text">৳{order.total.toLocaleString()}</span>
            </div>
          </div>
        )}

        <Link href="/shop" className="btn btn-primary" style={{ padding: '12px 32px' }}>
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
