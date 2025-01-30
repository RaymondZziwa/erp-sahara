import React from "react";
import { ProgressBar } from "primereact/progressbar";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Currency } from "../../../../redux/slices/types/procurement/Currency";
import useEmployees from "../../../../hooks/hr/useEmployees";
import useDepartments from "../../../../hooks/hr/useDepartments";
import { Divider } from "primereact/divider";

interface CashRequisitionStats {
  total_requisitions: number;
  total_amount_requested: string;
  approval_stats: Approvalstats;
  average_processing_time: string;
  requisitions_by_department: Requisitionsbydepartment[];
  top_requesters: Toprequester[];
  budget_utilization: Budgetutilization;
  itemized_statistics: Itemizedstatistic[];
}

interface Itemizedstatistic {
  item_name: string;
  count: number;
}

interface Budgetutilization {
  total_used_budget: number;
  total_budget: number;
  utilization_percentage: number;
}

interface Toprequester {
  requester_id: number;
  total_price: string;
}

interface Requisitionsbydepartment {
  department_id: number;
  count: number;
}

interface Approvalstats {
  approved: number;
}

interface RequisitionStatsProps {
  currency?: Currency;
  stats: CashRequisitionStats;
}

const RequisitionStats: React.FC<RequisitionStatsProps> = ({
  stats,
  currency,
}) => {
  const {
    budget_utilization,
    total_requisitions,
    approval_stats,
    top_requesters,
    requisitions_by_department,
    itemized_statistics,
  } = stats;

  const { data: employees } = useEmployees();
  const { data: departments } = useDepartments();

  return (
    <div className="py-4">
      <div className="text-2xl font-semibold mb-4">Requisition Overview</div>
      <Divider />

      {/* General Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <p className="text-sm font-bold text-muted-foreground">
            Total Requisitions
          </p>
          <p>{total_requisitions}</p>
        </div>
        <div>
          <p className="text-sm font-bold text-muted-foreground">
            Total Amount Requested
          </p>
          <p>{`${stats.total_amount_requested} ${currency?.code}`}</p>
        </div>
        <div>
          <p className="text-sm font-bold text-muted-foreground">Approved</p>
          <p>{approval_stats.approved}</p>
        </div>
        <div>
          <p className="text-sm font-bold text-muted-foreground">
            Average Processing Time
          </p>
          <p>{stats.average_processing_time} days</p>
        </div>
      </div>

      {/* Budget Utilization */}
      <div className="mb-6">
        <p className="text-sm font-bold text-muted-foreground mb-2">
          Budget Utilization
        </p>
        <div className="flex justify-between mb-2">
          <span className="font-semibold">
            Used: {budget_utilization.total_used_budget}
          </span>
          <span className="font-semibold">
            Total: {budget_utilization.total_budget}
          </span>
        </div>
        <ProgressBar value={budget_utilization.utilization_percentage} />
        <div className="mt-2">
          Utilization: {budget_utilization.utilization_percentage}%
        </div>
      </div>

      {/* Requisitions by Department */}
      <div className="mb-6">
        <p className="text-sm font-bold text-muted-foreground mb-2">
          Requisitions by Department
        </p>
        <DataTable value={requisitions_by_department} responsiveLayout="scroll">
          <Column
            field="department_id"
            header="Department Name"
            body={(rowData: Requisitionsbydepartment) =>
              departments.find(
                (department) => department.id == rowData.department_id
              )?.name
            }
          />
          <Column field="count" header="Count" />
        </DataTable>
      </div>

      {/* Top Requesters */}
      <div className="mb-6">
        <p className="text-sm font-bold text-muted-foreground mb-2">
          Top Requesters
        </p>
        <DataTable value={top_requesters} responsiveLayout="scroll">
          <Column
            field="requester_id"
            header="Requester Name"
            body={(rowData: Toprequester) => {
              const employee = employees.find(
                (employee) => employee.id == rowData.requester_id
              );
              return employee
                ? `${employee.first_name} ${employee.last_name}`
                : "Unknown";
            }}
          />
          <Column field="total_price" header="Total Price" />
        </DataTable>
      </div>

      {/* Itemized Statistics */}
      <div>
        <p className="text-sm font-bold text-muted-foreground mb-2">
          Itemized Statistics
        </p>
        <DataTable value={itemized_statistics} responsiveLayout="scroll">
          <Column field="item_name" header="Item Name" />
          <Column field="count" header="Count" />
        </DataTable>
      </div>
    </div>
  );
};

export default RequisitionStats;
