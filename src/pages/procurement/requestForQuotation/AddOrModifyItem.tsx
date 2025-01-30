import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

import useItems from "../../../hooks/inventory/useItems";
import { createRequest } from "../../../utils/api";
import useAuth from "../../../hooks/useAuth";
import { RequestForQuotation } from "../../../redux/slices/types/procurement/RequestForQuotation";
import useCurrencies from "../../../hooks/procurement/useCurrencies";

interface RequestForQuotationAdd {
  title: string;
  description: string;
  submission_deadline: string;
  budget: number;
  currency_id: number;
  items: Item[];
}

interface Item {
  index: number; // Use index as unique identifier
  item_id: number;
  quantity: string;
  specifications: string;
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
    title: "",
    description: "",
    submission_deadline: "",
    budget: 0,
    currency_id: 1,
    items: [],
  };

  const [formState, setFormState] =
    useState<RequestForQuotationAdd>(initialItem);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: currencies } = useCurrencies();
  const { data: items } = useItems(); // Fetch items for dropdown
  const { token } = useAuth();

  useEffect(() => {
    if (item) {
      setFormState({
        title: item.title ?? "",
        description: item.description ?? "",
        submission_deadline: item.submission_deadline ?? "",
        budget: +(item.budget ?? 0),
        currency_id: item.currency_id ?? 1,
        items:
          item.rfq_items && item.rfq_items.length > 0
            ? item.rfq_items.map((i, index) => ({
                index, // Use index as unique identifier
                item_id: i.item_id,
                quantity: i.quantity.toString(),
                specifications: i.specifications,
              }))
            : [],
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

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const method = item?.id ? "PUT" : "POST";
    const endpoint = item?.id
      ? `/erp/procurement/rfq/${item.id}/update`
      : "/erp/procurement/rfq/create";
    const data = item?.id ? { ...item, ...formState } : formState;

    await createRequest(endpoint, token.access_token, data, onSave, method);
    setIsSubmitting(false);
    onSave();
    onClose(); // Close the modal after saving
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
      className="md:w-1/2 max-w-4xl"
      footer={footer}
      onHide={onClose}
    >
      <form
        id="item-form"
        onSubmit={handleSave}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4"
      >
        <div className="p-field">
          <label htmlFor="title">Title</label>
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
          <label htmlFor="description">Description</label>
          <InputTextarea
            id="description"
            name="description"
            value={formState.description ?? ""}
            onChange={handleInputChange}
            className="w-full"
          />
        </div>

        <div className="p-field">
          <label htmlFor="submission_deadline">Submission Deadline</label>
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

        <div className="p-field">
          <label htmlFor="budget">Budget</label>
          <InputText
            id="budget"
            name="budget"
            type="number"
            value={formState.budget.toString()}
            onChange={handleInputChange}
            required
            className="w-full"
          />
        </div>

        <div className="p-field">
          <label htmlFor="currency_id">Currency</label>
          <Dropdown
            id="currency_id"
            value={formState.currency_id}
            onChange={(e) => handleDropdownChange(e, "currency_id")}
            options={currencies}
            optionLabel="name"
            optionValue="id"
            placeholder="Select a currency"
            filter
            className="w-full"
          />
        </div>

        <div className="p-field col-span-2">
          <h3 className="font-semibold">Items</h3>
          <DataTable
            value={formState.items}
            dataKey="index" // Use index as the unique key
            className="p-datatable-customers"
          >
            <Column
              header="Item"
              body={(rowData, { rowIndex }) => (
                <Dropdown
                  value={rowData.item_id}
                  options={items}
                  onChange={(e) =>
                    handleItemDropdownChange(e, rowIndex, "item_id")
                  }
                  optionLabel="name"
                  optionValue="id"
                  placeholder="Select Item"
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
                    updatedItems[rowIndex].quantity = e.target.value;
                    setFormState((prevState) => ({
                      ...prevState,
                      items: updatedItems,
                    }));
                  }}
                />
              )}
            />
            <Column
              header="Specifications"
              body={(rowData, { rowIndex }) => (
                <InputTextarea
                  value={rowData.specifications}
                  onChange={(e) => {
                    const updatedItems = [...formState.items];
                    updatedItems[rowIndex].specifications = e.target.value;
                    setFormState((prevState) => ({
                      ...prevState,
                      items: updatedItems,
                    }));
                  }}
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
                    index: prevState.items.length, // Use length as unique index
                    item_id: 0,
                    quantity: "",
                    specifications: "",
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
