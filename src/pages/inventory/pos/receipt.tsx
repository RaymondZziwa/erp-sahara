import React from 'react';

interface PrintableContentProps {
  cart: any[];
  total: number;
  paymentMethod: string;
  businessName: string;
    isMobile?: boolean;
    servedBy;
}

export class PrintableContent extends React.Component<PrintableContentProps> {
  render() {
    const { cart, total, paymentMethod, businessName , servedBy } = this.props;
    const today = new Date();

    const formattedDate = today.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

    const formattedTime = today.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <div style={{
        color: '#333',
        padding: '16px',
        fontFamily: "'Helvetica Neue', Arial, sans-serif",
        maxWidth: '80mm',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '16px',
          paddingBottom: '8px',
          borderBottom: '1px dashed #ddd'
        }}>
          <h2 style={{
            margin: '0 0 4px 0',
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#111'
          }}>{businessName}</h2>
          <p style={{
            margin: '0',
            fontSize: '12px',
            color: '#666'
          }}>POINT OF SALE RECEIPT</p>
        </div>

        {/* Transaction Info */}
        <div style={{
          marginBottom: '12px',
          fontSize: '10px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Date:</span>
            <span>{formattedDate}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Time:</span>
            <span>{formattedTime}</span>
          </div>
          {/* <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Payment Method:</span>
            <span>{paymentMethod || 'N/A'}</span>
          </div> */}
        </div>

        {/* Items Table */}
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          marginBottom: '12px',
          fontSize: '10px'
        }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #ddd' }}>
              <th style={{ textAlign: 'left', padding: '4px 0', fontWeight: 'bold' }}>ITEM</th>
              <th style={{ textAlign: 'right', padding: '4px 0', fontWeight: 'bold' }}>PRICE</th>
              <th style={{ textAlign: 'right', padding: '4px 0', fontWeight: 'bold' }}>QTY</th>
              <th style={{ textAlign: 'right', padding: '4px 0', fontWeight: 'bold' }}>TOTAL</th>
            </tr>
          </thead>
          <tbody>
            {cart.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: '8px 0', color: '#999' }}>
                  No items in cart
                </td>
              </tr>
            ) : (
              cart.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '6px 0', maxWidth: '40mm', wordWrap: 'break-word' }}>
                    {item.name}
                    {item.discount > 0 && (
                      <div style={{ fontSize: '8px', color: '#E53935' }}>
                        Discount: UGX {item.discount.toLocaleString()}
                      </div>
                    )}
                  </td>
                  <td style={{ textAlign: 'right', padding: '6px 0' }}>
                    UGX {item.actual_selling_price?.toLocaleString()}
                  </td>
                  <td style={{ textAlign: 'right', padding: '6px 0' }}>
                    {item.quantity}
                  </td>
                  <td style={{ textAlign: 'right', padding: '6px 0', fontWeight: 'bold' }}>
                    UGX {(item.quantity * item.actual_selling_price - item.discount * item.quantity).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Totals */}
        <div style={{
          borderTop: '1px dashed #ddd',
          paddingTop: '8px',
          marginBottom: '16px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontWeight: 'bold',
            fontSize: '12px'
          }}>
            <span>TOTAL:</span>
            <span>UGX {total.toLocaleString()}</span>
          </div>
            </div>
            
            <p style={{
            fontSize: '10px'
          }}>Served by: {servedBy}</p>

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          fontSize: '8px',
          color: '#999',
          borderTop: '1px dashed #ddd',
          paddingTop: '8px'
        }}>
          <p style={{ margin: '4px 0' }}>Thank you for your purchase!</p>
          <p style={{ margin: '4px 0', fontStyle: 'italic' }}>Goods sold are not returnable</p>
          <p style={{ margin: '4px 0' }}>{businessName}</p>
        </div>
      </div>
    );
  }
}