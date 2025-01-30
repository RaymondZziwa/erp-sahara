import { TabPanel, TabView } from "primereact/tabview";
import ComparisonTrialBalances from "./ComparisonIncomeStatement";
import DetailedIncomeStatement from "./DetailedIncomeStatement";

const IncomeStatement = () => {
  return (
    <TabView>
      <TabPanel header="Detailed Income Statement">
        <DetailedIncomeStatement />
      </TabPanel>
      <TabPanel header="Comparison Income Statemente">
        <ComparisonTrialBalances />
      </TabPanel>
    </TabView>
  );
};

export default IncomeStatement;
