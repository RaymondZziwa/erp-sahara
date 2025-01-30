import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

import useAuth from "../../../hooks/useAuth";
import useWarehouses from "../../../hooks/inventory/useWarehouses";
import useCustomerOrders from "../../../hooks/sales/useCustomerOrders";
import useCurrencies from "../../../hooks/procurement/useCurrencies";
import { createRequest } from "../../../utils/api";
import { SALES_ENDPOINTS } from "../../../api/salesEndpoints";
import { DistributionOrder } from "../../../redux/slices/types/sales/DistributionOrder";
import { Customerorderitem } from "../../../redux/slices/types/sales/CustomerOrder";

interface DistributionOrderAdd {
  customer_order_id: number;
  warehouse_id: number;
  shipping_date: string;
  notes: string;
}

interface AddOrModifyItemProps {
  visible: boolean;
  onClose: () => void;
  item?: DistributionOrder;
  onSave: () => void;
}

const AddOrModifyItem: React.FC<AddOrModifyItemProps> = ({
  visible,
  onClose,
  item,
  onSave,
}) => {
  const [formState, setFormState] = useState<Partial<DistributionOrderAdd>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { token } = useAuth();
  const { data: warehouses } = useWarehouses();
  const { data: customerOrders } = useCustomerOrders();
  const { data: currencies } = useCurrencies();

  useEffect(() => {
    if (item) {
      setFormState({ ...item });
    } else {
      resetForm();
    }
  }, [item]);

  const resetForm = () => setFormState({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleDropdownChange = (e: DropdownChangeEvent) => {
    const { name, value } = e.target;
    setFormState((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (
      !formState.customer_order_id ||
      !formState.shipping_date ||
      !formState.warehouse_id
    ) {
      setIsSubmitting(false);
      return;
    }

    const method = item?.id ? "PUT" : "POST";
    const endpoint = item?.id
      ? SALES_ENDPOINTS.DISTRIBUTION_ORDERS.UPDATE(item.id.toString())
      : SALES_ENDPOINTS.DISTRIBUTION_ORDERS.ADD;

    await createRequest(
      endpoint,
      token.access_token,
      formState,
      onSave,
      method
    );

    setIsSubmitting(false);
    onClose();
  };

  const selectedCustomerOrder = customerOrders.find(
    (order) => order.id === formState.customer_order_id
  );

  const footer = (
    <div className="flex justify-end space-x-2">
      <Button
        label="Cancel"
        icon="pi pi-times"
        className="p-button-text"
        size="small"
        onClick={onClose}
        disabled={isSubmitting}
      />
      <Button
        label={item?.id ? "Update" : "Submit"}
        icon="pi pi-check"
        type="submit"
        form="distribution-form"
        size="small"
        loading={isSubmitting}
        disabled={isSubmitting}
      />
    </div>
  );

  return (
    <Dialog
      header={item?.id ? "Edit Distribution Order" : "Add Distribution Order"}
      visible={visible}
      style={{ width: "600px" }}
      footer={footer}
      onHide={onClose}
    >
      <form id="distribution-form" onSubmit={handleSave} className="p-fluid">
        <div className="p-field">
          <label htmlFor="shipping_date">Shipping Date</label>
          <InputText
            type="date"
            id="shipping_date"
            name="shipping_date"
            value={formState.shipping_date || ""}
            onChange={handleInputChange}
            required
            className="w-full"
          />
        </div>

        <div className="p-field">
          <label htmlFor="warehouse_id" className="font-semibold">
            Warehouse
          </label>
          <Dropdown
            name="warehouse_id"
            value={formState.warehouse_id}
            onChange={handleDropdownChange}
            options={warehouses}
            optionLabel="name"
            optionValue="id"
            placeholder="Select Warehouse"
            filter
            required
            className="w-full md:w-14rem"
          />
        </div>

        <div className="p-field">
          <label htmlFor="customer_order_id" className="font-semibold">
            Customer Order
          </label>
          <Dropdown
            name="customer_order_id"
            value={formState.customer_order_id}
            onChange={handleDropdownChange}
            options={customerOrders}
            optionLabel="customer_order_no"
            optionValue="id"
            placeholder="Select Customer Order"
            filter
            required
            className="w-full md:w-14rem"
          />
        </div>

        <div className="p-field">
          <label htmlFor="notes">Notes</label>
          <InputText
            id="notes"
            name="notes"
            value={formState.notes || ""}
            onChange={handleInputChange}
            className="w-full"
          />
        </div>

        <div className="p-field col-span-2">
          <h3 className="font-semibold">Items</h3>
          <DataTable value={selectedCustomerOrder?.customer_order_items || []}>
            <Column
              header="Item"
              body={(rowData: Customerorderitem) => rowData.item.name}
            />
            <Column
              header="Quantity"
              body={(rowData: Customerorderitem) => rowData.quantity}
            />
            <Column
              header="Unit Price"
              body={(rowData: Customerorderitem) => rowData.unit_price}
            />
            <Column
              header="Currency"
              body={(rowData: Customerorderitem) =>
                currencies.find(
                  (currency) => currency.id === rowData.item.currency_id
                )?.code
              }
            />
            <Column
              header="Notes"
              body={(rowData: Customerorderitem) => rowData.notes || "N/A"}
            />
          </DataTable>
        </div>

        {selectedCustomerOrder && (
          <div className="mt-4 p-4 border rounded-lg bg-gray-50">
            <h3 className="font-bold text-lg text-primary mb-2">
              Customer Details
            </h3>
            <div className="text-sm space-y-1">
              <div className="flex items-center">
                <span className="font-semibold w-40">Organization:</span>
                <span>{selectedCustomerOrder.customer.organization_name}</span>
              </div>
              <div className="flex items-center">
                <span className="font-semibold w-40">Phone Number:</span>
                <span>{selectedCustomerOrder.customer.phone_number}</span>
              </div>
              <div className="flex items-center">
                <span className="font-semibold w-40">Email:</span>
                <span>{selectedCustomerOrder.customer.email}</span>
              </div>
            </div>
          </div>
        )}
      </form>
    </Dialog>
  );
};

export default AddOrModifyItem;
