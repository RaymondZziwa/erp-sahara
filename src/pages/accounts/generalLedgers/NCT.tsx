import { SplitButton } from "primereact/splitbutton";
import { MenuItem } from "primereact/menuitem";
import { AccountType } from "../../../redux/slices/types/accounts/accountTypes";

// Define journal types with unique icons
const journalTypes: {
  label: string;
  value: number;
  icon: string;
  endpoint: string;
  debitAccountsType: AccountType;
  creditAccountsType: AccountType;
  creditAccountHeader: string;
  debitAccountHeader: string;
}[] = [
  {
    label: "Add Payable",
    value: 2,
    icon: "pi pi-check",
    endpoint: "/accounts/transactions/add-payable",
    debitAccountsType: AccountType.EXPENSES,
    creditAccountsType: AccountType.LIABILITIES,
    creditAccountHeader: "Liablity",
    debitAccountHeader: "Expense",
  },
  {
    label: "Clear Payable",
    value: 3,
    icon: "pi pi-check",
    endpoint: "/accounts/transactions/clear-payable",
    debitAccountsType: AccountType.LIABILITIES,
    creditAccountsType: AccountType.CASH,
    creditAccountHeader: "Cash",
    debitAccountHeader: "Liabilities",
  },

  {
    label: "Add Receivable",
    value: 5,
    icon: "pi pi-receipt",
    endpoint: "/accounts/transactions/save-receivable",
    debitAccountsType: AccountType.RECEIVABLE,
    creditAccountsType: AccountType.INCOME,
    creditAccountHeader: "Income",
    debitAccountHeader: "Receivable",
  },
  {
    label: "Clear Receivable",
    value: 6,
    icon: "pi pi-trash",
    endpoint: "/accounts/transactions/clear-receivable",
    debitAccountsType: AccountType.CASH,
    creditAccountsType: AccountType.RECEIVABLE,
    creditAccountHeader: "Receivable",
    debitAccountHeader: "Cash",
  },
  {
    label: "Add Prepaid",
    value: 7,
    icon: "pi pi-calendar-plus",
    endpoint: "/accounts/transactions/add-prepaid",
    debitAccountsType: AccountType.PREPAID,
    creditAccountsType: AccountType.CASH,
    creditAccountHeader: "Cash",
    debitAccountHeader: "Prepaid",
  },
  {
    label: "Clear Prepaid",
    value: 8,
    icon: "pi pi-trash",
    endpoint: "/accounts/transactions/clear-prepaid",
    debitAccountsType: AccountType.EXPENSES,
    creditAccountsType: AccountType.PREPAID,
    creditAccountHeader: "Prepaid",
    debitAccountHeader: "Expenses",
  },
  {
    label: "General Transaction",
    value: 10,
    icon: "pi pi-times-circle",
    endpoint: "/accounts/transactions/general-transaction",
    debitAccountsType: AccountType.ALL,
    creditAccountsType: AccountType.ALL,
    creditAccountHeader: "All",
    debitAccountHeader: "All",
  },
];

interface JournalTypeClickParams {
  debitAccountsType: AccountType;
  creditAccountsType: AccountType;
  endpoint: string;
  journalType: string;
  creditAccountHeader: string;
  debitAccountHeader: string;
}

interface LedgerBtnsTypesProps {
  onJournalClick: (params: JournalTypeClickParams) => void;
}

export default function NCTBtnsTypes({
  onJournalClick,
}: LedgerBtnsTypesProps) {
  const items: MenuItem[] = journalTypes.map((jtype) => ({
    label: jtype.label,
    icon: jtype.icon, // Use the unique icon for each journal type
    command: () =>
      onJournalClick({
        debitAccountsType: jtype.debitAccountsType,
        creditAccountsType: jtype.creditAccountsType,
        endpoint: jtype.endpoint,
        journalType: jtype.label,
        creditAccountHeader: jtype.creditAccountHeader, // Example placeholder
        debitAccountHeader: jtype.debitAccountHeader, // Example placeholder
      }),
  }));

  return (
    <div className="card flex justify-content-center">
      <SplitButton
        dropdownIcon="pi pi-plus"
        severity="warning"
        size="small"
        label="None Cash Transactions"
        model={items}
      />
    </div>
  );
}
