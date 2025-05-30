import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import useCurrencies from "../../../hooks/procurement/useCurrencies";
import { createRequest } from "../../../utils/api";
import useAuth from "../../../hooks/useAuth";
import { API_ENDPOINTS } from "../../../api/apiEndpoints";
import useItems from "../../../hooks/inventory/useItems";
import { PurchaseOrder } from "../../../redux/slices/types/procurement/PurchaseOrders";
import useSuppliers from "../../../hooks/inventory/useSuppliers";

import usePurchaseRequests from "../../../hooks/procurement/usePurchaseRequests";
import useRequestForQuotation from "../../../hooks/procurement/useRequestForQuotation";
import useQuotations from "../../../hooks/sales/useQuotations";

type PurchaseOrderSource = "Direct" | "Quotation" | "RFQ" | "PurchaseRequest";

interface PurchaseOrderAdd {
  supplier_id: string;
  currency_id: string;
  source: PurchaseOrderSource;
  // Source-specific fields
  quotation_id?: string;
  rfq_id?: string;
  purchase_request_id?: string;
  sq_evaluation_id?: string;
  // Common fields
  order_date: string;
  expected_delivery_date: string;
  payment_terms: string;
  custom_payment_terms?: string;
  delivery_instructions?: string;
  items: PurchaseOrderItem[];
}

interface PurchaseOrderItem {
  description: string;
  quantity: number;
  unit_price: number;
  unit_of_measure?: string;
  tax_rate?: number;
  discount_percent?: number;
  // Source-specific fields
  quotation_item_id?: string;
  rfq_item_id?: string;
  purchase_request_item_id?: string;
}

interface AddOrModifyItemProps {
  visible: boolean;
  onClose: () => void;
  item?: Partial<PurchaseOrder>;
  onSave: () => void;
}

const sourceOptions = [
  { label: "Direct Purchase", value: "Direct" },
  { label: "From Quotation", value: "Quotation" },
  { label: "From RFQ", value: "RFQ" },
  { label: "From Purchase Request", value: "PurchaseRequest" },
];

const paymentTermsOptions = [
  { label: "Prepaid", value: "Prepaid" },
  { label: "Net30", value: "Net30" },
  { label: "Net60", value: "Net60" },
  { label: "Custom", value: "Custom" },
];

const AddOrModifyItem: React.FC<AddOrModifyItemProps> = ({
  visible,
  onClose,
  item,
  onSave,
}) => {
  const [formState, setFormState] = useState<PurchaseOrderAdd>({
    supplier_id: "",
    currency_id: "",
    source: "Direct",
    order_date: new Date().toISOString().split("T")[0],
    expected_delivery_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    payment_terms: "Net30",
    items: [
      {
        description: "",
        quantity: 1,
        unit_price: 0,
      },
    ],
  });

  const [selectedSourceDocument, setSelectedSourceDocument] =
    useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Data hooks
  const { data: currencies } = useCurrencies();
  const { data: suppliers } = useSuppliers();
  const { token } = useAuth();
  const { data: quotations } = useQuotations();
  const { data: rfqs } = useRequestForQuotation();
  const { data: purchaseRequests } = usePurchaseRequests();

  // Calculate total amount
  const totalAmount = formState.items.reduce((acc, curr) => {
    const price = curr.unit_price * curr.quantity;
    const discount = curr.discount_percent
      ? price * (curr.discount_percent / 100)
      : 0;
    const tax = curr.tax_rate ? (price - discount) * (curr.tax_rate / 100) : 0;
    return acc + (price - discount + tax);
  }, 0);

const quotationOptions = quotations.map((q) => ({
  label: q.name || q.title || `Quotation #${q.id}`,
  value: q.id,
}));

const rfqOptions = rfqs.map((r) => ({
  label: r.rfq_number || r.title || `RFQ #${r.id}`,
  value: r.id,
}));

const purchaseRequestOptions = purchaseRequests.map((p) => ({
  label: p.title || `Purchase Request #${p.id}`,
  value: p.id,
}));
  // Get source documents based on selected source
  const sourceDocuments = () => {
    switch (formState.source) {
      case "Quotation":
        return quotationOptions;
      case "RFQ":
        return rfqOptions;
      case "PurchaseRequest":
        return purchaseRequestOptions;
      default:
        return [];
    }
  };

  // Initialize form for editing
  useEffect(() => {
    if (item) {
      setFormState({
        supplier_id: item.supplier_id?.toString() || "",
        currency_id: item.currency_id?.toString() || "",
        source: item.source || "Direct",
        quotation_id: item.quotation_id,
        rfq_id: item.rfq_id,
        purchase_request_id: item.purchase_request_id,
        sq_evaluation_id: item.sq_evaluation_id,
        order_date: item.order_date || new Date().toISOString().split("T")[0],
        expected_delivery_date:
          item.expected_delivery_date ||
          new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
        payment_terms: item.payment_terms || "Net30",
        custom_payment_terms: item.custom_payment_terms,
        delivery_instructions: item.delivery_instructions,
        items: item?.purchase_order_items?.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          unit_price: +item.unit_price,
          unit_of_measure: item.unit_of_measure,
          tax_rate: item.tax_rate,
          discount_percent: item.discount_percent,
          quotation_item_id: item.quotation_item_id,
          rfq_item_id: item.rfq_item_id,
          purchase_request_item_id: item.purchase_request_item_id,
        })) || [{ description: "", quantity: 1, unit_price: 0 }],
      });
    } else {
      resetForm();
    }
  }, [item]);

  // Reset form when source changes
  useEffect(() => {
    if (!item) {
      resetForm();
    }
  }, [formState.source]);

  const resetForm = () => {
    setFormState({
      supplier_id: "",
      currency_id: "",
      source: formState.source,
      order_date: new Date().toISOString().split("T")[0],
      expected_delivery_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      payment_terms: "Net30",
      items: [
        {
          description: "",
          quantity: 1,
          unit_price: 0,
        },
      ],
    });
    setSelectedSourceDocument(null);
  };

  const handleSourceDocumentChange = (e: DropdownChangeEvent) => {
    const selectedDoc = e.value;
    setSelectedSourceDocument(selectedDoc);

    if (selectedDoc) {
      let items: PurchaseOrderItem[] = [];
      let newState: Partial<PurchaseOrderAdd> = {};

      switch (formState.source) {
        case "Quotation":
          items =
            selectedDoc.quotation_items?.map((item: any) => ({
              description: item.description,
              quantity: item.quantity,
              unit_price: +item.unit_price,
              quotation_item_id: item.id,
            })) || [];
          newState = {
            supplier_id: selectedDoc.supplier_id?.toString() || "",
            currency_id: selectedDoc.currency_id?.toString() || "",
            quotation_id: selectedDoc.id,
            payment_terms: selectedDoc.payment_terms || "Net30",
          };
          break;

        case "RFQ":
          items =
            selectedDoc.rfq_items?.map((item: any) => ({
              description: item.description,
              quantity: item.quantity,
              unit_price: +item.unit_price,
              rfq_item_id: item.id,
            })) || [];
          newState = {
            supplier_id: selectedDoc.supplier_id?.toString() || "",
            currency_id: selectedDoc.currency_id?.toString() || "",
            rfq_id: selectedDoc.id,
          };
          break;

        case "PurchaseRequest":
          items =
            selectedDoc.purchase_request_items?.map((item: any) => ({
              description: item.description,
              quantity: item.quantity,
              unit_price: +item.estimated_unit_price || 0,
              purchase_request_item_id: item.id,
            })) || [];
          newState = {
            supplier_id: selectedDoc.supplier_id?.toString() || "",
            currency_id: selectedDoc.currency_id?.toString() || "",
            purchase_request_id: selectedDoc.id,
          };
          break;
      }

      setFormState((prev) => ({
        ...prev,
        ...newState,
        items:
          items.length > 0
            ? items
            : [{ description: "", quantity: 1, unit_price: 0 }],
      }));
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    itemIndex?: number
  ) => {
    const { name, value } = e.target;
    if (itemIndex !== undefined) {
      setFormState((prev) => ({
        ...prev,
        items: prev.items.map((item, index) =>
          index === itemIndex ? { ...item, [name]: value } : item
        ),
      }));
    } else {
      setFormState((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleDropdownChange = (e: DropdownChangeEvent, field: string) => {
    setFormState((prev) => ({ ...prev, [field]: e.value }));
  };

  const handleAddItem = () => {
    setFormState((prev) => ({
      ...prev,
      items: [...prev.items, { description: "", quantity: 1, unit_price: 0 }],
    }));
  };

  const handleRemoveItem = (index: number) => {
    if (formState.items.length > 1) {
      setFormState((prev) => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index),
      }));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload: any = {
      supplier_id: formState.supplier_id,
      currency_id: formState.currency_id,
      source: formState.source,
      order_date: formState.order_date,
      expected_delivery_date: formState.expected_delivery_date,
      payment_terms: formState.payment_terms,
      items: formState.items.map((item) => {
        const baseItem: any = {
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
        };

        // Add source-specific fields
        if (item.quotation_item_id)
          baseItem.quotation_item_id = item.quotation_item_id;
        if (item.rfq_item_id) baseItem.rfq_item_id = item.rfq_item_id;
        if (item.purchase_request_item_id)
          baseItem.purchase_request_item_id = item.purchase_request_item_id;

        // Add optional fields for Direct POs
        if (formState.source === "Direct") {
          if (item.unit_of_measure)
            baseItem.unit_of_measure = item.unit_of_measure;
          if (item.tax_rate) baseItem.tax_rate = item.tax_rate;
          if (item.discount_percent)
            baseItem.discount_percent = item.discount_percent;
        }

        return baseItem;
      }),
    };

    // Add source-specific fields
    if (formState.quotation_id) payload.quotation_id = formState.quotation_id;
    if (formState.rfq_id) payload.rfq_id = formState.rfq_id;
    if (formState.purchase_request_id)
      payload.purchase_request_id = formState.purchase_request_id;
    if (formState.sq_evaluation_id)
      payload.sq_evaluation_id = formState.sq_evaluation_id;

    // Add Direct-specific fields
    if (formState.source === "Direct") {
      if (formState.custom_payment_terms)
        payload.custom_payment_terms = formState.custom_payment_terms;
      if (formState.delivery_instructions)
        payload.delivery_instructions = formState.delivery_instructions;
    }

    console.log("Submitting Purchase Order:", payload);

    const method = item?.id ? "PUT" : "POST";
    const endpoint = item?.id
      ? API_ENDPOINTS.PURCHASE_ORDERS.UPDATE(item.id.toString())
      : API_ENDPOINTS.PURCHASE_ORDERS.ADD;

    try {
      await createRequest(
        endpoint,
        token.access_token,
        payload,
        onSave,
        method
      );
      onSave();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const footer = (
    <div className="flex justify-end space-x-2">
      <Button
        label="Cancel"
        icon="pi pi-times"
        onClick={onClose}
        className="p-button-text p-button-danger"
        disabled={isSubmitting}
      />
      <Button
        label={item?.id ? "Update" : "Create"}
        icon="pi pi-check"
        type="submit"
        form="po-form"
        loading={isSubmitting}
      />
    </div>
  );

  return (
    <Dialog
      header={item?.id ? "Edit Purchase Order" : "Create Purchase Order"}
      visible={visible}
      style={{ width: "80vw", maxWidth: "1200px" }}
      footer={footer}
      onHide={onClose}
    >
      <form id="po-form" onSubmit={handleSave} className="grid gap-4">
        {/* FORM FIELDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="col-span-1">
            <label htmlFor="expected_delivery_date">
              Source
            </label>
            <Dropdown
              value={formState.source}
              options={sourceOptions}
              onChange={(e) => handleDropdownChange(e, "source")}
              placeholder="Select Source Type"
              className="mb-3 w-full"
              disabled={!!item}
            />
          </div>

          {formState.source !== "Direct" && (
            <div>
              <label htmlFor="expected_delivery_date">
                Document
              </label>
              <Dropdown
                value={selectedSourceDocument}
                options={sourceDocuments()}
                onChange={handleSourceDocumentChange} 
                placeholder={`Select ${formState.source} Document`}
                className="mb-3 w-full"
                disabled={!!item}
              />
            </div>
          )}

          <div>
            <label htmlFor="expected_delivery_date">
              Supplier
            </label>
            <Dropdown
              value={formState.supplier_id}
              options={suppliers}
              onChange={(e) => handleDropdownChange(e, "supplier_id")}
              optionLabel="supplier_name"
              optionValue="id"
              placeholder="Select Supplier"
              className="mb-3 w-full"
              disabled={
                formState.source !== "Direct" && !!selectedSourceDocument
              }
            />
          </div>

          <div>
            <label htmlFor="expected_delivery_date">
              Currency
            </label>
            <Dropdown
              value={formState.currency_id}
              options={currencies}
              onChange={(e) => handleDropdownChange(e, "currency_id")}
              optionLabel="name"
              optionValue="id"
              placeholder="Select Currency"
              className="mb-3 w-full"
              disabled={
                formState.source !== "Direct" && !!selectedSourceDocument
              }
            />
          </div>

          <div>
            <label htmlFor="order_date">Order Date</label>
            <InputText
              id="order_date"
              type="date"
              value={formState.order_date}
              onChange={handleInputChange}
              name="order_date"
              className="mb-3 w-full"
              required
            />
          </div>

          <div>
            <label htmlFor="expected_delivery_date">
              Expected Delivery Date
            </label>
            <InputText
              id="expected_delivery_date"
              type="date"
              value={formState.expected_delivery_date}
              onChange={handleInputChange}
              name="expected_delivery_date"
              className="mb-3 w-full"
              required
            />
          </div>

          <div>
            <label htmlFor="expected_delivery_date">
              Payment terms
            </label>
            <Dropdown
              value={formState.payment_terms}
              options={paymentTermsOptions}
              onChange={(e) => handleDropdownChange(e, "payment_terms")}
              placeholder="Payment Terms"
              className="mb-3 w-full"
            />
          </div>

          {formState.payment_terms === "Custom" && (
            <div>
              <label htmlFor="custom_payment_terms">Custom Terms</label>
              <InputText
                id="custom_payment_terms"
                value={formState.custom_payment_terms || ""}
                onChange={handleInputChange}
                name="custom_payment_terms"
                className="mb-3 w-full"
                required
              />
            </div>
          )}

          {formState.source === "Direct" && (
            <div className="col-span-2">
              <label htmlFor="delivery_instructions">
                Delivery Instructions
              </label>
              <InputText
                id="delivery_instructions"
                value={formState.delivery_instructions || ""}
                onChange={handleInputChange}
                name="delivery_instructions"
                className="mb-3 w-full"
              />
            </div>
          )}
        </div>

        {/* ITEMS SECTION */}
        <div className="mt-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xl font-bold">Items</h3>
            {formState.source === "Direct" && (
              <Button
                label="Add Item"
                icon="pi pi-plus"
                onClick={handleAddItem}
                className="p-button-sm"
              />
            )}
          </div>

          <div className="overflow-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  {formState.source === "Direct" && (
                    <>
                      <th>Unit of Measure</th>
                      <th>Tax Rate (%)</th>
                      <th>Discount (%)</th>
                    </>
                  )}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {formState.items.map((item, index) => (
                  <tr key={index}>
                    <td>
                      <InputText
                        value={item.description}
                        onChange={(e) => handleInputChange(e, index)}
                        name="description"
                        className="w-full"
                        required
                      />
                    </td>
                    <td>
                      <InputText
                        type="number"
                        value={item.quantity.toString()}
                        onChange={(e) => handleInputChange(e, index)}
                        name="quantity"
                        className="w-full"
                        required
                      />
                    </td>
                    <td>
                      <InputText
                        type="number"
                        value={item.unit_price.toString()}
                        onChange={(e) => handleInputChange(e, index)}
                        name="unit_price"
                        className="w-full"
                        required
                      />
                    </td>
                    {formState.source === "Direct" && (
                      <>
                        <td>
                          <InputText
                            value={item.unit_of_measure || ""}
                            onChange={(e) => handleInputChange(e, index)}
                            name="unit_of_measure"
                            className="w-full"
                          />
                        </td>
                        <td>
                          <InputText
                            type="number"
                            value={item.tax_rate?.toString() || ""}
                            onChange={(e) => handleInputChange(e, index)}
                            name="tax_rate"
                            className="w-full"
                          />
                        </td>
                        <td>
                          <InputText
                            type="number"
                            value={item.discount_percent?.toString() || ""}
                            onChange={(e) => handleInputChange(e, index)}
                            name="discount_percent"
                            className="w-full"
                          />
                        </td>
                      </>
                    )}
                    <td>
                      <Button
                        icon="pi pi-trash"
                        className="p-button-danger p-button-rounded p-button-text"
                        onClick={() => handleRemoveItem(index)}
                        disabled={formState.items.length <= 1}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-4 p-3 bg-gray-100 rounded">
          <h4 className="font-bold">Total Amount: {totalAmount.toFixed(2)}</h4>
        </div>
      </form>
    </Dialog>
  );
};

export default AddOrModifyItem;
