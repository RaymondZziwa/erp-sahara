import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { formatCurrency } from "../../utils/formatCurrency";
import useLedgerChartOfAccounts from "../../hooks/accounts/useLedgerChartOfAccounts";
import { AccountType } from "../../redux/slices/types/accounts/accountTypes";
import { Link } from "react-router-dom";

const AccountsSection = () => {
  const { balances: chartOfAccounts } = useLedgerChartOfAccounts({
    accountType: AccountType.CASH,
  });
  return (
    <Card
      className="bg-white shadow-md rounded-lg p-6 col-span-full xl:col-span-1"
      header={<h3 className="text-xl font-semibold">Bank Accounts</h3>}
    >
      <p className="text-gray-500 text-sm mb-2">Balances and Reviews</p>
      <ul className="list-none space-y-4">
        {chartOfAccounts.map((account, idx) => (
          <li key={idx} className="flex justify-between">
            <div className="flex-1">
              <strong className="block">{account.name}</strong>
              <div className="text-sm text-gray-500 overflow-hidden text-ellipsis whitespace-nowrap max-w-[200px]">
                {account?.description}
              </div>
            </div>
            <div className="text-right">
              <div className={`font-bold text-green-500`}>
                {formatCurrency(account?.balance?.credit_sum ?? 0)}
              </div>
              <div className="text-sm text-red-500">
                {formatCurrency(account.balance?.debit_sum ?? 0)}
              </div>
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex space-x-2">
        <Link to={"/accounts"}>
          <Button
            label="Connect accounts"
            className="p-button-outlined p-button-sm"
          />
        </Link>
        <Link to={"accounts/journal-transactions"}>
          <Button
            label="Go to journals"
            icon="pi pi-angle-down"
            className="p-button-text p-button-sm"
          />
        </Link>
      </div>
    </Card>
  );
};

export default AccountsSection;
