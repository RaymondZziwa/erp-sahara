import { TabPanel, TabView } from "primereact/tabview";
import DetailedBalanceSheet from "./DetailedBalanceSheet";
import ComparisonBalanceSheet from "./ComparisonBalancesheet";

const BalanceSheet = () => {
  return (
    <TabView>
      <TabPanel header="Detailed Blance Sheet">
        <DetailedBalanceSheet />
      </TabPanel>
      <TabPanel header="Comparison Balance Sheet">
        <ComparisonBalanceSheet />
      </TabPanel>
    </TabView>
  );
};

export default BalanceSheet;
