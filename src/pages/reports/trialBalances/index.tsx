import { TabPanel, TabView } from "primereact/tabview";
import DetailedTrialBalances from "./DetailedTrialBalances";
import ComparisonTrialBalances from "./ComparisonTrailBalances";

const TrailBalances = () => {
  return (
    <TabView>
      <TabPanel header="Detailed Trial Blance">
        <DetailedTrialBalances />
      </TabPanel>
      <TabPanel header="Comparison Trial Balance">
        <ComparisonTrialBalances />
      </TabPanel>
    </TabView>
  );
};

export default TrailBalances;
