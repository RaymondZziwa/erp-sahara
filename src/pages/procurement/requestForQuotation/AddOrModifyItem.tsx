import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { MultiSelect } from "primereact/multiselect";
import { createRequest } from "../../../utils/api";
import useAuth from "../../../hooks/useAuth";
import { RequestForQuotation } from "../../../redux/slices/types/procurement/RequestForQuotation";

import usePurchaseRequests from "../../../hooks/procurement/usePurchaseRequests";
import useSuppliers from "../../../hooks/procurement/useSuppliers";
import useUnitsOfMeasurement from "../../../hooks/inventory/useUnitsOfMeasurement";


interface RequestForQuotationAdd {
  purchase_request_id: string;
  rfq_type: "Open" | "Selective" | "Single Source";
  title: string;
  issue_date: string;
  delivery_date: string;
  closing_date: string;
  submission_deadline: string;
  delivery_requirements: string;
  payment_terms: string;
  special_instructions: string;
  items: Item[];
  suppliers: Supplier[];
}

interface Item {
  index: number;
  purchase_request_item_id: string;
  quantity: number;
  uom: string;
  item_description: string;
  technical_specifications: string;
  delivery_schedule: string;
}

interface Supplier {
  supplier_id: string;
  invitation_status: "Pending" | "Invited";
}

interface AddOrModifyItemProps {
  visible: boolean;
  onClose: () => void;
  item?: Partial<RequestForQuotation>;
  onSave: () => void;
}

const AddOrModifyItem: React.FC<AddOrModifyItemProps> = ({
  visible,
  onClose,
  item,
  onSave,
}) => {
  const initialItem: RequestForQuotationAdd = {
    purchase_request_id: "",
    rfq_type: "Open",
    title: "",
    issue_date: "",
    delivery_date: "",
    closing_date: "",
    submission_deadline: "",
    delivery_requirements: "",
    payment_terms: "",
    special_instructions: "",
    items: [],
    suppliers: [],
  };

  const [formState, setFormState] =
    useState<RequestForQuotationAdd>(initialItem);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: purchaseRequisitions } = usePurchaseRequests();
  const { data: uoms } = useUnitsOfMeasurement();
  const { data: suppliers } = useSuppliers();
  const [selectedRequisitionItems, setSelectedRequisitionItems] = useState<
    any[]
  >([]);
  const { token } = useAuth();

  const rfqTypes = [
    { label: "Open", value: "Open" },
    { label: "Selective", value: "Selective" },
    { label: "Single Source", value: "Single Source" },
  ];

  useEffect(() => {
    if (item) {
      setFormState({
        purchase_request_id: item.purchase_request_id ?? "",
        rfq_type: item.rfq_type ?? "Open",
        title: item.title ?? "",
        issue_date: item.issue_date ?? "",
        delivery_date: item.delivery_date ?? "",
        closing_date: item.closing_date ?? "",
        submission_deadline: item.submission_deadline ?? "",
        delivery_requirements: item.delivery_requirements ?? "",
        payment_terms: item.payment_terms ?? "",
        special_instructions: item.special_instructions ?? "",
        items:
          item.rfq_items && item.rfq_items.length > 0
            ? item.rfq_items.map((i, index) => ({
                index,
                purchase_request_item_id: i.purchase_request_item_id,
                quantity: i.quantity,
                uom: i.uom ?? "",
                item_description: i.item_description ?? "",
                technical_specifications: i.technical_specifications ?? "",
                delivery_schedule: i.delivery_schedule ?? "",
              }))
            : [],
        suppliers:
          item.rfq_suppliers && item.rfq_suppliers.length > 0
            ? item.rfq_suppliers.map((s) => ({
                supplier_id: s.supplier_id,
                invitation_status: s.invitation_status ?? "Pending",
              }))
            : [],
      });
    } else {
      setFormState(initialItem);
    }
  }, [item]);

  useEffect(() => {
    const selectedRequisition = purchaseRequisitions.find(
      (req) => req.id === formState.purchase_request_id
    );

    if (selectedRequisition) {
      setSelectedRequisitionItems(selectedRequisition.items || []);
    } else {
      setSelectedRequisitionItems([]);
    }
  }, [formState.purchase_request_id, purchaseRequisitions]);

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
    field: keyof RequestForQuotationAdd
  ) => {
    setFormState((prevState) => ({
      ...prevState,
      [field]: e.value as RequestForQuotationAdd[typeof field],
    }));
  };

  const handleItemDropdownChange = (
    e: DropdownChangeEvent,
    index: number,
    field: keyof Item
  ) => {
    const updatedItems = [...formState.items];
    // @ts-ignore
    updatedItems[index][field] = e.value as Item[typeof field];
    setFormState((prevState) => ({
      ...prevState,
      items: updatedItems,
    }));
  };

  const handleSupplierChange = (e: any) => {
    const selectedSuppliers = e.value.map((id: string) => ({
      supplier_id: id,
      invitation_status: "Pending",
    }));
    setFormState((prevState) => ({
      ...prevState,
      suppliers: selectedSuppliers,
    }));
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const method = item?.id ? "PUT" : "POST";
    const endpoint = item?.id
      ? `/procurement/rfq/${item.id}/update`
      : "/procurement/rfq/create";

    const payload = {
      ...formState,
      closing_date: formState.submission_deadline, // Assuming closing_date should match submission_deadline
    };

    await createRequest(endpoint, token.access_token, payload, onSave, method);
    setIsSubmitting(false);
    onSave();
    onClose();
  };

  const footer = (
    <div className="flex justify-end space-x-2">
      <Button
        label="Cancel"
        icon="pi pi-times"
        onClick={onClose}
        className="p-button-text !bg-red-500 hover:bg-red-400"
        size="small"
        disabled={isSubmitting}
      />
      <Button
        label={item?.id ? "Update" : "Submit"}
        icon="pi pi-check"
        type="submit"
        form="item-form"
        size="small"
        loading={isSubmitting}
      />
    </div>
  );

  return (
    <Dialog
      header={
        item?.id ? "Edit Request for Quotation" : "Add Request for Quotation"
      }
      visible={visible}
      className="w-3/4"
      footer={footer}
      onHide={onClose}
    >
      <form
        id="item-form"
        onSubmit={handleSave}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4"
      >
        <div className="p-field">
          <label htmlFor="purchase_request_id">
            Purchase Request<span className="text-red-700">*</span>
          </label>
          <Dropdown
            id="purchase_request_id"
            value={formState.purchase_request_id}
            onChange={(e) => handleDropdownChange(e, "purchase_request_id")}
            options={purchaseRequisitions
              .filter((pr) => pr.status.toLowerCase() === "approved")
              .map((req) => ({
                label: `${req.title} (${req.request_no})`,
                value: req.id,
              }))}
            placeholder="Select Purchase Request"
            filter
            className="w-full"
          />
        </div>

        <div className="p-field">
          <label htmlFor="rfq_type">
            RFQ Type<span className="text-red-700">*</span>
          </label>
          <Dropdown
            id="rfq_type"
            value={formState.rfq_type}
            onChange={(e) => handleDropdownChange(e, "rfq_type")}
            options={rfqTypes}
            placeholder="Select RFQ Type"
            className="w-full"
          />
        </div>

        <div className="p-field">
          <label htmlFor="title">
            Title<span className="text-red-700">*</span>
          </label>
          <InputText
            id="title"
            name="title"
            value={formState.title}
            onChange={handleInputChange}
            required
            className="w-full"
          />
        </div>

        <div className="p-field">
          <label htmlFor="issue_date">
            Issue Date<span className="text-red-700">*</span>
          </label>
          <InputText
            id="issue_date"
            name="issue_date"
            value={formState.issue_date}
            onChange={handleInputChange}
            required
            type="date"
            className="w-full"
          />
        </div>

        <div className="p-field">
          <label htmlFor="delivery_date">
            Delivery Date<span className="text-red-700">*</span>
          </label>
          <InputText
            id="delivery_date"
            name="delivery_date"
            value={formState.delivery_date}
            onChange={handleInputChange}
            required
            type="date"
            className="w-full"
          />
        </div>

        <div className="p-field">
          <label htmlFor="submission_deadline">
            Submission Deadline<span className="text-red-700">*</span>
          </label>
          <InputText
            id="submission_deadline"
            name="submission_deadline"
            value={formState.submission_deadline}
            onChange={handleInputChange}
            required
            type="date"
            className="w-full"
          />
        </div>

        <div className="p-field col-span-2">
          <label htmlFor="delivery_requirements">
            Delivery Requirements<span className="text-red-700">*</span>
          </label>
          <InputTextarea
            id="delivery_requirements"
            name="delivery_requirements"
            value={formState.delivery_requirements}
            onChange={handleInputChange}
            className="w-full"
          />
        </div>

        <div className="p-field">
          <label htmlFor="payment_terms">
            Payment Terms<span className="text-red-700">*</span>
          </label>
          <InputText
            id="payment_terms"
            name="payment_terms"
            value={formState.payment_terms}
            onChange={handleInputChange}
            className="w-full"
          />
        </div>

        <div className="p-field">
          <label htmlFor="special_instructions">
            Special Instructions<span className="text-red-700">*</span>
          </label>
          <InputText
            id="special_instructions"
            name="special_instructions"
            value={formState.special_instructions}
            onChange={handleInputChange}
            className="w-full"
          />
        </div>

        <div className="p-field col-span-2">
          <label htmlFor="suppliers">
            Suppliers<span className="text-red-700">*</span>
          </label>
          <MultiSelect
            value={formState.suppliers.map((s) => s.supplier_id)}
            options={suppliers.map((supplier) => ({
              label: supplier.supplier_name,
              value: supplier.id,
            }))}
            onChange={handleSupplierChange}
            placeholder="Select Suppliers"
            filter
            className="w-full"
          />
        </div>

        <div className="p-field col-span-2">
          <h3 className="font-semibold">
            Items<span className="text-red-700">*</span>
          </h3>
          <DataTable
            value={formState.items}
            dataKey="index"
            className="p-datatable-customers"
          >
            <Column
              header="Item"
              body={(rowData, { rowIndex }) => (
                <Dropdown
                  value={rowData.purchase_request_item_id}
                  options={selectedRequisitionItems.map((item) => ({
                    label: item.item.name,
                    value: item.id,
                  }))}
                  onChange={(e) =>
                    handleItemDropdownChange(
                      e,
                      rowIndex,
                      "purchase_request_item_id"
                    )
                  }
                  placeholder="Select Item"
                  className="w-full"
                />
              )}
            />
            <Column
              header="Quantity"
              body={(rowData, { rowIndex }) => (
                <InputText
                  type="number"
                  value={rowData.quantity}
                  onChange={(e) => {
                    const updatedItems = [...formState.items];
                    updatedItems[rowIndex].quantity = Number(e.target.value);
                    setFormState((prevState) => ({
                      ...prevState,
                      items: updatedItems,
                    }));
                  }}
                  className="w-full"
                />
              )}
            />
            <Column
              header="Unit of Measure"
              body={(rowData, { rowIndex }) => (
                <Dropdown
                  value={rowData.uom}
                  options={uoms.map((uom) => ({
                    label: uom.name,
                    value: uom.id,
                  }))}
                  onChange={(e) => handleItemDropdownChange(e, rowIndex, "uom")}
                  placeholder="Select UOM"
                  className="w-full"
                />
              )}
            />
            <Column
              header="Description"
              body={(rowData, { rowIndex }) => (
                <InputTextarea
                  value={rowData.item_description}
                  onChange={(e) => {
                    const updatedItems = [...formState.items];
                    updatedItems[rowIndex].item_description = e.target.value;
                    setFormState((prevState) => ({
                      ...prevState,
                      items: updatedItems,
                    }));
                  }}
                  className="w-full"
                  rows={2}
                />
              )}
            />
            <Column
              header="Tech Specs"
              body={(rowData, { rowIndex }) => (
                <InputTextarea
                  value={rowData.technical_specifications}
                  onChange={(e) => {
                    const updatedItems = [...formState.items];
                    updatedItems[rowIndex].technical_specifications =
                      e.target.value;
                    setFormState((prevState) => ({
                      ...prevState,
                      items: updatedItems,
                    }));
                  }}
                  className="w-full"
                  rows={2}
                />
              )}
            />
            <Column
              header="Delivery Schedule"
              body={(rowData, { rowIndex }) => (
                <InputTextarea
                  value={rowData.delivery_schedule}
                  onChange={(e) => {
                    const updatedItems = [...formState.items];
                    updatedItems[rowIndex].delivery_schedule = e.target.value;
                    setFormState((prevState) => ({
                      ...prevState,
                      items: updatedItems,
                    }));
                  }}
                  className="w-full"
                  rows={2}
                />
              )}
            />
            <Column
              header="Actions"
              body={(_, { rowIndex }) => (
                <Button
                  type="button"
                  icon="pi pi-trash"
                  className="p-button-danger p-button-text"
                  onClick={() => {
                    const updatedItems = formState.items.filter(
                      (_, index) => index !== rowIndex
                    );
                    setFormState((prevState) => ({
                      ...prevState,
                      items: updatedItems,
                    }));
                  }}
                />
              )}
            />
          </DataTable>
          <Button
            type="button"
            id="none"
            onClick={() => {
              setFormState((prevState) => ({
                ...prevState,
                items: [
                  ...prevState.items,
                  {
                    index: prevState.items.length,
                    purchase_request_item_id: "",
                    quantity: 0,
                    uom: "",
                    item_description: "",
                    technical_specifications: "",
                    delivery_schedule: "",
                  },
                ],
              }));
            }}
            className="w-fit text-white rounded my-2 bg-shade  px-2 py-1"
          >
            Add Item
          </Button>
        </div>
      </form>
    </Dialog>
  );
};

export default AddOrModifyItem;
