import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { createRequest } from "../../../utils/api";
import useAuth from "../../../hooks/useAuth";
import { SALES_ENDPOINTS } from "../../../api/salesEndpoints";
import { DeliveryNote } from "../../../redux/slices/types/sales/deliveryNotes";
import useEmployees from "../../../hooks/hr/useEmployees";

interface UpdateDeliveryStatusProps {
  deliveryNote: DeliveryNote;
  visible: boolean;
  onClose: () => void;
  onSave: () => void;
}

interface StatusPayload {
  status: string;
  delivered_by?: string;
}

const UpdateDeliveryStatus: React.FC<UpdateDeliveryStatusProps> = ({
  deliveryNote,
  visible,
  onClose,
  onSave,
}) => {
  const { token } = useAuth();
  const { data: employees = [] } = useEmployees();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formState, setFormState] = useState<StatusPayload>({
    status: deliveryNote.status || "draft",
    delivered_by: deliveryNote.delivered_by || undefined,
  });

  useEffect(() => {
    if (deliveryNote) {
      setFormState({
        status: deliveryNote.status || "draft",
        delivered_by: deliveryNote.delivered_by || undefined,
      });
    }
  }, [deliveryNote]);

  const statusOptions = [
    { label: "Draft", value: "draft" },
    { label: "Ready for Pickup", value: "ready_for_pickup" },
    { label: "Shipped", value: "shipped" },
    { label: "In Transit", value: "in_transit" },
    { label: "Delivered", value: "delivered" },
    { label: "Returned", value: "returned" },
    { label: "Confirmed", value: "confirmed" },
    { label: "Disputed", value: "disputed" },
    { label: "Failed", value: "failed" },
    { label: "Canceled", value: "canceled" },
  ];

  const handleStatusChange = (value: string) => {
    setFormState(prev => ({ ...prev, status: value }));
  };

  const handleDeliveredByChange = (value: string) => {
    setFormState(prev => ({ ...prev, delivered_by: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload: StatusPayload = {
        status: formState.status,
      };

      // Only include delivered_by if status is "delivered"
      if (formState.status === "delivered" && formState.delivered_by) {
        payload.delivered_by = formState.delivered_by;
      }

      await createRequest(
        SALES_ENDPOINTS.DELIVERY_NOTES.UPDATE_STATUS(deliveryNote.id),
        token.access_token,
        payload,
        onSave,
        "PUT"
      );
      onClose();
    } catch (error) {
      console.error("Error updating delivery status:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const footer = (
    <div className="flex justify-end gap-2">
      <Button
        label="Cancel"
        icon="pi pi-times"
        onClick={onClose}
        className="p-button-text"
        disabled={isSubmitting}
      />
      <Button
        label="Update Status"
        icon="pi pi-check"
        loading={isSubmitting}
        onClick={handleSubmit}
      />
    </div>
  );

  const getStatusColor = (status: string) => {
    const statusColors = {
      draft: "bg-gray-100 text-gray-800",
      ready_for_pickup: "bg-blue-100 text-blue-800",
      shipped: "bg-yellow-100 text-yellow-800",
      in_transit: "bg-orange-100 text-orange-800",
      delivered: "bg-green-100 text-green-800",
      returned: "bg-red-100 text-red-800",
      confirmed: "bg-teal-100 text-teal-800",
      disputed: "bg-pink-100 text-pink-800",
      failed: "bg-red-100 text-red-800",
      canceled: "bg-gray-100 text-gray-800",
    };
    return statusColors[status as keyof typeof statusColors] || "bg-gray-100 text-gray-800";
  };

  return (
    <Dialog
      header={`Update Delivery Status - ${deliveryNote.delivery_number}`}
      visible={visible}
      style={{ width: "500px" }}
      footer={footer}
      onHide={onClose}
      modal
    >
      <form onSubmit={handleSubmit} className="p-fluid space-y-4">
        <div className="space-y-4">
          {/* Current Status Display */}
          <div>
            <label className="text-sm font-medium text-gray-700">Current Status</label>
            <div className="mt-1">
              <span className={`px-3 py-2 rounded-full text-sm font-medium ${getStatusColor(deliveryNote.status)}`}>
                {deliveryNote.status?.replace(/_/g, ' ').toUpperCase() || "N/A"}
              </span>
            </div>
          </div>

          {/* New Status Selection */}
          <div className="field">
            <label htmlFor="status" className="text-sm font-medium text-gray-700">
              New Status *
            </label>
            <Dropdown
              id="status"
              value={formState.status}
              options={statusOptions}
              onChange={(e) => handleStatusChange(e.value)}
              placeholder="Select new status"
              className="w-full mt-1"
              required
            />
          </div>

          {/* Delivered By (only show when status is delivered) */}
          {formState.status === "delivered" && (
            <div className="field">
              <label htmlFor="delivered_by" className="text-sm font-medium text-gray-700">
                Delivered By
              </label>
              <Dropdown
                id="delivered_by"
                value={formState.delivered_by}
                options={employees.map(emp => ({
                  label: `${emp.first_name} ${emp.last_name}`,
                  value: emp.id,
                }))}
                onChange={(e) => handleDeliveredByChange(e.value)}
                placeholder="Select who delivered"
                className="w-full mt-1"
                filter
              />
            </div>
          )}

          {/* Status Description */}
          <div className="bg-blue-50 p-3 rounded-lg">
            <h4 className="text-sm font-semibold text-blue-800 mb-1">Status Description</h4>
            <p className="text-xs text-blue-700">
              {formState.status === "draft" && "Delivery note is in draft mode and not yet processed."}
              {formState.status === "ready_for_pickup" && "Items are ready for customer pickup."}
              {formState.status === "shipped" && "Items have been shipped from the warehouse."}
              {formState.status === "in_transit" && "Items are currently in transit to the destination."}
              {formState.status === "delivered" && "Items have been successfully delivered to the customer."}
              {formState.status === "returned" && "Items have been returned by the customer."}
              {formState.status === "confirmed" && "Delivery has been confirmed by the customer."}
              {formState.status === "disputed" && "There is a dispute regarding this delivery."}
              {formState.status === "failed" && "Delivery attempt failed."}
              {formState.status === "canceled" && "Delivery has been canceled."}
            </p>
          </div>
        </div>
      </form>
    </Dialog>
  );
};

export default UpdateDeliveryStatus;