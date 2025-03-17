//@ts-nocheck
import React, { useState } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Button } from "primereact/button";
import axios from "axios";
import { baseURL } from "../../../utils/api";
import { RootState } from "../../../redux/store";
import { useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";

interface props {
    visible: boolean;
    onHide: () => void;
    onSubmit: (data: any) => void;
    id: string
}

const BudgetAllocationModal: React.FC<props> = ({ visible, onHide, onSubmit, id }) => {
    const token = useSelector((state: RootState) => state.userAuth.token.access_token)
  const [formData, setFormData] = useState({
    name: "",
    project_id: "",
    activity_id: "",
    allocated_amount: null,
    description: "",
  });

  const handleChange = (e, field) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      const response = await axios.post(
        `${baseURL}/erp/accounts/budgets/${id}/budgetallocations/create`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if(response.data.success){
        toast.success(response.data.message)
      }else{
        toast.error(response.data.message)
      }
      //toast.success('Success')
      onSubmit(response.data);
      onHide();
    } catch (error) {
      console.error("Error submitting allocation:", error);
    }
  };

  return (
    <>
      <ToastContainer />
      <Dialog header="Add Budget Allocation" visible={visible} onHide={onHide}>
        <div className="p-fluid space-y-4">
          <div className="p-field">
            <label className="font-semibold">
              Name <span className="text-red-500">*</span>
            </label>
            <InputText
              value={formData.name}
              onChange={(e) => handleChange(e, "name")}
              required
            />
          </div>
          <div className="p-field">
            <label>Project ID</label>
            <InputText
              value={formData.project_id}
              onChange={(e) => handleChange(e, "project_id")}
            />
          </div>
          <div className="p-field">
            <label>Activity ID</label>
            <InputText
              value={formData.activity_id}
              onChange={(e) => handleChange(e, "activity_id")}
            />
          </div>
          <div className="p-field">
            <label className="font-semibold">
              Allocated Amount <span className="text-red-500">*</span>
            </label>
            <InputNumber
              value={formData.allocated_amount}
              onValueChange={(e) =>
                setFormData({ ...formData, allocated_amount: e.value })
              }
              required
            />
          </div>
          <div className="p-field">
            <label>Description</label>
            <InputText
              value={formData.description}
              onChange={(e) => handleChange(e, "description")}
            />
          </div>
          <Button
            label="Save"
            icon="pi pi-check"
            onClick={handleSubmit}
            className="p-button-success"
          />
        </div>
      </Dialog>
    </>
  );
};

export default BudgetAllocationModal;