import React, { useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { RootState } from "../../../redux/store";
import { baseURL } from "../../../utils/api";

// PrimeReact imports
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";

interface Props {
  setIsModalOpen: (val: boolean) => void;
  refresh: () => void;
}

const AddLevelModal: React.FC<Props> = ({ setIsModalOpen, refresh }) => {
  const token = useSelector(
    (state: RootState) => state.userAuth.token.access_token
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    level: "",
    approval_type: "",
    mandate: "",
  });

  const handleInputChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddRole = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error("Role name is required!");
      return;
    }
    try {
      setIsSubmitting(true);
      const tempdata = {
        ...formData,
        level: Number(formData.level),
        mandate: Number(formData.mandate),
      };

      const response = await fetch(
        `${baseURL}/accounts/approval-level/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(tempdata),
        }
      );

      const data = await response.json();
      if (data.success) {
        refresh();
        toast.success("Approval level added successfully!");
        setFormData({ name: "", level: "", mandate: "", approval_type: "" });
        setIsModalOpen(false);
      } else {
        toast.error("Failed to add approval level");
      }
    } catch (error) {
      console.log(error);
      toast.error("An error occurred while adding the approval level.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const appType: Record<string, string> = {
    Cash: "Cash Requisition",
    Fuel: "Fuel Requisition",
    Repair: "Repair & Maintenance",
    PurchaseRequest: "Purchase Request",
    PurchaseOrder: "Purchase Order",
    SalesOrder: "Sales Order",
    Store: "Store Requisition",
    PayRoll: "Payroll Management",
    Disposal: "Asset Disposal",
    QualityAssurance: "Quality Assurance",
    PurchaseQuoteEvaluation: "Purchase Quote Evaluation",
    Disposals: "Disposals Management",
    AssetFinancing: "Asset Financing",
    Offers: "Supplier Offers",
    InputRequest: "Input Request",
    SupplierLoan: "Supplier Loan",
  };

  const appTypeOptions = Object.entries(appType).map(([key, label]) => ({
    label,
    value: key,
  }));

  const rankOptions = [
    { label: "1", value: "1" },
    { label: "2", value: "2" },
    { label: "3", value: "3" },
  ];

  const mandateOptions = [
    { label: "1", value: "1" },
    { label: "2", value: "2" },
    { label: "3", value: "3" },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center overflow-auto z-50">
      <div className="bg-white p-6 rounded mt-12 shadow-md w-[500px]">
        <h2 className="text-xl font-bold mb-4">Create Level</h2>
        <div className="flex flex-col gap-4">
          {/* Name */}
          <div>
            <label className="block text-gray-700 mb-1">Name</label>
            <InputText
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Enter name"
              className="w-full"
            />
          </div>

          {/* Approval Type */}
          <div>
            <label className="block text-gray-700 mb-1">Approval Type</label>
            <Dropdown
              value={formData.approval_type}
              options={appTypeOptions}
              onChange={(e) => handleInputChange("approval_type", e.value)}
              placeholder="Select approval type"
              className="w-full"
            />
          </div>

          {/* Rank */}
          <div>
            <label className="block text-gray-700 mb-1">Rank</label>
            <Dropdown
              value={formData.level}
              options={rankOptions}
              onChange={(e) => handleInputChange("level", e.value)}
              placeholder="Select rank"
              className="w-full"
            />
          </div>

          {/* Mandate */}
          <div>
            <label className="block text-gray-700 mb-1">Mandate</label>
            <Dropdown
              value={formData.mandate}
              options={mandateOptions}
              onChange={(e) => handleInputChange("mandate", e.value)}
              placeholder="Select mandate"
              className="w-full"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 mt-4">
          <Button
            label="Cancel"
            onClick={() => setIsModalOpen(false)}
            className="p-button-secondary"
            style={{
              backgroundColor: "#adb5bd",
              borderColor: "#adb5bd"
          }}
          />
          <Button
            label={isSubmitting ? "Creating..." : "Create Level"}
            onClick={handleAddRole}
            disabled={isSubmitting}
            loading={isSubmitting}
            className="p-button-raised p-button-success"
            style={{ background: "teal", borderColor: "teal" }}
          />
        </div>
      </div>
    </div>
  );
};

export default AddLevelModal;
