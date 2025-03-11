import { TabPanel, TabView } from "primereact/tabview";
import React from "react";
import { useParams } from "react-router-dom";
//import CenterTasks from "../../workEquipment/details/centerTasks";
import CenterCapacityLogs from "../centerCapacityLog";
import CenterDownTimeLogs from "../centerDownTimeLog";

const EqupmentDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return <div>No Id</div>;
  }

  return (
    <div className="my-4">
      <TabView>
        <TabPanel header="Capacity Logs">
          <CenterCapacityLogs centerId={id} />
        </TabPanel>
        <TabPanel header="DownTime Logs">
          <CenterDownTimeLogs centerId={id} />
        </TabPanel>
      </TabView>
    </div>
  );
};

export default EqupmentDetails;
