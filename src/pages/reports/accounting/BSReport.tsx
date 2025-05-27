import React, { useState, useRef } from "react";
import { Icon } from "@iconify/react";
import useBalanceSheet from "../../../hooks/reports/useBalanceSheet";
import { useReactToPrint } from "react-to-print";
import Header from "../../../components/custom/print_header";
import axios from "axios";
import useAuth from "../../../hooks/useAuth";
import { baseURL } from "../../../utils/api";

const BalanceSheetReport = () => {
  const { data } = useBalanceSheet();
  const { assets, equity, liabilities, totals, metadata } = data;
  const { token } = useAuth();
  const [openModalData, setOpenModalData] = useState(null);

  const contentRef = useRef<HTMLDivElement>(null);
  const reactToPrintFn = useReactToPrint({ contentRef });

  const print = async () => {
    try {
      const response = await axios.get(
        `${baseURL}/reports/accounting/balance-sheet/pdf`,
        {
          responseType: "blob",
          headers: {
            Authorization: `Bearer ${token.access_token || ""}`,
          },
        }
      );

      const file = new Blob([response.data], { type: "application/pdf" });
      const fileURL = URL.createObjectURL(file);
      window.open(fileURL, "_blank");
    } catch (error) {
      console.error("Error previewing the trial balance report:", error);
    }
  };

  const formatAmount = (amount) => {
    return amount.toFixed(2);
  };

  return (
    <div className="bg-white p-3">
      <div className="flex justify-end items-center mb-4">
        <button
          className="bg-shade px-2 py-1 rounded text-white flex gap-2 items-center"
          onClick={print}
        >
          <Icon icon="solar:printer-bold" fontSize={20} />
          Print
        </button>
      </div>
      <div ref={contentRef} className="p-4 font-mono text-sm">
        <div className="text-center mb-4">
          <Header title={"Balance Sheet Report"} />
          <p className="text-sm">
            As of {new Date(metadata.generated_at).toLocaleDateString()} |
            Currency: UGX
          </p>
        </div>

        {/* Assets Section */}
        <div className="mb-8">
          <div className="flex justify-between font-bold border-b border-black">
            <div className="w-3/4">ASSETS</div>
            <div className="w-1/4 text-right">Amount</div>
          </div>

          {assets?.map((assetCategory) => (
            <div key={assetCategory.subcategory_name} className="mb-2">
              <div className="flex justify-between">
                <div className="w-3/4">{assetCategory.subcategory_name}</div>
                <div className="w-1/4 text-right font-bold">
                  {formatAmount(assetCategory.amount)}
                </div>
              </div>

              {assetCategory.accounts.map((account) => (
                <div
                  key={account.account_code}
                  className="flex justify-between ml-4 border-b-2"
                >
                  <div className="w-16">{account.account_code}</div>
                  <div className="flex-1">{account.account_name}</div>
                  <div className="w-1/4 text-right">
                    {formatAmount(account.amount)}
                  </div>
                </div>
              ))}
            </div>
          ))}

          <div className="flex justify-between font-bold border-t-2 border-black mt-2">
            <div className="w-3/4">TOTAL ASSETS</div>
            <div className="w-1/4 text-right">
              {formatAmount(totals.assets)}
            </div>
          </div>
        </div>

        {/* Liabilities & Equity Section */}
        <div>
          <div className="flex justify-between font-bold border-b border-black">
            <div className="w-3/4">LIABILITIES & EQUITY</div>
            <div className="w-1/4 text-right">Amount</div>
          </div>

          {/* Liabilities */}
          <div className="mt-2">
            <div className="font-bold">LIABILITIES</div>

            {liabilities?.map((liabilityCategory) => (
              <div key={liabilityCategory.subcategory_name} className="mb-2">
                <div className="flex justify-between">
                  <div className="w-3/4">
                    {liabilityCategory.subcategory_name}
                  </div>
                  <div className="w-1/4 text-right font-bold">
                    {formatAmount(liabilityCategory.amount)}
                  </div>
                </div>

                {liabilityCategory.accounts.map((account) => (
                  <div
                    key={account.account_code}
                    className="flex justify-between ml-4 border-b-2"
                  >
                    <div className="w-16">{account.account_code}</div>
                    <div className="flex-1">{account.account_name}</div>
                    <div className="w-1/4 text-right">
                      {formatAmount(account.amount)}
                    </div>
                  </div>
                ))}
              </div>
            ))}

            <div className="flex justify-between font-bold border-t border-black mt-2">
              <div className="w-3/4">TOTAL LIABILITIES</div>
              <div className="w-1/4 text-right">
                {formatAmount(
                  liabilities.reduce((sum, cat) => sum + cat.amount, 0)
                )}
              </div>
            </div>
          </div>

          {/* Equity */}
          <div className="mt-4">
            <div className="font-bold">EQUITY</div>

            {equity?.map((equityCategory) => (
              <div key={equityCategory.subcategory_name} className="mb-2">
                <div className="flex justify-between">
                  <div className="w-3/4">{equityCategory.subcategory_name}</div>
                  <div className="w-1/4 text-right font-bold">
                    {formatAmount(equityCategory.amount)}
                  </div>
                </div>

                {equityCategory.accounts.map((account) => (
                  <div
                    key={account.account_code}
                    className="flex justify-between ml-4 border-b-2"
                  >
                    <div className="w-16">{account.account_code}</div>
                    <div className="flex-1">{account.account_name}</div>
                    <div className="w-1/4 text-right">
                      {formatAmount(account.amount)}
                    </div>
                  </div>
                ))}
              </div>
            ))}

            <div className="flex justify-between font-bold border-t border-black mt-2">
              <div className="w-3/4">TOTAL EQUITY</div>
              <div className="w-1/4 text-right">
                {formatAmount(equity.reduce((sum, cat) => sum + cat.amount, 0))}
              </div>
            </div>
          </div>

          {/* Current Year Profit/Loss */}
          <div className="flex justify-between mt-2">
            <div className="w-3/4">Current Year Profit/Loss</div>
            <div className="w-1/4 text-right">
              {formatAmount(data.current_profit_or_loss || 0)}
            </div>
          </div>

          {/* Total Liabilities & Equity */}
          <div className="flex justify-between font-bold border-t-2 border-black mt-2">
            <div className="w-3/4">TOTAL LIABILITIES & EQUITY</div>
            <div className="w-1/4 text-right">
              {formatAmount(totals.liabilities_equity)}
            </div>
          </div>
        </div>

        <div className="mt-4 text-xs">
          Generated on {new Date(metadata.generated_at).toLocaleString()}
          <br />
          {totals.check_balance
            ? "✓ Balance check passed (Assets = Liabilities + Equity)"
            : "✗ Balance check failed"}
        </div>
      </div>
    </div>
  );
};

export default BalanceSheetReport;
