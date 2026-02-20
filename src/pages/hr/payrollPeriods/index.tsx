import React, { useRef, useState } from "react";
import { ColDef, ICellRendererParams } from "ag-grid-community";
import { Icon } from "@iconify/react";

import AddOrModifyItem from "./AddOrModifyItem";
import ConfirmDeleteDialog from "../../../components/dialog/ConfirmDeleteDialog";
import BreadCrump from "../../../components/layout/bread_crump";
import Table from "../../../components/table";

import { HUMAN_RESOURCE_ENDPOINTS } from "../../../api/hrEndpoints";
import usePayrollPeriods from "../../../hooks/hr/usePayRollPeriods";
import { PayRollPeriod } from "../../../redux/slices/types/hr/salary/PayRollPeriod";
import GenerateGrossPayrollModal from "./generateGrossPayroll";
import { ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";

const PayrollPeriods: React.FC = () => {
  const navigate = useNavigate()
  const { data, refresh } = usePayrollPeriods();
  const tableRef = useRef<any>(null);
  const [displayModal, setDisplayModal] = useState(false)

  const [dialogState, setDialogState] = useState<{
    selectedItem: PayRollPeriod | undefined;
    currentAction: "delete" | "edit" | "add" | "";
  }>({ selectedItem: undefined, currentAction: "" });
  const [schedule, setSelectedSchedule] = useState()

  const columnDefinitions: ColDef<PayRollPeriod>[] = [
    {
      headerName: "Start Date",
      field: "period_start",
      sortable: true,
      filter: true,
    },
    {
      headerName: "End Date",
      field: "period_end",
      sortable: true,
      filter: true,
    },

    {
      headerName: "Created",
      field: "created_at",
      sortable: true,
      filter: true,
      // wrapText: true,
      cellRenderer: (params: ICellRendererParams<PayRollPeriod>) => (
        <div>
          {new Date(params.data?.created_at ?? new Date()).toLocaleString()}
        </div>
      ),
    },
    {
      headerName: "Actions",
      field: "id",
      sortable: false,
      filter: false,
      width: "400px",
      cellRenderer: (params: ICellRendererParams<PayRollPeriod>) => (
        <div className="flex items-center gap-2">
          {
            params.data.status === 'generated' && (
               <button
                  className="bg-shade px-2 py-1 rounded text-white"
                  onClick={(e) => {
                    e.stopPropagation(); // prevent triggering row click
                    navigate(`/hr/payroll/schedules/${params.data.id}/runs`);
                  }}
                >
                  See Run
                </button>
            )
          }
          {
            params.data.status === 'pending' && (
              <button
                className="bg-shade px-2 py-1 rounded text-white"
                onClick={() => {
                  setDisplayModal(true);
                  setSelectedSchedule(params.data);
                }}
              >
                Generate Payroll
              </button>
            )
          }
          {/* <button
            className="bg-shade px-2 py-1 rounded text-white"
            onClick={() =>
              setDialogState({
                ...dialogState,
                currentAction: "edit",
                selectedItem: params.data,
              })
            }
          >
            Edit
          </button> */}
          <Icon
            onClick={() =>
              setDialogState({
                ...dialogState,
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
      <ToastContainer />
      <AddOrModifyItem
        onSave={refresh}
        item={dialogState.selectedItem}
        visible={
          dialogState.currentAction == "add" ||
          (dialogState.currentAction == "edit" &&
            !!dialogState.selectedItem?.id)
        }
        onClose={() =>
          setDialogState({ currentAction: "", selectedItem: undefined })
        }
      />
      {dialogState.selectedItem && (
        <ConfirmDeleteDialog
          apiPath={HUMAN_RESOURCE_ENDPOINTS.PAYROLL_PERIODS.DELETE(
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
      <BreadCrump name="Payroll schedule" pageName="All" />
      <div className="bg-white px-8 rounded-lg">
        <div className="flex justify-between items-center">
          <div className="py-2">
            <h1 className="text-xl font-bold">Payroll schedule</h1>
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
              Add Schedule
            </button>
          </div>
        </div>
        <Table columnDefs={columnDefinitions} data={data} ref={tableRef} />
      </div>
      {displayModal && <GenerateGrossPayrollModal visible={displayModal} onClose={() => setDisplayModal(false)} schedule={schedule} />}
    </div>
  );
};

export default PayrollPeriods;
