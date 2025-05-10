import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import useCurrencies from "../../../hooks/procurement/useCurrencies";
import { baseURL } from "../../../utils/api";
import useAuth from "../../../hooks/useAuth";
import { Bid } from "../../../redux/slices/types/procurement/Bid";
import useRequestForQuotation from "../../../hooks/procurement/useRequestForQuotation";
import useSuppliers from "../../../hooks/inventory/useSuppliers";
import axios from "axios";
import { toast } from "react-toastify";

interface AddOrModifyItemProps {
  visible: boolean;
  onClose: () => void;
  item?: Partial<Bid>;
  onSave: () => void;
}

interface BidAdd {
  request_for_quotation_id: number;
  supplier_id: number;
  submmitted_at: string;
  total_cost: number;
  submission_deadline: string;
  currency_id: number;
  delivery_time: number;
  bid_document?: File;
  items: Item[];
}

interface Item {
  id: number;
  request_for_quotation_item_id: number;
  unit_price: number;
  quantity: number;
  currency_id: number;
  delivery_time: number;
}

const AddOrModifyItem: React.FC<AddOrModifyItemProps> = ({
  visible,
  onClose,
  item,
  onSave,
}) => {
  const initialItem: BidAdd = {
    request_for_quotation_id: 0,
    supplier_id: 0,
    submmitted_at: (new Date()).toString(),
    total_cost: 0,
    submission_deadline: "",
    currency_id: 0,
    delivery_time: 0,
    items: [],
  };

  const [formState, setFormState] = useState<BidAdd>(initialItem);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: quotationRequests } = useRequestForQuotation();
  const { data: currencies } = useCurrencies();
  const { data: suppliers, loading: supplierLoading } = useSuppliers();
  const { token } = useAuth();

  useEffect(() => {
    if (item) {
      setFormState({
        request_for_quotation_id: item?.request_for_quotation?.id ?? 0,
        supplier_id: item.supplier?.id ?? 0,
        submmitted_at: (new Date()).toString(),
        total_cost: +(item.total_cost || 0),
        submission_deadline: item.submission_deadline ?? "",
        currency_id: (item.currency_id && +item?.currency_id) || 0,
        delivery_time: item.delivery_time ?? 0,
        items:
          item?.bid_items?.map((item, index) => ({
            id: index + 1,
            request_for_quotation_item_id: item.request_for_quotation_item_id,
            unit_price: +item.unit_price,
            quantity: +item.quantity,
            currency_id: item.currency_id,
            delivery_time: item.delivery_time,
          })) ?? [],
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

  const handleItemChange = (
    index: number,
    field: keyof Item,
    value: number
  ) => {
    const newItems = [...formState.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormState((prevState) => ({
      ...prevState,
      items: newItems,
    }));
  };

  const handleAddItem = () => {
    const newItem: Item = {
      id: Date.now(), // or another unique ID generation logic
      request_for_quotation_item_id: 0,
      unit_price: 0,
      quantity: 0,
      currency_id: 0,
      delivery_time: 0,
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

    const method = item?.id ? "PUT" : "POST";
    const endpoint = item?.id
      ? `/procurement/bids/${item.id}/update`
      : "/procurement/bids/create";

    try {
      // Create FormData to handle file upload
      const formData = new FormData();
      formData.append("submitted_at", new Date().toISOString().split("T")[0]);
      console.log(!!formState.bid_document);

      if (!!formState.bid_document) {
        formData.append("bid_document", formState.bid_document); // Add the file
      }
      Object.keys(formState).forEach((key) => {
        // @ts-expect-error --ignore
        if (key !== "bid_document") formData.append(key, formState[key]);
      });

      // Send request with Axios
      await axios({
        url: baseURL + endpoint,
        method,
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token.access_token}`,
        },
      });

      toast.success("Bid saved successfully!");
      onSave();
      onClose(); // Close the modal after saving
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
        type="submit"
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

  const itemEditor = (props: { rowIndex: number }) => {
    const index = props.rowIndex;
    return (
      <div className="flex space-x-2">
        <Button
          type="button"
          icon="pi pi-trash"
          className="p-button-rounded p-button-danger !bg-red-500"
          onClick={() => handleRemoveItem(index)}
          title="Delete"
        />
      </div>
    );
  };

  return (
    <Dialog
      header={item?.id ? "Edit Bid" : "Add Bid"}
      visible={visible}
      style={{ width: "1000px" }}
      footer={footer}
      onHide={onClose}
    >
      <form
        id="item-form"
        onSubmit={handleSave}
        className="p-fluid grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <div className="p-field">
          <label
            className="text-sm font-semibold text-gray-700 mb-2 block"
            htmlFor="currency_id"
          >
            Quotation Request
          </label>
          <Dropdown
            required
            id="request_for_quotation_id"
            name="request_for_quotation_id"
            value={formState.request_for_quotation_id}
            options={quotationRequests}
            optionLabel="title"
            optionValue="id"
            onChange={(e) => {
              setFormState({
                ...formState,
                items:
                  quotationRequests
                    .find((item) => item.id == e.target.value)
                    ?.rfq_items?.map((item) => ({
                      currency_id: item.item.currency_id,
                      delivery_time: 0,
                      id: item.id,
                      quantity: +item.quantity,
                      request_for_quotation_item_id:
                        item.request_for_quotation_id,
                      unit_price: +item.item.cost_price,
                    })) ?? [],
              });
              handleDropdownChange(e, "request_for_quotation_id");
            }}
            placeholder="Select a Quotation Request"
            filter
            className="w-full"
          />
        </div>
        <div className="p-field">
          <label
            className="text-sm font-semibold text-gray-700 mb-2 block"
            htmlFor="currency_id"
          >
            Supplier
          </label>

          <Dropdown
            required
            loading={supplierLoading}
            id="supplier_id"
            name="supplier_id"
            value={formState.supplier_id}
            options={suppliers}
            optionLabel="supplier_name"
            optionValue="id"
            onChange={(e) => handleDropdownChange(e, "supplier_id")}
            placeholder="Select a supplier"
            filter
            className="w-full"
          />
        </div>

        <div className="p-field">
          <label
            className="text-sm font-semibold text-gray-700 mb-2 block"
            htmlFor="total_cost"
          >
            Total Cost
          </label>
          <InputText
            id="total_cost"
            name="total_cost"
            type="number"
            step="0.01"
            value={formState.total_cost.toString()}
            onChange={handleInputChange}
            className="w-full"
          />
        </div>
        <div className="p-field">
          <label
            className="text-sm font-semibold text-gray-700 mb-2 block"
            htmlFor="submission_deadline"
          >
            Submission Deadline
          </label>
          <InputText
            id="submission_deadline"
            name="submission_deadline"
            type="date"
            value={formState.submission_deadline}
            onChange={handleInputChange}
            className="w-full"
            required
          />
        </div>

        <div className="p-field">
          <label
            className="text-sm font-semibold text-gray-700 mb-2 block"
            htmlFor="currency_id"
          >
            Currency
          </label>
          <Dropdown
            required
            id="currency_id"
            name="currency_id"
            value={formState.currency_id}
            options={currencies}
            optionLabel="name"
            optionValue="id"
            onChange={(e) => handleDropdownChange(e, "currency_id")}
            placeholder="Select a Currency"
            filter
            className="w-full"
          />
        </div>

        <div className="p-field">
          <label
            htmlFor="delivery_time"
            className="text-sm font-semibold text-gray-700 mb-2 block"
          >
            Delivery Time (Days)
          </label>
          <InputText
            id="delivery_time"
            name="delivery_time"
            type="number"
            value={formState.delivery_time.toString()}
            onChange={handleInputChange}
            className="w-full"
          />
        </div>
        <div className="p-fiels">
          <label
            className="text-sm font-semibold text-gray-700 mb-2 block"
            htmlFor="bid_document"
          >
            Bid Document
          </label>
          <input
            multiple={false}
            type="file"
            id="bid_document"
            name="bid_document"
            onChange={(e) => {
              setFormState({
                ...formState,
                bid_document: e.target.files ? e.target.files[0] : undefined,
              });
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
              field="request_for_quotation_item_id"
              header="RFQ Item"
              body={(rowData: Item) => (
                <div>
                  <Dropdown
                    id="item_id"
                    name="item_id"
                    value={rowData.request_for_quotation_item_id}
                    options={quotationRequests
                      .find(
                        (rfq) => rfq.id == formState.request_for_quotation_id
                      )
                      ?.rfq_items.map((item) => ({
                        label: item.item.name,
                        value: item.id,
                      }))}
                    onChange={(e) =>
                      handleItemChange(
                        formState.items.findIndex(
                          (item) => item.id === rowData.id
                        ),
                        "request_for_quotation_item_id",
                        +e.value
                      )
                    }
                    placeholder="Select Item"
                    filter
                    className="w-full"
                  />
                </div>
              )}
            />
            <Column
              field="unit_price"
              header="Unit Price"
              body={(rowData) => (
                <InputText
                  type="number"
                  value={rowData.unit_price}
                  onChange={(e) =>
                    handleItemChange(
                      formState.items.findIndex(
                        (item) => item.id === rowData.id
                      ),
                      "unit_price",
                      +e.target.value
                    )
                  }
                />
              )}
            />
            <Column
              field="quantity"
              header="Quantity"
              body={(rowData) => (
                <InputText
                  type="number"
                  value={rowData.quantity}
                  onChange={(e) =>
                    handleItemChange(
                      formState.items.findIndex(
                        (item) => item.id === rowData.id
                      ),
                      "quantity",
                      +e.target.value
                    )
                  }
                />
              )}
            />
            <Column
              field="delivery_time"
              header="Delivery Time (Days)"
              body={(rowData) => (
                <InputText
                  type="number"
                  value={rowData.delivery_time}
                  onChange={(e) =>
                    handleItemChange(
                      formState.items.findIndex(
                        (item) => item.id === rowData.id
                      ),
                      "delivery_time",
                      +e.target.value
                    )
                  }
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
