//@ts-nocheck
import React, { useEffect, useRef, useState } from "react";
import { ColDef, ICellRendererParams } from "ag-grid-community";
import { Icon } from "@iconify/react";

import Table from "../../../components/table";
import BreadCrump from "../../../components/layout/bread_crump";
import { Inventory } from "../../../redux/slices/types/inventory/Inventory";
import axios from "axios";
import { baseURL } from "../../../utils/api";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { useParams } from "react-router-dom";

const ItemTransactionsRecords: React.FC = () => {
  const token = useSelector((state: RootState) => state.userAuth.token.access_token)
  const tableRef = useRef<any>(null);
  const [transactions, setTransactions] = useState([])
  const { id, name } = useParams();

  const [dialogState, setDialogState] = useState<{
    selectedItem: Inventory | undefined;
    currentAction: "delete" | "edit" | "add" | "";
  }>({ selectedItem: undefined, currentAction: "" });

  const handleExportPDF = () => {
    if (tableRef.current) {
      tableRef.current.exportPDF();
    }
  };

  useEffect(()=> {
      const getStockOutRecords = async (id: any) => {
        const response = await axios.get(`${baseURL}/erp/inventories/${id}/inventorymovements`, {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });

        console.log(response.data)
        if(response.data.success) {
            setTransactions(response.data.data)
        }
      }
      getStockOutRecords(id)
  }, [id])


  useEffect(()=> {
    const getStockOutRecords = async (id: any) => {
      const response = await axios.get(`${baseURL}/erp/inventories/${id}/inventorymovements`, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
      console.log(response)
    }
    getStockOutRecords(1)
  }, [])

  const columnDefinitions: ColDef<any>[] = [
    // {
    //   headerName: "#",
    //   field: "id",
    //   sortable: true,
    //   filter: true,
    //   width: 100,
    // },
    // {
    //   headerName: "Name",
    //   field: "item.name",
    //   sortable: true,
    //   filter: true,
    // },
    {
      headerName: "Category",
      sortable: true,
      filter: true,
      suppressSizeToFit: true,
      cellRenderer: (params: ICellRendererParams) => {
        const category = !params.data.from_warehouse ? 'In' : 'Out';
        return <div>{category}</div>;
      },
    },
    {
      headerName: "Quantity",
      field: "quantity",
      sortable: true,
      filter: true,
      suppressSizeToFit: true,
    },

    {
      headerName: "From",
      field: "from_warehouse.name",
      sortable: true,
      filter: true,
      suppressSizeToFit: true,
    },
    {
      headerName: "To",
      field: "to_warehouse.name",
      sortable: true,
      filter: true,
      suppressSizeToFit: true,
    },
    {
      headerName: "Date",
      field: "movement_date",
      sortable: true,
      filter: true,
      suppressSizeToFit: true,
    },
    {
        headerName: "Picked By",
        field: "picked_by",
        sortable: true,
        filter: true,
        suppressSizeToFit: true,
      },
    // {
    //   headerName: "Actions",
    //   field: "id",
    //   sortable: false,
    //   filter: false,
    //   //@ts-expect-error --ignore
    //   cellRenderer: (params: ICellRendererParams<Inventory>) => (
    //     <div className="flex items-center gap-2">
    //       {/* <button
    //         className="bg-shade px-2 py-1 rounded text-white"
    //         onClick={() =>
    //           setDialogState({
    //             ...dialogState,
    //             currentAction: "edit",
    //             selectedItem: params.data,
    //           })
    //         }
    //       >
    //         View
    //       </button> */}
    //       {/* <Icon
    //         onClick={() =>
    //           setDialogState({
    //             ...dialogState,
    //             currentAction: "delete",
    //             selectedItem: params.data,
    //           })
    //         }
    //         icon="solar:trash-bin-trash-bold"
    //         className="text-red-500 cursor-pointer"
    //         fontSize={20}
    //       /> */}
    //     </div>
    //   ),
    // },
  ];

  return (
    <div>
      <BreadCrump name="Inventory" pageName="Items" />
      <div className="bg-white px-8 rounded-lg">
        <div className="flex justify-between items-center">
          <div className="py-2">
            <h1 className="text-xl font-bold">{name} Inventory Transactions History</h1>
          </div>
          <div className="flex gap-2">
            {/* <button
              onClick={() =>
                setDialogState({
                  selectedItem: undefined,
                  currentAction: "add",
                })
              }
              className="bg-shade px-2 py-1 rounded text-white flex gap-2 items-center"
            >
              <Icon icon="solar:add-circle-bold" fontSize={20} />
              Stock Out
            </button> */}
            <button
              className="bg-shade px-2 py-1 rounded text-white flex gap-2 items-center"
              onClick={handleExportPDF}
            >
              <Icon icon="solar:printer-bold" fontSize={20} />
              Print
            </button>
          </div>
        </div>
        <Table columnDefs={columnDefinitions} data={transactions} ref={tableRef} />
      </div>
    </div>
  );
};

export default ItemTransactionsRecords;
