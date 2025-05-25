import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { baseURL } from "../../../utils/api";
import useAuth from "../../../hooks/useAuth";
import { Bid } from "../../../redux/slices/types/procurement/Bid";
import useRequestForQuotation from "../../../hooks/procurement/useRequestForQuotation";
import useSuppliers from "../../../hooks/inventory/useSuppliers";
import axios from "axios";
import { toast } from "react-toastify";
import { InputTextarea } from "primereact/inputtextarea";

interface AddOrModifyItemProps {
  visible: boolean;
  onClose: () => void;
  item?: Partial<Bid>;
  onSave: () => void;
}

interface BidAdd {
  rfq_id: string;
  rfq_supplier_id: string;
  description: string;
  quotation_date: string;
  valid_until: string;
  tax_percentage: number;
  payment_terms_compliance:
    | "Fully Compliant"
    | "Partially Compliant"
    | "Non-Compliant";
  delivery_compliance:
    | "Fully Compliant"
    | "Partially Compliant"
    | "Non-Compliant";
  status: string;
  evaluation_notes: string;
  items: Item[];
  attachments?: File[];
}

interface Item {
  id: number;
  rfq_item_id: string;
  unit_price: number;
  quantity: number;
  spec_compliance: "Fully Compliant" | "Partially Compliant" | "Non-Compliant";
  alternate_specs: string;
  vendor_notes: string;
}

const complianceOptions = [
  { label: "Fully Compliant", value: "Fully Compliant" },
  { label: "Partially Compliant", value: "Partially Compliant" },
  { label: "Non-Compliant", value: "Non-Compliant" },
];

const statusOptions = [
  { label: "Received", value: "Received" },
  { label: "Evaluating", value: "Evaluating" },
  { label: "Accepted", value: "Accepted" },
  { label: "Rejected", value: "Rejected" },
];

const AddOrModifyItem: React.FC<AddOrModifyItemProps> = ({
  visible,
  onClose,
  item,
  onSave,
}) => {
  const initialItem: BidAdd = {
    rfq_id: "",
    rfq_supplier_id: "",
    description: "",
    quotation_date: new Date().toISOString().split("T")[0],
    valid_until: "",
    tax_percentage: 0,
    payment_terms_compliance: "Fully Compliant",
    delivery_compliance: "Fully Compliant",
    status: "Received",
    evaluation_notes: "",
    items: [],
  };

  const [formState, setFormState] = useState<BidAdd>(initialItem);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: quotationRequests } = useRequestForQuotation();
  const { data: suppliers, loading: supplierLoading } = useSuppliers();
  const { token } = useAuth();

  useEffect(() => {
    if (item) {
      setFormState({
        rfq_id: item.rfq_id || "",
        rfq_supplier_id: item.rfq_supplier_id || "",
        description: item.description || "",
        quotation_date:
          item.quotation_date || new Date().toISOString().split("T")[0],
        valid_until: item.valid_until || "",
        tax_percentage: item.tax_percentage || 0,
        payment_terms_compliance:
          item.payment_terms_compliance || "Fully Compliant",
        delivery_compliance: item.delivery_compliance || "Fully Compliant",
        status: item.status || "Received",
        evaluation_notes: item.evaluation_notes || "",
        items:
          item.bid_items?.map((item, index) => ({
            id: index + 1,
            rfq_item_id: item.rfq_item_id,
            unit_price: item.unit_price,
            quantity: item.quantity,
            spec_compliance: item.spec_compliance || "Fully Compliant",
            alternate_specs: item.alternate_specs || "",
            vendor_notes: item.vendor_notes || "",
          })) || [],
      });
    } else {
      setFormState(initialItem);
    }
  }, [item]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleDropdownChange = (
    e: DropdownChangeEvent,
    field: keyof BidAdd
  ) => {
    setFormState((prevState) => ({
      ...prevState,
      [field]: e.value,
    }));
  };

  const handleItemChange = (index: number, field: keyof Item, value: any) => {
    const newItems = [...formState.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormState((prevState) => ({
      ...prevState,
      items: newItems,
    }));
  };

  const handleAddItem = () => {
    const newItem: Item = {
      id: Date.now(),
      rfq_item_id: "",
      unit_price: 0,
      quantity: 0,
      spec_compliance: "Fully Compliant",
      alternate_specs: "",
      vendor_notes: "",
    };
    setFormState((prevState) => ({
      ...prevState,
      items: [...prevState.items, newItem],
    }));
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...formState.items];
    newItems.splice(index, 1);
    setFormState((prevState) => ({
      ...prevState,
      items: newItems,
    }));
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const method = "POST";
    const endpoint = item?.id
      ? `/procurement/supplier-quotations/${item.id}/update`
      : "/procurement/supplier-quotations/create";

    try {
      const formData = new FormData();

      // Append basic fields
      formData.append("rfq_id", formState.rfq_id);
      formData.append("rfq_supplier_id", formState.rfq_supplier_id);
      formData.append("description", formState.description);
      formData.append("quotation_date", formState.quotation_date);
      formData.append("valid_until", formState.valid_until);
      formData.append("tax_percentage", formState.tax_percentage.toString());
      formData.append(
        "payment_terms_compliance",
        formState.payment_terms_compliance
      );
      formData.append("delivery_compliance", formState.delivery_compliance);
      formData.append("status", formState.status);
      formData.append("evaluation_notes", formState.evaluation_notes);

      // Append items
      formState.items.forEach((item, index) => {
        formData.append(`items[${index}][rfq_item_id]`, item.rfq_item_id);
        formData.append(
          `items[${index}][unit_price]`,
          item.unit_price.toString()
        );
        formData.append(`items[${index}][quantity]`, item.quantity.toString());
        formData.append(
          `items[${index}][spec_compliance]`,
          item.spec_compliance
        );
        formData.append(
          `items[${index}][alternate_specs]`,
          item.alternate_specs
        );
        formData.append(`items[${index}][vendor_notes]`, item.vendor_notes);
      });

      // Append attachments if any
      if (formState.attachments) {
        formState.attachments.forEach((file, index) => {
          formData.append(`attachments[${index}]`, file);
        });
      }

      await axios({
        url: baseURL + endpoint,
        method,
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token.access_token}`,
        },
      });

      toast.success("Supplier Quotation saved successfully!");
      onSave();
      onClose();
    } catch (error) {
      console.error("Error saving data:", error);
      toast.error("Failed to save bid. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const footer = (
    <div className="flex justify-end space-x-2">
      <Button
        type="button"
        label="Cancel"
        icon="pi pi-times"
        onClick={onClose}
        className="p-button-text !bg-red-500"
        size="small"
        disabled={isSubmitting}
      />
      <Button
        loading={isSubmitting}
        label={item?.id ? "Update" : "Submit"}
        icon="pi pi-check"
        type="submit"
        form="item-form"
        size="small"
      />
    </div>
  );

  const itemEditor = (rowData: Item) => {
    const index = formState.items.findIndex((item) => item.id === rowData.id);
    return (
      <Button
        type="button"
        icon="pi pi-trash"
        className="p-button-rounded p-button-danger !bg-red-500"
        onClick={() => handleRemoveItem(index)}
        title="Delete"
      />
    );
  };

  return (
    <Dialog
      header={item?.id ? "Edit Supplier Quotation" : "Add Supplier Quotation"}
      visible={visible}
      style={{ width: "1500px" }}
      footer={footer}
      onHide={onClose}
    >
      <form
        id="item-form"
        onSubmit={handleSave}
        className="p-fluid grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <div className="p-field">
          <label htmlFor="rfq_id">Quotation Request</label>
          <Dropdown
            required
            id="rfq_id"
            name="rfq_id"
            value={formState.rfq_id}
            options={quotationRequests.map((rfq) => ({
              label: rfq.title,
              value: rfq.id,
            }))}
            onChange={(e) => {
              setFormState((prev) => ({
                ...prev,
                rfq_id: e.value,
                items:
                  quotationRequests
                    .find((rfq) => rfq.id === e.value)
                    ?.rfq_items?.map((item, index) => ({
                      id: index + 1,
                      rfq_item_id: item.id,
                      unit_price: 0,
                      quantity: +item.quantity,
                      spec_compliance: "Fully Compliant",
                      alternate_specs: "",
                      vendor_notes: "",
                    })) || [],
              }));
            }}
            placeholder="Select a Quotation Request"
            filter
            className="w-full"
          />
        </div>

        <div className="p-field">
          <label htmlFor="rfq_supplier_id">Supplier</label>
          <Dropdown
            required
            loading={supplierLoading}
            id="rfq_supplier_id"
            name="rfq_supplier_id"
            value={formState.rfq_supplier_id}
            options={quotationRequests
              .flatMap((qr) => qr.suppliers)
              .map((supplier) => ({
                label: supplier?.supplier?.supplier_name ?? "Unnamed Supplier",
                value: supplier?.id,
              }))}
            onChange={(e) => handleDropdownChange(e, "rfq_supplier_id")}
            placeholder="Select a supplier"
            filter
            className="w-full"
          />
        </div>

        <div className="p-field">
          <label htmlFor="quotation_date">Quotation Date</label>
          <InputText
            id="quotation_date"
            name="quotation_date"
            type="date"
            value={formState.quotation_date}
            onChange={handleInputChange}
            className="w-full"
            required
          />
        </div>

        <div className="p-field">
          <label htmlFor="valid_until">Valid Until</label>
          <InputText
            id="valid_until"
            name="valid_until"
            type="date"
            value={formState.valid_until}
            onChange={handleInputChange}
            className="w-full"
            required
          />
        </div>

        <div className="p-field">
          <label htmlFor="tax_percentage">Tax Percentage</label>
          <InputText
            id="tax_percentage"
            name="tax_percentage"
            type="number"
            step="0.01"
            value={formState.tax_percentage.toString()}
            onChange={handleInputChange}
            className="w-full"
          />
        </div>

        <div className="p-field">
          <label htmlFor="payment_terms_compliance">
            Payment Terms Compliance
          </label>
          <Dropdown
            id="payment_terms_compliance"
            name="payment_terms_compliance"
            value={formState.payment_terms_compliance}
            options={complianceOptions}
            onChange={(e) =>
              handleDropdownChange(e, "payment_terms_compliance")
            }
            className="w-full"
          />
        </div>

        <div className="p-field">
          <label htmlFor="delivery_compliance">Delivery Compliance</label>
          <Dropdown
            id="delivery_compliance"
            name="delivery_compliance"
            value={formState.delivery_compliance}
            options={complianceOptions}
            onChange={(e) => handleDropdownChange(e, "delivery_compliance")}
            className="w-full"
          />
        </div>

        <div className="p-field">
          <label htmlFor="status">Status</label>
          <Dropdown
            id="status"
            name="status"
            value={formState.status}
            options={statusOptions}
            onChange={(e) => handleDropdownChange(e, "status")}
            className="w-full"
          />
        </div>

        <div className="p-field col-span-2">
          <label htmlFor="description">Description</label>
          <InputTextarea
            id="description"
            name="description"
            value={formState.description}
            onChange={handleInputChange}
            rows={3}
            className="w-full"
          />
        </div>

        <div className="p-field col-span-2">
          <label htmlFor="evaluation_notes">Evaluation Notes</label>
          <InputTextarea
            id="evaluation_notes"
            name="evaluation_notes"
            value={formState.evaluation_notes}
            onChange={handleInputChange}
            rows={3}
            className="w-full"
          />
        </div>

        <div className="p-field col-span-2">
          <label htmlFor="attachments">Attachments</label>
          <input
            multiple
            type="file"
            id="attachments"
            name="attachments"
            onChange={(e) => {
              if (e.target.files) {
                setFormState({
                  ...formState,
                  attachments: Array.from(e.target.files),
                });
              }
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-gray-700 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
          />
        </div>

        <div className="col-span-2">
          <DataTable
            footer={
              <div className="p-field col-span-2 w-fit">
                <Button
                  size="small"
                  type="button"
                  label="Add Item"
                  icon="pi pi-plus"
                  onClick={handleAddItem}
                  className="p-button-primary"
                />
              </div>
            }
            value={formState.items}
            className="p-datatable-editable"
          >
            <Column
              field="rfq_item_id"
              header="RFQ Item"
              body={(rowData: Item) => {
                const rfq = quotationRequests.find(
                  (rfq) => rfq.id === formState.rfq_id
                );
                return (
                  <Dropdown
                    value={rowData.rfq_item_id}
                    options={
                      rfq?.items?.map((item) => ({
                        label: item.purchase_request_item.item.name,
                        value: item.id,
                      })) || []
                    }
                    onChange={(e) => {
                      const index = formState.items.findIndex(
                        (item) => item.id === rowData.id
                      );
                      handleItemChange(index, "rfq_item_id", e.value);
                    }}
                    placeholder="Select Item"
                    className="w-full"
                  />
                );
              }}
            />
            <Column
              field="unit_price"
              header="Unit Price"
              body={(rowData) => (
                <InputText
                  type="number"
                  step="0.01"
                  value={rowData.unit_price.toString()}
                  onChange={(e) => {
                    const index = formState.items.findIndex(
                      (item) => item.id === rowData.id
                    );
                    handleItemChange(
                      index,
                      "unit_price",
                      parseFloat(e.target.value)
                    );
                  }}
                  className="w-full"
                />
              )}
            />
            <Column
              field="quantity"
              header="Quantity"
              body={(rowData) => (
                <InputText
                  type="number"
                  value={rowData.quantity.toString()}
                  onChange={(e) => {
                    const index = formState.items.findIndex(
                      (item) => item.id === rowData.id
                    );
                    handleItemChange(
                      index,
                      "quantity",
                      parseInt(e.target.value)
                    );
                  }}
                  className="w-full"
                />
              )}
            />
            <Column
              field="spec_compliance"
              header="Spec Compliance"
              body={(rowData) => (
                <Dropdown
                  value={rowData.spec_compliance}
                  options={complianceOptions}
                  onChange={(e) => {
                    const index = formState.items.findIndex(
                      (item) => item.id === rowData.id
                    );
                    handleItemChange(index, "spec_compliance", e.value);
                  }}
                  className="w-full"
                />
              )}
            />
            <Column
              field="alternate_specs"
              header="Alternate Specs"
              body={(rowData) => (
                <InputText
                  value={rowData.alternate_specs}
                  onChange={(e) => {
                    const index = formState.items.findIndex(
                      (item) => item.id === rowData.id
                    );
                    handleItemChange(index, "alternate_specs", e.target.value);
                  }}
                  className="w-full"
                />
              )}
            />
            <Column
              field="vendor_notes"
              header="Vendor Notes"
              body={(rowData) => (
                <InputTextarea
                  value={rowData.vendor_notes}
                  onChange={(e) => {
                    const index = formState.items.findIndex(
                      (item) => item.id === rowData.id
                    );
                    handleItemChange(index, "vendor_notes", e.target.value);
                  }}
                  rows={2}
                  className="w-full"
                />
              )}
            />
            <Column
              header="Actions"
              body={itemEditor}
              style={{ width: "8rem" }}
            />
          </DataTable>
        </div>
      </form>
    </Dialog>
  );
};

export default AddOrModifyItem;
