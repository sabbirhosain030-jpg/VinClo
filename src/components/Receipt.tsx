import React from 'react';
import { OrderItem } from '@/lib/types';

interface ReceiptProps {
  orderId: string;
  customerName: string;
  items: OrderItem[];
  total: number;
  createdAt: string;
  cashier?: string;
}

const Receipt = React.forwardRef<HTMLDivElement, ReceiptProps>(
  ({ orderId, customerName, items, total, createdAt, cashier }, ref) => {
    return (
      <div
        id="receipt-content"
        ref={ref}
        style={{
          padding: '24px',
          background: '#fff',
          color: '#000',
          fontFamily: 'monospace',
          fontSize: '13px',
          width: '300px',
          margin: '0 auto',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', borderBottom: '2px dashed #000', paddingBottom: 12, marginBottom: 12 }}>
          <h2 style={{ fontSize: 20, fontWeight: 900, letterSpacing: 2, margin: 0 }}>VINCLO</h2>
          <p style={{ margin: '4px 0 0', fontSize: 11 }}>Premium Clothing & Accessories</p>
          <p style={{ margin: '2px 0 0', fontSize: 11, color: '#555' }}>Cash on Delivery Receipt</p>
        </div>

        {/* Meta */}
        <div style={{ marginBottom: 12, fontSize: 11 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Order #</span>
            <span style={{ fontWeight: 700 }}>{orderId.slice(0, 8).toUpperCase()}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Date</span>
            <span>{new Date(createdAt).toLocaleString('en-BD')}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Customer</span>
            <span>{customerName}</span>
          </div>
          {cashier && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Cashier</span>
              <span>{cashier}</span>
            </div>
          )}
        </div>

        {/* Items */}
        <div style={{ borderTop: '1px dashed #000', borderBottom: '1px dashed #000', paddingTop: 10, paddingBottom: 10, marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, marginBottom: 6, fontSize: 11 }}>
            <span>ITEM</span>
            <span>SUBTOTAL</span>
          </div>
          {items.map((item, i) => (
            <div key={i} style={{ marginBottom: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.name}
                </span>
                <span>৳{(item.price * item.qty).toLocaleString()}</span>
              </div>
              <div style={{ color: '#555', fontSize: 11 }}>
                {item.qty} × ৳{item.price.toLocaleString()}
              </div>
            </div>
          ))}
        </div>

        {/* Total */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 900, fontSize: 16, marginBottom: 12 }}>
          <span>TOTAL</span>
          <span>৳{total.toLocaleString()}</span>
        </div>

        {/* Payment method */}
        <div style={{ textAlign: 'center', borderTop: '1px dashed #000', paddingTop: 10, fontSize: 11 }}>
          <p style={{ margin: 0, fontWeight: 700 }}>Payment: Cash on Delivery</p>
          <p style={{ margin: '6px 0 0', color: '#444' }}>Thank you for shopping with VinClo!</p>
          <p style={{ margin: '2px 0 0', color: '#888', fontSize: 10 }}>vinclo.com</p>
        </div>
      </div>
    );
  }
);

Receipt.displayName = 'Receipt';
export default Receipt;
