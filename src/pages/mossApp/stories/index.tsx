import React, { useRef, useState } from "react";
import { ColDef, ICellRendererParams } from "ag-grid-community";
import { Icon } from "@iconify/react";

import ConfirmDeleteDialog from "../../../components/dialog/mossApp/ConfirmDeleteDialog";
import Table from "../../../components/table";
import BreadCrump from "../../../components/layout/bread_crump";
import AddOrModifyItem from "./AddOrModifyItem";

import { MOSS_APP_ENDPOINTS } from "../../../api/mossAppEndpoints";

import useStories from "../../../hooks/mossApp/useStories";
import { Story } from "../../../redux/slices/types/mossApp/Story";
import StoriesAccordion from "./StoriesAccordion";
import { TabPanel, TabView } from "primereact/tabview";
import AddStory from "./AddStory";

const Stories: React.FC = () => {
  const { data, refresh } = useStories();
  const tableRef = useRef<any>(null);

  const [dialogState, setDialogState] = useState<{
    selectedItem: Story | undefined;
    currentAction: "delete" | "edit" | "add" | "";
  }>({ selectedItem: undefined, currentAction: "" });

  const handleExportPDF = () => {
    if (tableRef.current) {
      tableRef.current.exportPDF();
    }
  };

  const columnDefinitions: ColDef<Story>[] = [
    {
      headerName: "ID",
      field: "id",
      sortable: true,
      filter: true,
      width: 100,
    },
    {
      headerName: "Title",
      field: "title",
      sortable: true,
      filter: true,
    },
    {
      headerName: "User Name",
      field: "user.display_name",
      sortable: true,
      filter: true,
    },
    {
      headerName: "User Email",
      field: "user.email",
      sortable: true,
      filter: true,
    },

    {
      headerName: "Actions",
      field: "id",
      sortable: false,
      filter: false,
      cellRenderer: (params: ICellRendererParams<Story>) => (
        <div className="flex items-center gap-2">
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
      <ConfirmDeleteDialog
        apiPath={MOSS_APP_ENDPOINTS.STORIES.DELETE(
          dialogState.selectedItem?.id.toString() ?? ""
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
      <BreadCrump name="Stories" pageName="All" />
      <TabView>
        <TabPanel header={"Table View"}>
          <div className="flex justify-between items-center">
            <div className="py-2">
              <h1 className="text-xl font-bold">Stories Table</h1>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() =>
                  setDialogState({
                    selectedItem: undefined,
                    currentAction: "add",
                  })
                }
                className="bg-shade px-2 py-1 rounded text-white  gap-2 items-center hidden"
              >
                <Icon icon="solar:add-circle-bold" fontSize={20} />
                Add Story
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
          <Table columnDefs={columnDefinitions} data={data} ref={tableRef} />
        </TabPanel>
        <TabPanel header={"Accordion view"}>
          <StoriesAccordion stories={data} />
        </TabPanel>
        <TabPanel header={"Add Story"}>
          <AddStory onSave={refresh} />
        </TabPanel>
      </TabView>

      <div className="bg-white px-8 rounded-lg"></div>
    </div>
  );
};

export default Stories;
