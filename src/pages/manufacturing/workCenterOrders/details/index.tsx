import { TabPanel, TabView } from "primereact/tabview";
import React from "react";
import { useParams } from "react-router-dom";
import CenterTasks from "../../workEquipment/details/centerTasks";

const OrderDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return <div>No Id</div>;
  }

  return (
    <div className="my-4">
      <TabView>
        <TabPanel header="Tasks">
          <CenterTasks centerId={id} />
        </TabPanel>
      </TabView>
    </div>
  );
};

export default OrderDetails;
