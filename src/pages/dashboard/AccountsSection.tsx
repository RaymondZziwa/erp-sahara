import { useState, useEffect } from "react";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { formatCurrency } from "../../utils/formatCurrency";
import { Link } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { REPORTS_ENDPOINTS } from "../../api/reportsEndpoints";
import { apiRequest } from "../../utils/api";
import { Skeleton } from "primereact/skeleton";
import { Badge } from "primereact/badge";

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
    <Card className="border-round-lg shadow-2">
    <div className="flex justify-content-between align-items-center mb-4">
      <h2 className="text-900 font-semibold text-xl m-0">Cash Ledgers (Current Balances)</h2>
    </div>

    {isLoading ? (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex align-items-center">
            <Skeleton shape="circle" size="3rem" className="mr-3"></Skeleton>
            <div style={{ flex: 1 }}>
              <Skeleton width="60%" className="mb-2"></Skeleton>
              <Skeleton width="40%"></Skeleton>
            </div>
            <Skeleton width="4rem" height="2rem"></Skeleton>
          </div>
        ))}
      </div>
    ) : ledgerBalances.length === 0 ? (
      <div className="flex justify-content-center align-items-center py-6">
        <span className="text-600">No cash ledgers found</span>
      </div>
    ) : (
      <div className="space-y-4">
        {ledgerBalances.map((ledger) => (
          <div
            key={ledger.ledger_id}
            className="p-3 border-round border-1 surface-border"
          >
            <div className="flex justify-content-between align-items-start mb-2">
              <div>
                <div className="font-medium">{ledger.ledger_name}</div>
                <div className="text-600 text-sm">
                  {ledger.subcategory} • {ledger.ledger_code}
                </div>
              </div>
              <Badge
                value={formatCurrency(ledger.net_amount)}
                className={getBalanceColor(
                  ledger.normal_balance_side,
                  ledger.net_amount
                )}
              ></Badge>
            </div>
            <div className="grid text-sm">
              <div className="col-6">
                <div className="text-600">Debit</div>
                <div>{formatCurrency(ledger.debit_sum)}</div>
              </div>
              <div className="col-6">
                <div className="text-600">Credit</div>
                <div>{formatCurrency(ledger.total_credit)}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )}

    <div className="flex justify-content-between mt-4 pt-3 gap-4 border-top-1 surface-border">
      <Link to={"/accounts"}>
        <Button
          label="Manage Ledgers"
          icon="pi pi-wallet"
          className="p-button-text p-button-sm"
        />
      </Link>
      <Link to={"accounts/journal-transactions"}>
        <Button
          label="View Transactions"
          icon="pi pi-angle-right"
          className="p-button-text p-button-sm"
        />
      </Link>
    </div>
  </Card>
  );
};

export default AccountsSection;
