import React, { useRef, useState } from "react";
import { ColDef, ICellRendererParams } from "ag-grid-community";
import { Icon } from "@iconify/react";
import { toast, ToastContainer } from "react-toastify";
import BreadCrump from "../../../../components/layout/bread_crump";
import useQaSettings from "../../../../hooks/procurement/itemPurchases/useQaSettings";
import useAuth from "../../../../hooks/useAuth";
import { QaSetting } from "../../../../redux/slices/types/itemPurchases/qaSettings";
import AddOrModifyItem from "../../procTypes/AddOrModify";
import Table from "../../../../components/table";
import EditQaSettingsModal from "./Modify";
import { baseURL, createRequest } from "../../../../utils/api";

const QaSettings: React.FC = () => {
  const tableRef = useRef<any>(null);
  const { data: qaSettings, refresh } = useQaSettings();
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const { token } = useAuth();

  const onSave = async (updatedValues: typeof qaValues) => {
    try {
      // Send updated QA values to API
      const response = await createRequest(`/purchases/qasettings/update`, token.access_token, JSON.stringify(updatedValues), ()=> {}, 'PUT')
     
      if (!response.success) {
        throw new Error('Failed to save QA settings');
      } else {
        toast.success("QA settings updated successfully");
      }
  
      // Optionally parse response if needed
      // const result = await response.json();
  
      // Update state locally
      setQaValues(updatedValues);
  
      // Refresh your table or data after save
      refresh();
  
      // Close modal or UI
      setEditModalVisible(false);
    } catch (error) {
      console.error('Error saving QA settings:', error);
      // Optionally show error to user
    }
  };
  

  
// Convert array to object
const initialQaValues = qaSettings.reduce((acc, curr) => {
  acc[curr.name] = curr.value;
  return acc;
}, {} as Record<string, number>);

// If you want to add the reason string too:
const initialState = {
  ...initialQaValues,
  reason: "",
};

const [qaValues, setQaValues] = useState(initialState);
  

  const [dialogState, setDialogState] = useState<{
    selectedItem: QaSetting | undefined;
    currentAction: "delete" | "edit" | "add" | "";
  }>({ selectedItem: undefined, currentAction: "" });

  const columnDefinitions: ColDef<QaSetting>[] = [
    { headerName: "Key", field: "name", sortable: true, filter: true },
    { headerName: "Value", field: "value", sortable: true, filter: true },
  ];

  return (
    <div>
      <ToastContainer />

      {dialogState.currentAction === "add" && (
        <AddOrModifyItem
          visible
          onSave={refresh}
          onClose={() => setDialogState({ currentAction: "", selectedItem: undefined })}
        />
      )}

      {dialogState.currentAction === "edit" && (
        <AddOrModifyItem
          visible
          item={dialogState.selectedItem}
          onSave={refresh}
          onClose={() => setDialogState({ currentAction: "", selectedItem: undefined })}
        />
      )}

      <BreadCrump name="QA Settings" pageName="Settings" />

      <div className="bg-white px-8 py-6 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">QA Settings</h1>
          <div className="flex flex-row gap-1">
          {/* <button
            onClick={() => setDialogState({ selectedItem: undefined, currentAction: "add" })}
            className="bg-teal-500 hover:bg-teal-700 px-3 py-2 rounded text-white flex gap-2 items-center text-sm"
          >
            <Icon icon="solar:add-circle-bold" fontSize={18} />
            Add Setting
          </button> */}
          <button
            onClick={() => setEditModalVisible(true)}
            className="bg-teal-500 hover:bg-teal-700 px-3 py-2 rounded text-white flex gap-2 items-center text-sm"
          >
            <Icon icon="solar:settings-bold" fontSize={18} />
            Edit Setting
          </button>
          </div>
        </div>

        <Table
          columnDefs={columnDefinitions}
          data={qaSettings}
          ref={tableRef}
          pagination
          paginationPageSize={10}
          suppressCellFocus
          domLayout="autoHeight"
        />
      </div>
      <EditQaSettingsModal
        visible={isEditModalVisible}
        initialData={qaSettings}
        onClose={() => setEditModalVisible(false)}
        onSave={onSave}
      />

    </div>
  );
};

export default QaSettings;
