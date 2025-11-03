import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { InputTextarea } from "primereact/inputtextarea";
import { Column } from "primereact/column";
import { useEffect, useState } from "react";
import { CustomerOrder } from "../../../redux/slices/types/sales/CustomerOrder";
import { createRequest } from "../../../utils/api";
import useAuth from "../../../hooks/useAuth";
import { SALES_ENDPOINTS } from "../../../api/salesEndpoints";

interface ReviewOrApproveOrderProps {
  order?: CustomerOrder;
  onClose: () => void;
  onRefresh: () => void;
  action: "approve" | "review";
  visible: boolean;
}

const ReviewOrApproveOrder: React.FC<ReviewOrApproveOrderProps> = ({
  order,
  onClose,
  onRefresh,
  action,
  visible,
}) => {
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();

  const handleAction = async (status: "Approved" | "Rejected") => {
    if (!order?.id) return;

    setLoading(true);

    try {
      const endpoint = SALES_ENDPOINTS.CUSTOMER_ORDERS.UPDATE_STATUS(order.id)

      const data = {
        status: status,
        comment: comment,
      };

      await createRequest(endpoint, token.access_token, data, onRefresh, "PUT");
      onClose();
    } catch (error) {
      console.error(`Error ${action}ing order:`, error);
    } finally {
      setLoading(false);
    }
  };

  const getHeaderText = () => {
    if (action === "review") {
      return "Review Customer Order";
    } else {
      return "Approve Customer Order";
    }
  };

  const getActionButtonText = () => {
    if (action === "review") {
      return "Approve";
    } else {
      return "Approve Order";
    }
  };

  return (
    <Dialog
      header={getHeaderText()}
      visible={visible}
      onHide={onClose}
      className="w-full md:w-2/3 lg:w-1/2"
      footer={
        <div className="flex justify-end gap-2">
          <Button
            label="Cancel"
            icon="pi pi-times"
            onClick={onClose}
            className="p-button-text !bg-red-500"
            disabled={loading}
          />
          <Button
            label="Reject"
            className="p-button-danger"
            icon="pi pi-times"
            onClick={() => handleAction("Rejected")}
            loading={loading}
          />
          <Button
            label={getActionButtonText()}
            className="p-button-success"
            icon="pi pi-check"
            onClick={() => handleAction("Approved")}
            loading={loading}
          />
        </div>
      }
    >
      {order ? (
        <div className="p-4 space-y-4">
          <h2 className="text-lg font-semibold">Order #{order.so_number}</h2>
          
          <div className="space-y-2">
            <div className="flex border-b py-2">
              <span className="font-semibold w-1/3">Customer</span>
              <span>
                {order.customer?.organization_name || 
                 `${order.customer?.first_name} ${order.customer?.last_name}`}
              </span>
            </div>
            <div className="flex border-b py-2">
              <span className="font-semibold w-1/3">Order Type</span>
              <span>{order.order_type}</span>
            </div>
            <div className="flex border-b py-2">
              <span className="font-semibold w-1/3">Status</span>
              <span className={`font-medium ${
                order.status === 'pending' ? 'text-yellow-600' :
                order.status === 'reviewed' ? 'text-blue-600' :
                order.status === 'approved' ? 'text-green-600' :
                'text-gray-600'
              }`}>
                {order.status}
              </span>
            </div>
            <div className="flex border-b py-2">
              <span className="font-semibold w-1/3">Order Date</span>
              <span>{order.order_date}</span>
            </div>
            <div className="flex border-b py-2">
              <span className="font-semibold w-1/3">Expected Delivery</span>
              <span>{order.expected_delivery_date}</span>
            </div>
            <div className="flex border-b py-2">
              <span className="font-semibold w-1/3">Total Amount</span>
              <span>{order.total_amount}</span>
            </div>
          </div>

          {order.order_lines && order.order_lines.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Order Items</h3>
              <DataTable value={order.order_lines} className="p-datatable-sm">
                <Column field="name" header="Item Name" />
                <Column field="qty_ordered" header="Quantity" />
                <Column 
                  field="unit_price" 
                  header="Unit Price" 
                  body={(rowData) => `${rowData.unit_price}`}
                />
                <Column 
                  field="tax_amount" 
                  header="Tax" 
                  body={(rowData) => `${rowData.tax_pct}`}
                />
              </DataTable>
            </div>
          )}

          <div className="mt-4">
            <label htmlFor="comment" className="font-semibold block mb-2">
              {action === "approve" ? "Approval" : "Review"} Comment:
            </label>
            <InputTextarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="w-full"
              placeholder={`Add your ${action} comment here...`}
            />
          </div>
        </div>
      ) : (
        <p className="p-4">No order selected.</p>
      )}
    </Dialog>
  );
};

export default ReviewOrApproveOrder;