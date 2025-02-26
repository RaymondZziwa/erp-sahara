import React, { useRef, useState } from "react";
import { ColDef, ICellRendererParams } from "ag-grid-community";
import { Icon } from "@iconify/react";

import AddOrModifyFarmGroup from "./AddOrModifyItem";
import ConfirmDeleteDialog from "../../components/dialog/ConfirmDeleteDialog";
import BreadCrump from "../../components/layout/bread_crump";
import Table from "../../components/table";
import useFarmGroups from "../../hooks/farm_groups/useFarmGroups";
import { FarmGroup } from "../../redux/slices/types/farmGroups/FarmGroup";
import { FARM_GROUPS_ENDPOINTS } from "../../api/farmGroupsEndpoints";
import { Link } from "react-router-dom";

const FarmGroups: React.FC = () => {
  const { data: farmGroups, refresh } = useFarmGroups();
  const tableRef = useRef<any>(null);

  const [dialogState, setDialogState] = useState<{
    selectedItem: FarmGroup | undefined;
    currentAction: "delete" | "edit" | "add" | "";
  }>({ selectedItem: undefined, currentAction: "" });

  const handleExportPDF = () => {
    tableRef.current?.exportPDF();
  };

  const columnDefinitions: ColDef<FarmGroup>[] = [
    {
      headerName: "ID",
      field: "id",
      sortable: true,
      filter: true,
      width: 100,
      sort: "asc",
      cellRenderer: (params: ICellRendererParams<FarmGroup>) => (
        <Link className="text-teal-500" to={`/farm/groups/${params.data?.id}`}>
          {params?.data?.id?.toString() ?? "N/A"}
        </Link>
      ),
    },
    {
      headerName: "Organization Name",
      field: "customer.organization_name",
      sortable: true,
      filter: true,
      cellRenderer: (params: ICellRendererParams<FarmGroup>) => (
        <Link className="text-teal-500" to={`/farm/groups/${params.data?.id}`}>
          {params?.data?.customer?.organization_name?.toString() ?? "N/A"}
        </Link>
      ),
    },
    {
      headerName: "Number of Members",
      field: "number_of_members",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Email",
      field: "customer.email",
      sortable: true,
      filter: true,
      cellRenderer: (params: ICellRendererParams<FarmGroup>) => (
        params?.data?.customer?.email ?? "N/A"
      ),
    },
    {
      headerName: "Primary Contact Person",
      field: "customer.primary_contact_person",
      sortable: true,
      filter: true,
      cellRenderer: (params: ICellRendererParams<FarmGroup>) => (
        params?.data?.customer?.primary_contact_person ?? "N/A"
      ),
    },
    {
      headerName: "Phone Number",
      field: "customer.phone_number",
      sortable: true,
      filter: true,
      cellRenderer: (params: ICellRendererParams<FarmGroup>) => (
        params?.data?.customer?.phone_number ?? "N/A"
      ),
    },
    {
      headerName: "Actions",
      field: "id",
      sortable: false,
      filter: false,
      cellRenderer: (params: ICellRendererParams<FarmGroup>) => (
        <div className="flex items-center gap-2">
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
      <AddOrModifyFarmGroup
        onSave={refresh}
        item={dialogState.selectedItem}
        visible={
          dialogState.currentAction === "add" ||
          (dialogState.currentAction === "edit" && !!dialogState.selectedItem?.id)
        }
        onClose={() => setDialogState({ currentAction: "", selectedItem: undefined })}
      />

      {dialogState.currentAction === "delete" && dialogState.selectedItem && (
        <ConfirmDeleteDialog
          apiPath={FARM_GROUPS_ENDPOINTS.FARM_GROUPS.DELETE(dialogState.selectedItem.id.toString())}
          onClose={() => setDialogState({ currentAction: "", selectedItem: undefined })}
          visible={true}
          onConfirm={() => {
            refresh();
            setDialogState({ currentAction: "", selectedItem: undefined });
          }}
        />
      )}

      <BreadCrump name="Farm Groups" pageName="All" />
      <div className="bg-white px-8 rounded-lg">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">Farm Groups Table</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setDialogState({ currentAction: "add", selectedItem: undefined })}
              className="bg-shade px-2 py-1 rounded text-white flex gap-2 items-center"
            >
              <Icon icon="solar:add-circle-bold" fontSize={20} />
              Add Farm Group
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
        <Table columnDefs={columnDefinitions} data={farmGroups ?? []} ref={tableRef} />
      </div>
    </div>
  );
};

export default FarmGroups;
