import React, { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputTextarea } from "primereact/inputtextarea";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";
import { InputNumber } from "primereact/inputnumber";
import { Card } from "primereact/card";
import usePaymentMethods from "../../../../hooks/procurement/usePaymentMethods";
import { toast } from "react-toastify";
import { apiRequest } from "../../../../utils/api";
import { ACCOUNTS_ENDPOINTS } from "../../../../api/accountsEndpoints";
import { useSelector } from "react-redux";
import { RootState } from "../../../../redux/store";

interface DisburseModalProps {
  visible: boolean;
  onHide: () => void;
  requisition: any;
  onCompleted: () => void;
}

interface DisbursementItem {
  item_id: string;
  amount: number;
}

interface DisbursementFormData {
  payment_method_id: string;
  transaction_date: Date;
  notes: string;
  items: DisbursementItem[];
}

const DisburseModal: React.FC<DisburseModalProps> = ({ 
  visible, 
  onHide, 
  requisition, 
  onCompleted 
}) => {
  const { data: paymentMethods } = usePaymentMethods();
  const [isLoading, setIsLoading] = useState(false)
  const token = useSelector((state: RootState) => state.userAuth.token);
  
  const [formData, setFormData] = useState<DisbursementFormData>({
    payment_method_id: "",
    transaction_date: new Date(),
    notes: "",
    items: []
  });

  useEffect(() => {
    if (requisition) {
      // Initialize items with the requisition items and their approved amounts
      const initialItems = requisition.cash_requisition_items.map((item: any) => ({
        item_id: item.id,
        amount: parseFloat(item.approved_total_cost) || parseFloat(item.total_cost) || 0
      }));
      
      setFormData({
        payment_method_id: "",
        transaction_date: new Date(),
        notes: `Payment for requisition ${requisition.requisition_no}`,
        items: initialItems
      });
    }
  }, [requisition]);

  const updateItemAmount = (itemId: string, amount: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.item_id === itemId ? { ...item, amount } : item
      )
    }));
  };

  const calculateTotalAmount = () => {
    return formData.items.reduce((total, item) => total + item.amount, 0);
  };

  const handleSubmit = async () => {
    if (!formData.payment_method_id) {
      toast.error("Please select a payment method");
      return;
    }

    if (formData.items.some(item => item.amount <= 0)) {
      toast.error("All item amounts must be greater than 0");
      return;
    }

    const payload = {
      payment_method_id: formData.payment_method_id,
      transaction_date: formData.transaction_date.toISOString().split("T")[0],
      notes: formData.notes,
      items: formData.items
    };

    setIsLoading(false)

    try {
      await apiRequest(
        ACCOUNTS_ENDPOINTS.CASH_REQUISITIONS.DISBURSE(requisition.id), 
        "POST", 
        token.access_token, 
        payload
      );
      
      toast.success("Requisition has been successfully disbursed");
      onCompleted();
      setIsLoading(false)
      onHide();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to disburse requisition");
    }
  };

  if (!requisition) return null;

  return (
    <Dialog
      header={`Disburse Requisition - ${requisition.requisition_no}`}
      visible={visible}
      style={{ width: "60vw", minWidth: "500px", maxWidth: "800px" }}
      modal
      onHide={onHide}
      className="disburse-dialog"
    >
      <div className="grid gap-4">
        {/* Requisition Summary */}
        <div className="col-12">
          <Card className="bg-gray-50">
            <div className="grid">
              <div className="col-6">
                <span className="font-medium text-gray-700">Department:</span>
                <span className="ml-2 text-gray-900">{requisition.department?.name}</span>
              </div>
              <div className="col-6">
                <span className="font-medium text-gray-700">Requested By:</span>
                <span className="ml-2 text-gray-900">
                  {requisition.requested_by?.first_name} {requisition.requested_by?.last_name}
                </span>
              </div>
              <div className="col-12 mt-2">
                <span className="font-medium text-gray-700">Title:</span>
                <span className="ml-2 text-gray-900">{requisition.title}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Items to Disburse */}
        <div className="col-12">
          <h4 className="text-lg font-semibold mb-3">Disbursement Items</h4>
          {requisition.cash_requisition_items.map((item: any, index: number) => {
            const disbursementItem = formData.items.find(i => i.item_id === item.id);
            const amount = disbursementItem?.amount || 0;
            
            return (
              <Card key={item.id} className="mb-3">
                <div className="grid gap-3">
                  <div className="col-12">
                    <h5 className="m-0">Item {index + 1}: {item.budget_item?.name}</h5>
                    <p className="text-sm text-gray-600 mt-1">
                      {item.specifications || "No specifications"}
                    </p>
                  </div>
                  
                  <div className="col-12 md:col-4">
                    <label className="block text-900 font-medium mb-2">Approved Quantity</label>
                    <InputNumber
                      value={parseFloat(item.approved_quantity || item.quantity)}
                      className="w-full"
                      disabled
                    />
                  </div>
                  
                  <div className="col-12 md:col-4">
                    <label className="block text-900 font-medium mb-2">Approved Unit Cost</label>
                    <InputNumber
                      value={parseFloat(item.approved_unit_cost || item.unit_cost)}
                      className="w-full"
                      disabled
                    />
                  </div>
                  
                  <div className="col-12 md:col-4">
                    <label className="block text-900 font-medium mb-2">Disbursement Amount <span className="text-red-500">*</span></label>
                    <InputNumber
                      value={amount}
                      onValueChange={(e) => updateItemAmount(item.id, e.value || 0)}
                      className="w-full"
                      min={0}
                      max={parseFloat(item.approved_total_cost || item.total_cost) || 0}
                    />
                    <small className="text-gray-500">
                      Max: {parseFloat(item.approved_total_cost || item.total_cost).toLocaleString()}
                    </small>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Payment Details */}
        <div className="col-12 grid gap-3">
          <div className="col-12 md:col-6">
            <label className="block text-900 font-medium mb-2">Payment Method <span className="text-red-500">*</span></label>
            <Dropdown
              value={formData.payment_method_id}
              options={paymentMethods.map(pm => ({ 
                label: pm.name, 
                value: pm.id 
              }))}
              onChange={(e) => setFormData({ ...formData, payment_method_id: e.value })}
              placeholder="Select Payment Method"
              className="w-full"
            />
          </div>

          <div className="col-12 md:col-6">
            <label className="block text-900 font-medium mb-2">Transaction Date <span className="text-red-500">*</span></label>
            <Calendar
              value={formData.transaction_date}
              onChange={(e) => setFormData({ ...formData, transaction_date: e.value as Date })}
              showIcon
              dateFormat="yy-mm-dd"
              className="w-full"
            />
          </div>

          <div className="col-12">
            <label className="block text-900 font-medium mb-2">Notes</label>
            <InputTextarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              placeholder="Payment notes"
              className="w-full"
            />
          </div>
        </div>

        {/* Total Amount */}
        <div className="col-12">
          <Card className="bg-blue-50 border-1 border-blue-200">
            <div className="flex justify-between items-center">
              <span className="text-xl font-bold">Total Disbursement Amount:</span>
              <span className="text-xl font-bold">
                {calculateTotalAmount().toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="col-12 flex justify-end gap-2 mt-4">
          <Button
            label="Cancel"
            icon="pi pi-times"
            className="p-button-text !bg-red-500"
            onClick={onHide}
          />
          <Button
             label={isLoading ? "Disbursing" : "Disburse"}
            icon="pi pi-check"
            className="p-button-success"
            onClick={handleSubmit}
            loading={isLoading}
            disabled={(!formData.payment_method_id || calculateTotalAmount() <= 0) || isLoading}
          />
        </div>
      </div>

      <style jsx>{`
        .disburse-dialog :global(.p-dialog-content) {
          max-height: 70vh;
          overflow-y: auto;
        }
      `}</style>
    </Dialog>
  );
};

export default DisburseModal;