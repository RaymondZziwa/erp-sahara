import { TabPanel, TabView } from "primereact/tabview";
import React from "react";
import { useParams } from "react-router-dom";

import ProductionPlanSchedules from "../schedules";
import ProductionMaterialPlans from "../materialPlans";

const ProductionPlanDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  if (!id) {
    return <div>No Id</div>;
  }

  return (
    <div className="my-4">
      <TabView>
        <TabPanel header="Schedules">
          <ProductionPlanSchedules productionPlanId={id} />
        </TabPanel>
        <TabPanel header="Material Plans">
          <ProductionMaterialPlans productionPlanId={id} />
        </TabPanel>
      </TabView>
    </div>
  );
};

export default ProductionPlanDetails;
