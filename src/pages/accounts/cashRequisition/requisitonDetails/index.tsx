import React from "react";
import { useParams } from "react-router-dom";

import CashRequisitionDetailsView from "./CashRequisitionDetailsView";
import useCashRequisitions from "../../../../hooks/accounts/cash_requisitions/useCashRequsitions";
import { TabPanel, TabView } from "primereact/tabview";
import RequisitionStats from "./RequisitionStats";
import useCurrencies from "../../../../hooks/procurement/useCurrencies";
import BudgetCheck from "./BudgetCheck";
const stats = {
  total_requisitions: 1,
  total_amount_requested: "200.00",
  approval_stats: {
    approved: 1,
  },
  average_processing_time: "0.0000",
  requisitions_by_department: [
    {
      department_id: 1,
      count: 1,
    },
  ],
  top_requesters: [
    {
      requester_id: 1,
      total_price: "200.00",
    },
  ],
  budget_utilization: {
    total_used_budget: 0,
    total_budget: 0,
    utilization_percentage: 0,
  },
  itemized_statistics: [
    {
      item_name: "Travvel",
      count: 2,
    },
  ],
};
const CashRequisitionDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  // Fetch project data and related information
  const { data: cashRequisitions } = useCashRequisitions();

  const cashRequisition = cashRequisitions.find(
    (cashRequisition) => cashRequisition.id.toString() === id
  );
  const { data: currencies } = useCurrencies();

  if (!cashRequisition) return <div>Loading...</div>;

  return (
    <div className="my-4">
      <TabView>
        {/* First Tab: Cash Requisition Details */}
        <TabPanel header="Details">
          <CashRequisitionDetailsView cashRequisition={cashRequisition} />
        </TabPanel>
        {/* Second Tab: Requisition Stats */}
        {
          <TabPanel header="Buget Check">
            <BudgetCheck requisition={cashRequisition} />
          </TabPanel>
        }
        {/* Second Tab: Requisition Stats */}
        <TabPanel header="Statistics">
          <RequisitionStats
            stats={stats} // Assuming stats is part of cashRequisition data
            currency={currencies?.find(
              (curr) => curr.id === cashRequisition.currency_id
            )}
          />
        </TabPanel>
      </TabView>
    </div>
  );
};

export default CashRequisitionDetails;
