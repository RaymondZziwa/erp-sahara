import React, { useRef, useState } from "react";
import { ColDef, ICellRendererParams } from "ag-grid-community";
import { Icon } from "@iconify/react";
import { toast } from "react-toastify";
import axios from "axios";
import { ASSETSENDPOINTS } from "../../../api/assetEndpoints";
import ConfirmDeleteDialog from "../../../components/dialog/ConfirmDeleteDialog";
import BreadCrump from "../../../components/layout/bread_crump";
import useAuth from "../../../hooks/useAuth";
import { baseURL } from "../../../utils/api";
import Table from "../../../components/table";
import useAssetAssignments from "../../../hooks/assets/useAssetAssignment";
import AddOrModifyAssignment from "./Add0rModify";
import { Dropdown } from "primereact/dropdown";

interface ReturnStatusModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: {
    status: string;
    return_condition: string;
    end_date?: string;
  }) => Promise<void>;
}

const ReturnStatusModal: React.FC<ReturnStatusModalProps> = ({
  visible,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState({
    status: "Returned",
    return_condition: "",
    end_date: "",
  });
  const handleDropdownChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const [isSubmitting, setIsSubmitting] = useState(false);
  const statusOptions = [
    { label: "Returned", value: "Returned" },
    { label: "Damaged", value: "Damaged" },
    { label: "Lost", value: "Lost" },
  ];


  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({
        ...formData,
        end_date: formData.end_date || undefined,
      });
      onClose();
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error("Failed to update status");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Update Asset Status</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <Icon icon="mdi:close" fontSize={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status *
              </label>
              <Dropdown
                name="status"
                value={formData.status}
                options={statusOptions}
                onChange={(e) => handleDropdownChange("status", e.value)}
                placeholder="Select Status"
                className="w-full"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Return Condition *
              </label>
              <textarea
                name="return_condition"
                value={formData.return_condition}
                onChange={handleChange}
                placeholder="Describe the condition of the returned asset"
                className="w-full border p-2 rounded focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date (optional)
              </label>
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                className="w-full border p-2 rounded focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                If not provided, today's date will be used
              </p>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-teal-600 text-white rounded-md text-sm font-medium hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50"
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AssetAssignment: React.FC = () => {
  const { token } = useAuth();
  const { data: assignments, refresh } = useAssetAssignments();
  const tableRef = useRef<any>(null);

  const [dialogState, setDialogState] = useState<{
    selectedItem: AssetAssignment | undefined;
    currentAction: "delete" | "edit" | "add" | "updateStatus" | "";
  }>({ selectedItem: undefined, currentAction: "" });

  const handleExportPDF = () => {
    if (tableRef.current) {
      tableRef.current.exportPDF();
    }
  };

  const handleUpdateStatus = async (
    id: string,
    data: {
      status: string;
      return_condition: string;
      end_date?: string;
    }
  ) => {
    try {
      await axios.put(
        `${baseURL}/assets/assetassignment/${id}/updatestatus`,
        {
          status: data.status,
          return_condition: data.return_condition,
          end_date: data.end_date || new Date().toISOString().split("T")[0],
        },
        {
          headers: {
            Authorization: `Bearer ${token.access_token}`,
          },
        }
      );
      toast.success("Status updated successfully");
      refresh();
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error("Failed to update status");
      throw error;
    }
  };

  const columnDefinitions: ColDef<AssetAssignment>[] = [
    {
      headerName: "Asset",
      field: "asset",
      sortable: true,
      filter: true,
      valueGetter: (params) =>
        params.data?.asset ? `${params.data.asset.name}` : "",
    },
    {
      headerName: "Assigned To",
      field: "assigned_to",
      sortable: true,
      filter: true,
      valueGetter: (params) =>
        params.data?.assigned_to
          ? `${params.data.assigned_to.first_name} ${params.data.assigned_to.last_name}`
          : "",
    },
    {
      headerName: "Reason",
      field: "reason_for_assignment",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Start Date",
      field: "start_date",
      sortable: true,
      filter: true,
      valueFormatter: (params) =>
        params.value ? new Date(params.value).toLocaleDateString() : "",
    },
    {
      headerName: "End Date",
      field: "end_date",
      sortable: true,
      filter: true,
      valueFormatter: (params) =>
        params.value ? new Date(params.value).toLocaleDateString() : "",
    },
    {
      headerName: "Status",
      field: "status",
      sortable: true,
      filter: true,
      cellStyle: (params) => {
        if (params.value === "Returned") return { color: "green" };
        if (params.value === "Damaged") return { color: "orange" };
        if (params.value === "Lost") return { color: "red" };
        return {};
      },
    },
    {
      headerName: "Actions",
      field: "id",
      width: 320,
      cellRenderer: (params: ICellRendererParams<AssetAssignment>) => (
        <div className="flex items-center gap-1">
          <button
            className="bg-shade px-2 py-1 rounded text-white"
            onClick={() =>
              setDialogState({
                currentAction: "edit",
                selectedItem: params.data,
              })
            }
          >
            Edit
          </button>
          {params.data?.status !== "Returned" &&
            params.data?.status !== "Damaged" &&
            params.data?.status !== "Lost" && (
              <button
                className="bg-green-600 px-2 py-1 rounded text-white"
                onClick={() =>
                  setDialogState({
                    currentAction: "updateStatus",
                    selectedItem: params.data,
                  })
                }
              >
                Mark Returned
              </button>
            )}
          <Icon
            onClick={() =>
              setDialogState({
                currentAction: "delete",
                selectedItem: params.data,
              })
            }
            icon="solar:trash-bin-trash-bold"
            className="text-red-500 cursor-pointer"
            fontSize={20}
          />
        </div>
      ),
    },
  ];

  return (
    <div>
      <AddOrModifyAssignment
        onSave={refresh}
        item={dialogState.selectedItem}
        visible={
          dialogState.currentAction === "add" ||
          (dialogState.currentAction === "edit" &&
            !!dialogState.selectedItem?.id)
        }
        onClose={() =>
          setDialogState({ currentAction: "", selectedItem: undefined })
        }
      />

      <ReturnStatusModal
        visible={
          dialogState.currentAction === "updateStatus" &&
          !!dialogState.selectedItem?.id
        }
        onClose={() =>
          setDialogState({ currentAction: "", selectedItem: undefined })
        }
        onSubmit={(data) =>
          handleUpdateStatus(dialogState.selectedItem?.id || "", data)
        }
      />

      {dialogState.selectedItem && (
        <ConfirmDeleteDialog
          apiPath={ASSETSENDPOINTS.ASSETS.ASSIGNMENTS.DELETE(
            dialogState.selectedItem?.id.toString()
          )}
          onClose={() =>
            setDialogState({ selectedItem: undefined, currentAction: "" })
          }
          visible={
            !!dialogState.selectedItem?.id &&
            dialogState.currentAction === "delete"
          }
          onConfirm={refresh}
        />
      )}

      <BreadCrump name="Asset Assignments" pageName="All" />
      <div className="bg-white px-8 rounded-lg">
        <div className="flex justify-between items-center">
          <div className="py-2">
            <h1 className="text-xl font-bold">Asset Assignments</h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() =>
                setDialogState({
                  selectedItem: undefined,
                  currentAction: "add",
                })
              }
              className="bg-shade px-2 py-1 rounded text-white flex gap-2 items-center"
            >
              <Icon icon="solar:add-circle-bold" fontSize={20} />
              Add Assignment
            </button>
            <button
              className="bg-shade px-2 py-1 rounded text-white flex gap-2 items-center"
              onClick={handleExportPDF}
            >
              <Icon icon="solar:printer-bold" fontSize={20} />
              Print
            </button>
          </div>
        </div>
        <Table
          columnDefs={columnDefinitions}
          data={assignments}
          ref={tableRef}
        />
      </div>
    </div>
  );
};

export default AssetAssignment;
