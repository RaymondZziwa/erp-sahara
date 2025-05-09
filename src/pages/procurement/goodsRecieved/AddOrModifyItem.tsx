import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import useCurrencies from "../../../hooks/procurement/useCurrencies";
import { createRequest } from "../../../utils/api";
import useAuth from "../../../hooks/useAuth";
import usePurchaseOrders from "../../../hooks/procurement/usePurchaseOrders";
import { GoodReceivedNote } from "../../../redux/slices/types/procurement/GoodsReceivedNote";
import useDrivers from "../../../hooks/inventory/useDrivers";
import { Driver } from "../../../redux/slices/types/inventory/Driver";
import useWarehouses from "../../../hooks/inventory/useWarehouses";
import { Warehouse } from "../../../redux/slices/types/inventory/Warehouse";
import useTrucks from "../../../hooks/inventory/useTrucks";
import { Truck } from "../../../redux/slices/types/mossApp/Trucks";

interface AddOrModifyItemProps {
  visible: boolean;
  onClose: () => void;
  item?: Partial<GoodReceivedNote>;
  onSave: () => void;
}

interface GoodsReceivedNoteAdd {
  purchase_order_id: number | null;
  delivery_note_number: string;
  receipt_date: string;
  truck_id: string | null;
  driver_is: string | null;
  attachments: File | null;
  remarkes: string | null;
  inspection_status?: "pending" | "rejected" | "approved";
  ware_house_id: string | null;
  items: Item[];
}

interface Item {
  item_id: number;
  received_quantity: number;
  unit_price: number;
  currency_id: number | null;
  notes: string | null;
}

const AddOrModifyItem: React.FC<AddOrModifyItemProps> = ({
  visible,
  onClose,
  item,
  onSave,
}) => {
  const initialItem: GoodsReceivedNoteAdd = {
    purchase_order_id: null,
    delivery_note_number: "",
    receipt_date: "",
    truck_id: null,
    driver_is: null,
    attachments: null,
    remarkes: null,
    inspection_status: "pending",
    ware_house_id: null,
    items: [],
  };

  const [formState, setFormState] = useState<GoodsReceivedNoteAdd>(initialItem);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: purchaseOrders } = usePurchaseOrders();
  const { data: currencies } = useCurrencies();
  const { data: drivers } = useDrivers();
  const { data: warehouses } = useWarehouses();
  const { data: trucks } = useTrucks();
  const { token } = useAuth();

  useEffect(() => {
    if (item) {
      setFormState({
        purchase_order_id: item?.purchase_order_id ?? null,
        delivery_note_number: item?.delivery_note_number ?? "",
        receipt_date: item?.receipt_date ?? "",
        truck_id: item?.truck_id?.toString() ?? null,
        driver_is: item?.driver_id ?? null,
        attachments: null, // Handle file input separately
        remarkes: item?.remarks ?? null,

        ware_house_id: "0",
        items:
          item?.grn_items?.map((it) => ({
            item_id: it.id,
            received_quantity: it.received_quantity,
            unit_price: +it.item.cost_price,
            currency_id: it.item.currency_id,
            notes: null,
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
    field: keyof GoodsReceivedNoteAdd
  ) => {
    setFormState((prevState) => ({
      ...prevState,
      [field]: e.value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormState((prevState) => ({
      ...prevState,
      attachments: file,
    }));
  };

  const handleItemChange = (
    index: number,
    field: keyof Item,
    value: string | number | null
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
      currency_id: null,
      item_id: 0,
      notes: null,
      received_quantity: 0,
      unit_price: 0,
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
      ? `/procurement/grns/${item.id}/update`
      : "/procurement/grns/create";
    await createRequest(
      endpoint,
      token.access_token,
      { ...formState, submmitted_at: new Date().toISOString().split("T")[0] },
      onSave,
      method
    );
    setIsSubmitting(false);
    onSave();
    onClose();
  };

  const footer = (
    <div className="flex justify-end space-x-2">
      <Button
        disabled={isSubmitting}
        type="submit"
        label="Cancel"
        icon="pi pi-times"
        onClick={onClose}
        className="p-button-text !bg-red-500"
        size="small"
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
      header={item?.id ? "Edit Goods Received Note" : "Add Goods Received Note"}
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
          <label htmlFor="purchase_order_id">Purchase Order</label>
          <Dropdown
            required
            id="purchase_order_id"
            name="purchase_order_id"
            value={formState.purchase_order_id}
            options={purchaseOrders}
            optionLabel="purchase_order_no"
            optionValue="id"
            onChange={(e) => {
              const selectedOrder = purchaseOrders.find(
                (order) => order.id === e.value
              );
              setFormState({
                ...formState,
                purchase_order_id: e.value,
                items:
                  selectedOrder?.purchase_order_items?.map((item) => ({
                    currency_id: item.currency_id,
                    item_id: item.id,
                    notes: null,
                    received_quantity: 0,
                    unit_price: +item.unit_price,
                  })) ?? [],
              });
            }}
            placeholder="Select a Purchase Order"
            filter
            className="w-full"
          />
        </div>

        <div className="p-field">
          <label htmlFor="delivery_note_number">Delivery Note Number</label>
          <InputText
            id="delivery_note_number"
            name="delivery_note_number"
            value={formState.delivery_note_number}
            onChange={handleInputChange}
            className="w-full"
            required
          />
        </div>

        <div className="p-field">
          <label htmlFor="receipt_date">Receipt Date</label>
          <InputText
            id="receipt_date"
            name="receipt_date"
            type="date"
            value={formState.receipt_date}
            onChange={handleInputChange}
            className="w-full"
          />
        </div>

        <div className="p-field">
          <label htmlFor="truck_id">Truck</label>
          <Dropdown
            id="truck_id"
            name="truck_id"
            filter
            optionValue="id"
            value={formState.truck_id}
            options={trucks}
            onChange={(e) => handleDropdownChange(e, "truck_id")}
            placeholder="Select truck"
            className="w-full"
            itemTemplate={(option: Truck) => (
              <div
                key={option.id}
              >{`${option.license_plate} ${option.model} ${option.capacity}`}</div>
            )}
            optionLabel="license_plate"
          />
        </div>

        <div className="p-field">
          <label htmlFor="driver_is">Driver</label>
          <Dropdown
            id="driver_is"
            name="driver_is"
            filter
            optionValue="id"
            value={formState.driver_is}
            options={drivers}
            onChange={(e) => handleDropdownChange(e, "driver_is")}
            placeholder="Select driver by staff id"
            className="w-full"
            itemTemplate={(option: Driver) => (
              <div
                key={option.id}
              >{`${option.employee_id} ${option.license_number}`}</div>
            )}
            optionLabel="staff_id"
          />
        </div>

        <div className="p-field">
          <label htmlFor="attachments">Attachments</label>
          <InputText
            id="attachments"
            name="attachments"
            type="file"
            onChange={handleFileChange}
            className="w-full"
          />
        </div>

        <div className="p-field">
          <label htmlFor="remarkes">Remarks</label>
          <InputTextarea
            id="remarkes"
            name="remarkes"
            rows={1}
            value={formState.remarkes || ""}
            onChange={handleInputChange}
            className="w-full"
          />
        </div>

        <div className="p-field">
          <label htmlFor="inspection_status">Inspection Status</label>
          <Dropdown
            id="inspection_status"
            name="inspection_status"
            value={formState.inspection_status}
            options={[
              { label: "Pending", value: "pending" },
              { label: "Rejected", value: "rejected" },
              { label: "Approved", value: "approved" },
            ]}
            onChange={(e) => handleDropdownChange(e, "inspection_status")}
            placeholder="Select Inspection Status"
            className="w-full"
          />
        </div>

        <div className="p-field">
          <label htmlFor="warehouse_id">Ware house</label>
          <Dropdown
            id="warehouse_id"
            name="warehouse_id"
            filter
            optionValue="id"
            value={formState.ware_house_id}
            options={warehouses}
            onChange={(e) => handleDropdownChange(e, "ware_house_id")}
            placeholder="Select warehouse"
            className="w-full"
            itemTemplate={(option: Warehouse) => (
              <div key={option.id}>{`${option.name} ${option.location}`}</div>
            )}
            optionLabel="name"
          />
        </div>

        <div className="col-span-2">
          <DataTable
            value={formState.items}
            editMode="row"
            header="Items"
            dataKey="item_id"
            className="editable-cells-table"
          >
            <Column
              field="item_id"
              header="Item"
              body={(rowData: Item, { rowIndex }) => {
                const selectedPurchaseOrder = purchaseOrders.find(
                  (po) => po.id === formState.purchase_order_id
                );
                const itemsOptions = selectedPurchaseOrder
                  ? selectedPurchaseOrder.purchase_order_items.map((item) => ({
                      label: item.item.name,
                      value: item.id,
                    }))
                  : [];

                return (
                  <>
                    {rowData.item_id ? (
                      <span>
                        {itemsOptions.find(
                          (item) => item.value === rowData.item_id
                        )?.label || "Item not found"}
                      </span>
                    ) : (
                      <Dropdown
                        placeholder="Select Item"
                        value={rowData.item_id}
                        options={itemsOptions}
                        onChange={(e) =>
                          handleItemChange(rowIndex, "item_id", e.value)
                        }
                        className="w-full"
                      />
                    )}
                  </>
                );
              }}
            />

            <Column
              field="received_quantity"
              header="Received Quantity"
              body={(rowData, { rowIndex }) => (
                <InputText
                  type="number"
                  value={rowData.received_quantity}
                  onChange={(e) =>
                    handleItemChange(
                      rowIndex,
                      "received_quantity",
                      +e.target.value
                    )
                  }
                />
              )}
            />
            <Column
              field="unit_price"
              header="Unit Price"
              body={(rowData, { rowIndex }) => (
                <InputText
                  type="number"
                  value={rowData.unit_price}
                  onChange={(e) =>
                    handleItemChange(rowIndex, "unit_price", +e.target.value)
                  }
                />
              )}
            />
            <Column
              field="currency_id"
              header="Currency"
              body={(rowData, { rowIndex }) => (
                <Dropdown
                  value={rowData.currency_id}
                  options={currencies}
                  optionLabel="name"
                  optionValue="id"
                  onChange={(e) =>
                    handleItemChange(rowIndex, "currency_id", e.value)
                  }
                />
              )}
            />
            <Column
              field="notes"
              header="Notes"
              body={(rowData, { rowIndex }) => (
                <InputTextarea
                  rows={1}
                  value={rowData.notes || ""}
                  onChange={(e) =>
                    handleItemChange(rowIndex, "notes", e.target.value)
                  }
                />
              )}
            />
            <Column
              body={itemEditor}
              header="Actions"
              style={{ textAlign: "center", width: "8rem" }}
            />
          </DataTable>
          <Button
            size="small"
            type="button"
            icon="pi pi-plus"
            label="Add Item"
            className="p-button-success p-mt-2 w-fit my-2"
            onClick={handleAddItem}
          />
        </div>
      </form>
    </Dialog>
  );
};

export default AddOrModifyItem;
