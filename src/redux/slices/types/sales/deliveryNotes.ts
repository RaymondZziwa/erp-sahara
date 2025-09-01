export interface DeliveryNote {
  id: string;
  sale_order_id?: string | null;
    delivery_type: 'Service' | 'Product' | 'Mixed';
    delivery_date: string; // ISO date string, defaults to today
    delivery_method:
      | 'Truck'
      | 'Courier'
      | 'Motorbike'
      | 'Company Vehicle'
      | 'Pickup by Customer'
      | 'On-Site'
      | 'Remote'
      | 'Workshop';
    tracking_number?: string | null;
    carrier_id?: string | null;
    delivered_by?: string | null;
    received_by?: string | null;
    notes?: string | null;
    service_performed_at?: string | null; // ISO date string
    service_technician?: string | null;
    items: DeliveryItem[];
}

export interface DeliveryItem {
    sale_order_item_id: string;
    quantity_delivered: number;
    uom_id: string;
    condition: 'Good' | 'Damaged';
    notes?: string | null;
  }