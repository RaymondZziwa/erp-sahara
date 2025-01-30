import { useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Badge } from "primereact/badge";
import { Button } from "primereact/button";
import { ProgressSpinner } from "primereact/progressspinner";
import {
  CashRequisition,
  Cashrequisitionitem,
} from "../../../../redux/slices/types/accounts/cash_requisitions/CashRequisition";

import StatusChips from "../../../../components/chips/StatusChips";
import useAuth from "../../../../hooks/useAuth";
import useCashRequisitions from "../../../../hooks/accounts/cash_requisitions/useCashRequsitions";
import { createRequest } from "../../../../utils/api";
import { ACCOUNTS_ENDPOINTS } from "../../../../api/accountsEndpoints";
import { InputNumber } from "primereact/inputnumber";
import useCurrencies from "../../../../hooks/procurement/useCurrencies";
import useApprovalLevels from "../../../../hooks/accounts/cash_requisitions/useApprovalLevels";
import { InputTextarea } from "primereact/inputtextarea";

enum RequisitionStatus {
  Pending = "pending",
  Approved = "approved",
  PartiallyApproved = "partially_approved",
  FullyApproved = "fully_approved",
  Declined = "declined",
  Disbursed = "disbursed",
}

interface ApproveRequsition {
  comment: string;
  approver_id: number;
  items: string | Item[];
}

interface Item {
  item_id: number;
  status: string;
  approved_amount: number;
  comments: string;
}

export default function PurchaseRequisitionDetails({
  cashRequisition,
}: {
  cashRequisition: CashRequisition;
}) {
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const { user, token } = useAuth();
  const { refresh, loading: cashReqLoading } = useCashRequisitions();
  const [selectedItems, setSelectedItems] = useState<Cashrequisitionitem[]>([]);
  const [updatedItems, setUpdatedItems] = useState<Cashrequisitionitem[]>(
    cashRequisition.cash_requisition_items
  );
  const { data: currencies } = useCurrencies();
  const { data: approvalLevels } = useApprovalLevels();
  const handleAmountChange = (itemId: number, value: string) => {
    setUpdatedItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId ? { ...item, approved_amount: value } : item
      )
    );
  };

  const handleAction = async (action: string) => {
    setLoading(true);
    const endpointMap: Record<string, Function> = {
      approve: ACCOUNTS_ENDPOINTS.CASH_REQUISITIONS.APPROVE,
      reject: ACCOUNTS_ENDPOINTS.CASH_REQUISITIONS.REJECT,
      disburse: ACCOUNTS_ENDPOINTS.CASH_REQUISITIONS.DISBURSE,
      delete: ACCOUNTS_ENDPOINTS.CASH_REQUISITIONS.DELETE,
    };

    const endpoint = endpointMap[action](cashRequisition.id.toString());
    const data: ApproveRequsition = {
      approver_id: user.id,
      comment: comment,
      items: [],
    };

    if (action !== "delete") {
      data.comment = comment; // Only add comment for approve, reject, or disburse actions
      data.items = updatedItems
        .filter((item) => item.approved_amount && +item.approved_amount >= 0)
        .map((item) => ({
          approved_amount: item.approved_amount ? +item.approved_amount : 0,
          comments: "",
          item_id: item.id,
          cash_requisition_item_id: item.id,
          status: action === "approve" ? "approved" : "rejected",
        })); // Add updated items if not deleting
    }

    try {
      await createRequest(endpoint, token.access_token, data, refresh, "POST");
      console.log(`${action.charAt(0).toUpperCase() + action.slice(1)}d`);
    } catch (error) {
      console.error("Error performing action:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto md:p-6 space-y-6">
      <div className="">
        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
          <h2 className="text-2xl font-bold">{cashRequisition.title}</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm font-bold text-muted-foreground">
              Requisition Number
            </p>
            <p className="text-lg text-teal-500">
              {cashRequisition.requisition_no}
            </p>
          </div>
          <div>
            <p className="text-sm font-bold text-muted-foreground">
              Total Amount
            </p>
            <p>{`${cashRequisition.total_amount} ${
              currencies.find(
                (currency) => currency.id == cashRequisition.currency_id
              )?.code
            }`}</p>
          </div>
          <div>
            <p className="text-sm font-bold text-muted-foreground">
              Delivery on or before
            </p>
            <p>{cashRequisition.date_expected}</p>
          </div>
          <div>
            <p className="text-sm font-bold text-muted-foreground">
              Created At
            </p>
            <p>{new Date(cashRequisition.created_at).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm font-bold text-muted-foreground">
              Last Updated
            </p>
            <p>{new Date(cashRequisition.updated_at).toLocaleString()}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-sm font-bold text-muted-foreground">Purpose</p>
            <p>{cashRequisition.purpose}</p>
          </div>
          <div>
            <p className="text-sm font-bold text-muted-foreground">
              Current Level
            </p>
            <p>
              {cashRequisition.current_approval_level +
                "/" +
                approvalLevels.length}
            </p>
          </div>
          <div>
            <p className="text-sm font-bold text-muted-foreground">Status</p>
            <p>
              <StatusChips
                status={
                  cashRequisition.status.toLowerCase() === "pending"
                    ? "Pending"
                    : cashRequisition.status === "approved"
                    ? "Approved"
                    : cashRequisition.status === "partially_approved"
                    ? "Partially Approved"
                    : cashRequisition.status === "rejected"
                    ? "Rejected"
                    : cashRequisition.status === "fully_approved"
                    ? "Approved"
                    : "Unknown"
                }
              />
            </p>
          </div>
        </div>

        {/* Requisition Items DataTable */}
        <DataTable
          scrollable
          size="small"
          value={updatedItems}
          className="mt-6 max-w-screen-sm md:max-w-screen-2xl"
          header="Requisition Items"
          selectionMode="multiple"
          selection={selectedItems}
          onSelectionChange={(e) => setSelectedItems(e.value)}
        >
          <Column selectionMode="multiple" headerStyle={{ width: "3em" }} />
          <Column field="item_name" header="Name" />
          <Column field="quantity" header="Quantity" />
          <Column
            field="unit_cost"
            header="Unit Price"
            body={(rowData) => `${rowData.unit_cost}`}
          />
          <Column
            field="total_price"
            header="Total Price"
            body={(rowData) => `${rowData.total_price}`}
          />
          <Column
            field="approved_amount"
            header="Total Amount"
            body={(rowData: Cashrequisitionitem) => {
              return (
                <span>{+rowData.unit_cost * +rowData.quantity || "N/A"}</span>
              );
            }}
          />
          <Column
            field="approval_status"
            header="Status"
            body={(rowData: Cashrequisitionitem) => (
              <StatusChips
                status={
                  rowData.approval_status.toLowerCase() === "pending"
                    ? "Pending"
                    : rowData.approval_status === "approved"
                    ? "Approved"
                    : rowData.approval_status === "partially_approved"
                    ? "Partially Approved"
                    : rowData.approval_status === "rejected"
                    ? "Rejected"
                    : rowData.approval_status === "fully_approved"
                    ? "Approved"
                    : "Unknown"
                }
              />
            )}
          />
          <Column
            field="approved_amount"
            header="Approved Amount"
            body={(rowData) => {
              return rowData.approval_status.toLowerCase() ===
                RequisitionStatus.FullyApproved ? (
                <InputNumber
                  type="text"
                  value={rowData.approved_amount || ""}
                  onChange={(e) =>
                    handleAmountChange(
                      rowData.id,
                      e.value ? e.value?.toString() : ""
                    )
                  }
                  placeholder="Enter approved amount"
                />
              ) : (
                <span>{rowData.approved_amount || "N/A"}</span>
              );
            }}
          />

          <Column
            header="Comment"
            body={(rowData: Cashrequisitionitem) => (
              <input
                type="text"
                className="p-inputtext"
                placeholder="Add a comment"
                onChange={(e) => {
                  console.log(
                    `Comment for ${rowData.item_name}: ${e.target.value}`
                  );
                  // Optionally update comments state here
                }}
              />
            )}
          />
        </DataTable>
        {/* Budget and Project Information */}

        {cashRequisition.budget && (
          <div className="mt-6 space-y-2 grid md:grid-cols-3">
            <div>
              <p className="text-sm font-bold text-muted-foreground">
                Budget Name
              </p>
              <p>{cashRequisition?.budget?.name}</p>
              <p className="text-sm font-bold text-muted-foreground">
                Allocated Amount
              </p>
              <p>{`${cashRequisition?.budget?.allocated_amount} ${
                currencies.find(
                  (currency) => currency.id == cashRequisition.currency_id
                )?.code
              }`}</p>
              <p className="text-sm font-bold text-muted-foreground">
                Spent Amount
              </p>
              <p>{`${cashRequisition?.budget?.spent_amount} ${
                currencies.find(
                  (currency) => currency.id == cashRequisition.currency_id
                )?.code
              }`}</p>
            </div>
            {cashRequisition.project && (
              <div>
                <p className="text-sm font-bold text-muted-foreground">
                  Project Name
                </p>
                <p>{cashRequisition?.project.name}</p>
                <p className="text-sm font-bold text-muted-foreground">
                  Project Start Date
                </p>
                <p>
                  {new Date(
                    cashRequisition?.project.start_date
                  ).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Approval and Fund Availability */}
        <div className="mt-6 space-y-2">
          <div className="flex items-center space-x-2">
            <Badge
              value={cashRequisition.requisition_approval_level ? "Yes" : "No"}
              severity={
                cashRequisition.requisition_approval_level
                  ? "success"
                  : "danger"
              }
            />
            <span className="text-sm text-muted-foreground">
              Budgeted expenditure
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Badge
              value={cashRequisition.approved_total_amount ? "Yes" : "No"}
              severity={
                cashRequisition.approved_total_amount ? "success" : "danger"
              }
            />
            <span className="text-sm text-muted-foreground">
              Funds available
            </span>
          </div>
        </div>

        {/* Comments Input */}
        <div className="mt-6">
          <InputTextarea
            disabled={cashRequisition.status == RequisitionStatus.Approved}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add a comment for the approval process..."
            className="w-full p-inputtext h-24"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end mt-4 space-x-2">
          {loading || cashReqLoading ? (
            <ProgressSpinner
              style={{ width: "50px", height: "50px" }}
              strokeWidth="3"
              fill="var(--surface-ground)"
              animationDuration=".8s"
            />
          ) : (
            <div className="grid md:flex gap-2">
              <Button
                size="small"
                label="Approve"
                icon="pi pi-check"
                className={` ${
                  cashRequisition.status == RequisitionStatus.Approved
                    ? "hidden"
                    : "block"
                } `}
                onClick={() => handleAction("approve")}
              />
              <Button
                className={` ${
                  cashRequisition.status == RequisitionStatus.Approved
                    ? "hidden"
                    : "block"
                } !bg-red-400`}
                size="small"
                label="Reject"
                icon="pi pi-times"
                severity="danger"
                onClick={() => handleAction("reject")}
              />
              <Button
                disabled={cashRequisition.status !== RequisitionStatus.Approved}
                size="small"
                label="Disburse"
                icon="pi pi-dollar"
                className={` ${
                  cashRequisition.status == RequisitionStatus.Approved
                    ? "block"
                    : "hidden"
                } !bg-orange-500`}
                onClick={() => handleAction("disburse")}
              />
              <Button
                disabled={cashRequisition.status == RequisitionStatus.Approved}
                size="small"
                label="Delete"
                icon="pi pi-trash"
                severity="danger"
                className={` ${
                  cashRequisition.status == RequisitionStatus.Approved
                    ? "hidden"
                    : "block"
                } !bg-red-500`}
                onClick={() => handleAction("delete")}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
