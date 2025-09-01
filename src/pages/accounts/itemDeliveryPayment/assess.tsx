import React from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputTextarea } from "primereact/inputtextarea";

interface SettlementDetailsModalProps {
  settlement: any | null;
  visible: boolean;
  onHide: () => void;
  onApprove: (id: string, remarks: string) => void;
  onReject: (id: string, remarks: string) => void;
}

const SettlementDetailsModal: React.FC<SettlementDetailsModalProps> = ({
  settlement,
  visible,
  onHide,
  onApprove,
  onReject,
}) => {
  const [remarks, setRemarks] = React.useState("");

  if (!settlement) return null;

  return (
    <Dialog
      header="Settlement Details"
      visible={visible}
      style={{ width: "50vw" }}
      modal
      className="p-4"
      onHide={onHide}
    >
      <div className="space-y-4">
        {/* Supplier Info */}
        <div className="bg-gray-50 rounded-lg p-3 shadow">
          <h3 className="font-semibold text-gray-700 mb-2">Supplier</h3>
          <p><span className="font-medium">Name:</span> {settlement.delivery?.supplier?.name}</p>
          <p><span className="font-medium">Phone:</span> {settlement.delivery?.supplier?.phone}</p>
          <p><span className="font-medium">Email:</span> {settlement.delivery?.supplier?.email}</p>
        </div>

        {/* Item / Delivery Info */}
        <div className="bg-gray-50 rounded-lg p-3 shadow">
          <h3 className="font-semibold text-gray-700 mb-2">Delivery</h3>
          <p><span className="font-medium">Item:</span> {settlement.delivery?.item?.name}</p>
          <p><span className="font-medium">Quantity:</span> {settlement.delivery?.quantity} {settlement.delivery?.uom?.abbreviation}</p>
          <p><span className="font-medium">Warehouse:</span> {settlement.delivery?.warehouse?.name} ({settlement.delivery?.warehouse?.location})</p>
          <p><span className="font-medium">Delivery Date:</span> {new Date(settlement.delivery?.delivery_date).toLocaleDateString()}</p>
        </div>

        {/* Financial Details */}
        <div className="bg-gray-50 rounded-lg p-3 shadow">
          <h3 className="font-semibold text-gray-700 mb-2">Financials</h3>
          <p><span className="font-medium">Good Beans Rate:</span> {settlement.good_beans_rate}</p>
          <p><span className="font-medium">Good Beans Cost:</span> {settlement.good_beans_cost}</p>
          <p><span className="font-medium">Defect Rate:</span> {settlement.defect_rate}</p>
          <p><span className="font-medium">Defect Price:</span> {settlement.defect_calculated_price}</p>
          <p><span className="font-medium">Moisture %:</span> {settlement.moisture_percentage}</p>
          <p><span className="font-medium">Preparation Cost:</span> {settlement.preparation_cost}</p>
          <p className="font-semibold text-green-700">Total Payable: {settlement.total_payable}</p>
          <p><span className="font-medium">Total Paid:</span> {settlement.total_paid}</p>
          <p><span className="font-medium">Balance:</span> {settlement.balance}</p>
          <p><span className="font-medium">Status:</span> {settlement.status}</p>
        </div>

        {/* Remarks */}
        <div>
          <h3 className="font-semibold text-gray-700 mb-2">Remarks</h3>
          <InputTextarea
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            rows={3}
            className="w-full"
            placeholder="Enter remarks here..."
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 mt-4">
          <Button
            label="Reject"
            icon="pi pi-times"
                      severity="danger"
                      className="!bg-red-500"
            onClick={() => onReject(settlement.id, remarks)}
          />
          <Button
            label="Approve"
            icon="pi pi-check"
            severity="success"
            onClick={() => onApprove(settlement.id, remarks)}
          />
        </div>
      </div>
    </Dialog>
  );
};

export default SettlementDetailsModal;
