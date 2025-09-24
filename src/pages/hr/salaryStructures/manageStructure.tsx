import React, { useEffect, useState } from "react";
import { Card } from "primereact/card";
import { TabView, TabPanel } from "primereact/tabview";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import { ToastContainer, toast } from "react-toastify";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";

import useSalaryStructures from "../../../hooks/hr/useSalaryStructures";
import useAllowanceTypes from "../../../hooks/hr/salary/useAllowanceTypes";
import useDeductionTypes from "../../../hooks/hr/salary/useDeductionTypes";
import { HUMAN_RESOURCE_ENDPOINTS } from "../../../api/hrEndpoints";
import { apiRequest } from "../../../utils/api";

interface Allowance {
  id: string;
  allowance_type_id: string;
  name: string;
  amount: number;
}

interface Deduction {
  id: string;
  deduction_type_id: string;
  name: string;
  amount: number;
}

interface SalaryStructure {
  id: string;
  name: string;
  basic_pay: number;
  notes?: string | null;
  created_at: string;
  allowances: Allowance[];
  deductions: Deduction[];
}

const ManageSalaryStructure: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data } = useSalaryStructures();
  const token = useSelector((state: RootState) => state.userAuth.token);

  const [structure, setStructure] = useState<SalaryStructure | null>(null);
  const { data: allowanceTypes } = useAllowanceTypes();
  const { data: deductionTypes } = useDeductionTypes();

  const [activeIndex, setActiveIndex] = useState(0); // 0 = Allowances, 1 = Deductions
  const [dialogVisible, setDialogVisible] = useState(false);

  const [formData, setFormData] = useState({
    typeId: "",
    name: "",
    amount: 0,
  });

  const [editId, setEditId] = useState<string | null>(null); // null = add mode, else edit mode

  useEffect(() => {
    if (!id || !data) return;
    const foundStructure = data.find((s) => s.id === id);
    setStructure(foundStructure ?? null);
  }, [id, data]);

  const openDialogForAdd = () => {
    setFormData({ typeId: "", name: "", amount: 0 });
    setEditId(null);
    setDialogVisible(true);
  };

  const openDialogForEdit = (item: Allowance | Deduction) => {
    // When editing, typeId can be the respective type id
    setFormData({
      typeId: activeIndex === 0 ? item.allowance_type_id : item.deduction_type_id,
      name: item.name,
      amount: item.amount,
    });
    setEditId(item.id);
    setDialogVisible(true);
  };

  const handleSave = async () => {
    if (!formData.typeId || !formData.name || formData.amount <= 0) {
      toast.warn("Fill in all required fields");
      return;
    }

    if (!structure) return;

    let payload;

    if (activeIndex === 0) {
      // Allowances
      const updated = editId
        ? structure.allowances.map((a) =>
            a.id === editId
              ? { ...a, allowance_type_id: formData.typeId, name: formData.name, amount: formData.amount }
              : a
          )
        : [
            ...structure.allowances,
            {
              id: Math.random().toString(),
              allowance_type_id: formData.typeId,
              name: formData.name,
              amount: formData.amount,
            },
          ];

      payload = { ...structure, allowance_types: updated };
      setStructure({ ...structure, allowances: updated });
    } else {
      // Deductions
      const updated = editId
        ? structure.deductions.map((d) =>
            d.id === editId
              ? { ...d, deduction_type_id: formData.typeId, name: formData.name, amount: formData.amount }
              : d
          )
        : [
            ...structure.deductions,
            {
              id: Math.random().toString(),
              deduction_type_id: formData.typeId,
              name: formData.name,
              amount: formData.amount,
            },
          ];

      payload = { ...structure, deduction_types: updated };
      setStructure({ ...structure, deductions: updated });
    }

    const endpoint =
      activeIndex === 0
        ? HUMAN_RESOURCE_ENDPOINTS.STRUCTURE_ALLOWANCES_AND_DEDUCTIONS.ADD_ALLOWANCE
        : HUMAN_RESOURCE_ENDPOINTS.STRUCTURE_ALLOWANCES_AND_DEDUCTIONS.ADD_DEDUCTION;

    const method = editId ? "PUT" : "POST";

    await apiRequest(endpoint(id), method, token.access_token, payload);

    toast.success(
      `${activeIndex === 0 ? "Allowance" : "Deduction"} ${
        editId ? "updated" : "added"
      } successfully`
    );
    setDialogVisible(false);
  };

  const currencyTemplate = (rowData: { amount: number }) =>
    rowData.value.toLocaleString();

  const actionTemplate = (rowData: Allowance | Deduction) => (
    <Button
      icon="pi pi-pencil"
      className="p-button-text p-button-sm"
      onClick={() => openDialogForEdit(rowData)}
      tooltip="Edit"
    />
  );

  if (!structure) return <p>Loading...</p>;

  return (
    <>
      <ToastContainer />

      {/* Salary Structure Details */}
      <Card title="Salary Structure Details" className="mb-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <strong>Name:</strong> {structure.name}
          </div>
          <div>
            <strong>Basic Salary:</strong> {structure.basic_pay}
          </div>
          <div>
            <strong>Notes:</strong> {structure.notes || "—"}
          </div>
          <div>
            <strong>Created At:</strong>{" "}
            {new Date(structure.created_at).toLocaleDateString()}
          </div>
        </div>
      </Card>

      {/* Allowances / Deductions Tabs */}
      <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
        <TabPanel header="Allowances">
          <div className="flex justify-end mb-2">
            <Button
              label="Add Allowance"
              icon="pi pi-plus"
              onClick={openDialogForAdd}
              size="small"
            />
          </div>
          <DataTable value={structure.allowances} responsiveLayout="scroll">
            <Column field="name" header="Name" />
            <Column
              field="amount"
              header="Amount"
              body={currencyTemplate}
              style={{ textAlign: "right" }}
            />
            <Column header="Actions" body={actionTemplate} style={{ width: "100px" }} />
          </DataTable>
        </TabPanel>

        <TabPanel header="Deductions">
          <div className="flex justify-end mb-2">
            <Button
              label="Add Deduction"
              icon="pi pi-plus"
              onClick={openDialogForAdd}
              size="small"
            />
          </div>
          <DataTable value={structure.deductions} responsiveLayout="scroll">
            <Column field="name" header="Name" />
            <Column
              field="amount"
              header="Amount"
              body={currencyTemplate}
              style={{ textAlign: "right" }}
            />
            <Column header="Actions" body={actionTemplate} style={{ width: "100px" }} />
          </DataTable>
        </TabPanel>
      </TabView>

      {/* Add/Edit Allowance/Deduction Dialog */}
      <Dialog
        header={`${editId ? "Edit" : "Add"} ${
          activeIndex === 0 ? "Allowance" : "Deduction"
        }`}
        visible={dialogVisible}
        style={{ width: "400px" }}
        onHide={() => setDialogVisible(false)}
        footer={
          <div className="flex justify-end space-x-2">
            <Button
              label="Cancel"
              icon="pi pi-times"
              onClick={() => setDialogVisible(false)}
              className="p-button-text"
              size="small"
            />
            <Button
              label="Save"
              icon="pi pi-check"
              onClick={handleSave}
              size="small"
            />
          </div>
        }
      >
        <div className="grid gap-4">
          {/* Type Dropdown */}
          <div className="p-field">
            <label htmlFor="type">
              Type<span className="text-red-500">*</span>
            </label>
            <Dropdown
              id="type"
              value={formData.typeId}
              options={
                activeIndex === 0
                  ? allowanceTypes?.map((a) => ({ label: a.name, value: a.id }))
                  : deductionTypes?.map((d) => ({ label: d.name, value: d.id }))
              }
              onChange={(e) => {
                const selected =
                  activeIndex === 0
                    ? allowanceTypes?.find((a) => a.id === e.value)
                    : deductionTypes?.find((d) => d.id === e.value);

                setFormData({
                  ...formData,
                  typeId: e.value,
                  name: selected?.name || "",
                });
              }}
              placeholder={`Select ${activeIndex === 0 ? "Allowance" : "Deduction"} Type`}
              className="w-full"
            />
          </div>

          {/* Name Field */}
          <div className="p-field">
            <label htmlFor="name">
              Name<span className="text-red-500">*</span>
            </label>
            <InputText
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full"
            />
          </div>

          {/* Amount Field */}
          <div className="p-field">
            <label htmlFor="amount">
              Amount<span className="text-red-500">*</span>
            </label>
            <InputNumber
              id="amount"
              value={formData.amount}
              onValueChange={(e) =>
                setFormData({ ...formData, amount: e.value ?? 0 })
              }
              locale="en-UG"
              className="w-full"
            />
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default ManageSalaryStructure;
