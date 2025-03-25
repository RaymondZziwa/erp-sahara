//@ts-nocheck
import React, { useRef, useState } from "react";
import { ColDef, ICellRendererParams } from "ag-grid-community";
import { Icon } from "@iconify/react";

import AddOrModifyItem from "./AddOrModifyItem";
import ConfirmDeleteDialog from "../../../components/dialog/ConfirmDeleteDialog";
import BreadCrump from "../../../components/layout/bread_crump";
import Table from "../../../components/table";

import { HUMAN_RESOURCE_ENDPOINTS } from "../../../api/hrEndpoints";
import usePayroll from "../../../hooks/hr/usePayroll";
import {
  Payroll,
  PayRollPeriod,
} from "../../../redux/slices/types/hr/salary/PayRollPeriod";
import { useReactToPrint } from "react-to-print";
import { PrintableContent } from "./payroll_print";

const PayrollPage: React.FC = () => {
  const { data, refresh } = usePayroll();
  const tableRef = useRef<any>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const reactToPrintFn = useReactToPrint({ contentRef });

  const [dialogState, setDialogState] = useState<{
    selectedItem: Payroll | undefined;
    currentAction: "delete" | "edit" | "add" | "";
  }>({ selectedItem: undefined, currentAction: "" });

  const columnDefinitions: ColDef<Payroll>[] = [
    {
      headerName: "ID",
      field: "id",
      sortable: true,
      filter: true,
      width: 100,
    },
    {
      headerName: "Name",
      field: "employee",
      sortable: true,
      filter: true,
      cellRenderer: (params: ICellRendererParams<Payroll>) => (
        <div>
          {params.data?.employee?.first_name} {params.data?.employee?.last_name}
        </div>
      ),
    },
    {
      headerName: "Start Date",
      field: "start_date",
      sortable: true,
      filter: true,
      cellRenderer: (params: ICellRendererParams<PayRollPeriod>) => (
        <div>{params.data?.payroll_period.start_date}</div>
      ),
    },
    {
      headerName: "End Date",
      field: "end_date",
      sortable: true,
      filter: true,
      cellRenderer: (params: ICellRendererParams<PayRollPeriod>) => (
        <div>{params.data?.payroll_period.end_date}</div>
      ),
    },
    {
      headerName: "Created",
      field: "created_at",
      sortable: true,
      filter: true,
      cellRenderer: (params: ICellRendererParams<Payroll>) => (
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
      cellRenderer: (params: ICellRendererParams<Payroll>) => (
        <div className="flex items-center gap-2">
          <button
            className="bg-shade px-2 py-1 rounded text-white"
            onClick={() =>
              setDialogState((prev) => ({
                ...prev,
                currentAction: "edit",
                selectedItem: params.data,
              }))
            }
          >
            Edit
          </button>
          <Icon
            onClick={() =>
              setDialogState((prev) => ({
                ...prev,
                currentAction: "delete",
                selectedItem: params.data,
              }))
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
      <AddOrModifyItem
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
      <BreadCrump name="Payroll" pageName="All" />
      <div className="bg-white px-8 rounded-lg">
        <div className="flex justify-between items-center">
          <div className="py-2">
            <h1 className="text-xl font-bold">Payroll</h1>
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
              Add Payroll
            </button>
            <button
              className="bg-shade px-2 py-1 rounded text-white flex gap-2 items-center"
              onClick={reactToPrintFn}
            >
              <Icon icon="solar:printer-bold" fontSize={20} />
              Print
            </button>
          </div>
        </div>
        <Table columnDefs={columnDefinitions} data={data} ref={tableRef} />
      </div>
      <div ref={contentRef} className="print-content">
        <PrintableContent reportName={"Payroll"} data={data} />
        <style>
          {`
                         @media print {
                            .print-content {
                              display: block !important;
                            }
                          }
                          .print-content {
                            display: none;
                          }
                      `}
        </style>
      </div>
    </div>
  );
};

export default PayrollPage;
