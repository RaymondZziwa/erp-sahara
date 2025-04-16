import { useState, useEffect } from "react";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { formatCurrency } from "../../utils/formatCurrency";
import { Link } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { REPORTS_ENDPOINTS } from "../../api/reportsEndpoints";
import { apiRequest } from "../../utils/api";

interface LedgerBalance {
  ledger_id: number;
  ledger_name: string;
  ledger_code: string;
  subcategory: string;
  debit_sum: number;
  total_credit: number;
  net_amount: number;
  normal_balance_side: string;
}

const AccountsSection = () => {
  const { token, isFetchingLocalToken } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [ledgerBalances, setLedgerBalances] = useState<LedgerBalance[]>([]);

  const fetchCashBalances = async () => {
    if (isFetchingLocalToken || !token.access_token) return;

    setIsLoading(true);
    try {
      const response = await apiRequest<LedgerBalance[]>(
        REPORTS_ENDPOINTS.DASHBOARD.CASH_BALANCES.GET_ALL,
        "GET",
        token.access_token
      );

      if (Array.isArray(response.data)) {
        setLedgerBalances(response.data);
      } else {
        console.error("Unexpected response format:", response);
      }
    } catch (error) {
      console.error("Error fetching cash balances:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCashBalances();
  }, [isFetchingLocalToken, token.access_token]);

  const getBalanceColor = (normalBalanceSide: string, amount: number) => {
    if (normalBalanceSide === "debit") {
      return amount >= 0 ? "text-green-500" : "text-red-500";
    } else {
      return amount >= 0 ? "text-red-500" : "text-green-500";
    }
  };

  return (
    <Card
      className="bg-white shadow-md rounded-lg p-6 col-span-full xl:col-span-1"
      header={<h3 className="text-xl font-semibold">Cash Ledgers</h3>}
    >
      <p className="text-gray-500 text-sm mb-2">Current Balances</p>

      {isLoading ? (
        <div className="flex justify-center items-center py-4">
          <p>Loading balances...</p>
        </div>
      ) : ledgerBalances.length === 0 ? (
        <div className="flex justify-center items-center py-4">
          <p>No cash ledgers found</p>
        </div>
      ) : (
        <ul className="list-none space-y-4">
          {ledgerBalances.map((ledger) => (
            <li key={ledger.ledger_id} className="flex justify-between">
              <div className="flex-1">
                <strong className="block">{ledger.ledger_name}</strong>
                <div className="text-sm text-gray-500">
                  {ledger.subcategory} ({ledger.ledger_code})
                </div>
              </div>
              <div className="text-right">
                <div className="flex flex-col">
                  <div className="text-xs text-gray-500">
                    Debit: {formatCurrency(ledger.debit_sum)}
                  </div>
                  <div className="text-xs text-gray-500">
                    Credit: {formatCurrency(ledger.total_credit)}
                  </div>
                  <div
                    className={`font-bold mt-1 ${getBalanceColor(
                      ledger.normal_balance_side,
                      ledger.net_amount
                    )}`}
                  >
                    Net: {formatCurrency(ledger.net_amount)}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 flex space-x-2">
        <Link to={"/accounts"}>
          <Button
            label="Manage ledgers"
            className="p-button-outlined p-button-sm"
          />
        </Link>
        <Link to={"accounts/journal-transactions"}>
          <Button
            label="View transactions"
            icon="pi pi-angle-right"
            className="p-button-text p-button-sm"
          />
        </Link>
      </div>
    </Card>
  );
};

export default AccountsSection;
