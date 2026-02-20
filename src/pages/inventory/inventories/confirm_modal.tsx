import React, { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Card } from "primereact/card";
import { Badge } from "primereact/badge";
import { Message } from "primereact/message";

import useAuth from "../../../hooks/useAuth";
import { createRequest } from "../../../utils/api";

interface ConfirmProps {
  record_id: number;
  warehouse_id: number;
  visible: boolean;
  onClose: () => void;
  onSave: () => void;
  refresh: any;
  record: any;
}

const ConfirmModal: React.FC<ConfirmProps> = ({
  visible,
  onClose,
  record_id,
  onSave,
  warehouse_id,
  refresh,
  record
}) => {
  const [formState, setFormState] = useState({
    quantity: 1,
    received_by: "",
    delivered_by: "",
    warehouse_id,
    delivery_remarks: "",
    movement_date: new Date().toISOString().split('T')[0]
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dateError, setDateError] = useState("");

  const { token } = useAuth();

  useEffect(() => {
    if (record) {
      setFormState({
        quantity: parseFloat(record.quantity) || 1,
        received_by: "",
        delivered_by: "",
        warehouse_id: record.warehouse_id || warehouse_id,
        delivery_remarks: "",
        movement_date: new Date().toISOString().split('T')[0]
      });
      setDateError(""); // Reset error when record changes
    }
  }, [record, warehouse_id]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    
    if (name === "movement_date") {
      // Validate that receipt date is not earlier than transfer date
      if (record?.movement_date && value < record.movement_date) {
        setDateError(`Receipt date cannot be earlier than the transfer date (${new Date(record.movement_date).toLocaleDateString()})`);
      } else {
        setDateError("");
      }
    }
    
    setFormState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Final date validation before submission
    if (record?.movement_date && formState.movement_date < record.movement_date) {
      setDateError(`Receipt date cannot be earlier than the transfer date (${new Date(record.movement_date).toLocaleDateString()})`);
      return;
    }

    setIsSubmitting(true);

    try {
      const method = "POST";
      const endpoint = `/inventories/${record_id}/confirmreceiptstockmovement`;

      const data = {
        ...formState,
        quantity: parseFloat(formState.quantity.toString())
      };

      await createRequest(
        endpoint,
        token.access_token,
        data,
        onSave,
        method
      );
      
      onSave();
      onClose();
      refresh();
    } catch (error) {
      console.error("Error saving item", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusSeverity = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'warning';
      case 'confirmed':
        return 'success';
      case 'reversed':
        return 'danger';
      default:
        return 'info';
    }
  };

  const isFormValid = () => {
    return (
      formState.quantity > 0 &&
      formState.received_by.trim() !== "" &&
      formState.delivered_by.trim() !== "" &&
      formState.movement_date !== "" &&
      !dateError
    );
  };

  const footer = (
    <div className="flex justify-end space-x-2">
      <Button
        label="Cancel"
        icon="pi pi-times"
        onClick={onClose}
        className="p-button-text p-button-danger !bg-red-500"
        size="small"
        disabled={isSubmitting}
      />
      <Button
        label="Confirm Receipt"
        icon="pi pi-check"
        type="submit"
        form="item-form"
        size="small"
        loading={isSubmitting}
        disabled={isSubmitting || !isFormValid()}
        className="p-button-success"
      />
    </div>
  );

  return (
    <Dialog
      header="Confirm Stock Transfer Receipt"
      visible={visible}
      style={{ width: "900px" }}
      footer={footer}
      onHide={onClose}
    >
      <div className="space-y-6">
        {/* Transfer Details Summary */}
        {record && (
          <Card className="shadow-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-bold text-lg text-900 mb-3">Transfer Details</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-600 font-medium">Item Name:</span>
                    <span className="text-900 font-semibold">{record.item_name}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-600 font-medium">Transfer ID:</span>
                    <span className="text-900 font-mono text-sm">{record.unique_id}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-600 font-medium">Source Warehouse:</span>
                    <span className="text-900">{record.warehouse_name}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-600 font-medium">Original Quantity:</span>
                    <span className="text-900 font-bold">{parseFloat(record.quantity).toLocaleString()} units</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-600 font-medium">Transfer Date:</span>
                    <span className="text-900">
                      {new Date(record.movement_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-600 font-medium">Current Status:</span>
                    <Badge 
                      value={record.status?.toUpperCase()} 
                      severity={getStatusSeverity(record.status)}
                      className="font-bold"
                    />
                  </div>
                  
                  {record.remarks && (
                    <div className="flex justify-between">
                      <span className="text-600 font-medium">Remarks:</span>
                      <span className="text-900 text-right max-w-xs">{record.remarks}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="border-l pl-4">
                <h3 className="font-bold text-lg text-900 mb-3">Receipt Information</h3>
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 rounded border border-blue-200">
                    <div className="flex items-center gap-2 text-blue-700">
                      <i className="pi pi-info-circle"></i>
                      <span className="font-semibold">You are about to confirm receipt of this stock transfer.</span>
                    </div>
                    <p className="text-blue-600 text-sm mt-2">
                      Please verify the details above and fill in the receipt information below.
                    </p>
                  </div>
                  
                  <div className="p-3 bg-yellow-50 rounded border border-yellow-200">
                    <div className="flex items-center gap-2 text-yellow-700">
                      <i className="pi pi-exclamation-triangle"></i>
                      <span className="font-semibold">Important:</span>
                    </div>
                    <ul className="text-yellow-600 text-sm mt-1 list-disc list-inside space-y-1">
                      <li>Verify the quantity received matches the transfer</li>
                      <li>Ensure the item condition is acceptable</li>
                      <li>Record any discrepancies in the delivery remarks</li>
                      <li>Receipt date cannot be earlier than transfer date</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Receipt Form */}
        <Card>
          <form
            id="item-form"
            onSubmit={handleSave}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div className="p-field">
              <label className="font-semibold block mb-2" htmlFor="quantity">
                Quantity Received *
              </label>
              <InputText
                id="quantity"
                name="quantity"
                type="number"
                value={formState.quantity?.toString() || ""}
                onChange={handleInputChange}
                required
                className="w-full"
                min="1"
                max={record?.quantity || 999999}
                tooltip={`Maximum: ${parseFloat(record?.quantity || 0).toLocaleString()} units`}
              />
              <small className="text-500">
                Original: {parseFloat(record?.quantity || 0).toLocaleString()} units
              </small>
            </div>

            <div className="p-field">
              <label className="font-semibold block mb-2" htmlFor="received_by">
                Received By *
              </label>
              <InputText
                id="received_by"
                name="received_by"
                type="text"
                value={formState.received_by}
                onChange={handleInputChange}
                required
                className="w-full"
                placeholder="Enter receiver's name"
              />
            </div>

            <div className="p-field">
              <label className="font-semibold block mb-2" htmlFor="delivered_by">
                Delivered By *
              </label>
              <InputText
                id="delivered_by"
                name="delivered_by"
                type="text"
                value={formState.delivered_by}
                onChange={handleInputChange}
                required
                className="w-full"
                placeholder="Enter deliverer's name"
              />
            </div>

            <div className="p-field">
              <label className="font-semibold block mb-2" htmlFor="movement_date">
                Receipt Date *
              </label>
              <InputText
                id="movement_date"
                name="movement_date"
                type="date"
                value={formState.movement_date}
                onChange={handleInputChange}
                className="w-full"
                required
                max={new Date().toISOString().split('T')[0]}
                min={record?.movement_date} // Set minimum date to transfer date
              />
              {dateError && (
                <Message 
                  severity="error" 
                  text={dateError} 
                  className="mt-2 w-full" 
                />
              )}
              <small className="text-500 block mt-1">
                Must be on or after {record?.movement_date ? new Date(record.movement_date).toLocaleDateString() : 'transfer date'}
              </small>
            </div>

            <div className="p-field md:col-span-2">
              <label className="font-semibold block mb-2" htmlFor="delivery_remarks">
                Delivery Remarks
                <span className="text-500 font-normal ml-1">(Optional - note any discrepancies or issues)</span>
              </label>
              <InputText
                id="delivery_remarks"
                name="delivery_remarks"
                value={formState.delivery_remarks}
                onChange={handleInputChange}
                className="w-full"
                placeholder="Note any issues with the delivery, quantity differences, or item condition..."
              />
            </div>
          </form>
        </Card>
      </div>
    </Dialog>
  );
};

export default ConfirmModal;