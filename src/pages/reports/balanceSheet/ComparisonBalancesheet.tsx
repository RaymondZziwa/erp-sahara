import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import useAuth from "../../../hooks/useAuth";
import { REPORTS_ENDPOINTS } from "../../../api/reportsEndpoints";
import { apiRequest } from "../../../utils/api";
import { ServerResponse } from "../../../redux/slices/types/ServerResponse";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface ComparisonBalanceSheet {
  balance_sheet: Balancesheet;
  totals: Totals;
  subcategory_totals: SubcategoryTotals;
  current_fiscal_year: CurrentFiscalYear;
  previous_fiscal_year: null;
  data: {};
  assets: [];
  equity: [];
  liabilities: [];
}

interface CurrentFiscalYear {
  id: number;
  financial_year: string;
  start_date: string;
  end_date: string;
  organisation_id: number;
  status: number;
  remaining_days: number;
  should_alert: boolean;
}

interface SubcategoryTotals {
  assets: { [key: string]: SubcategoryDetail };
  liabilities: { [key: string]: SubcategoryDetail };
  equity: SubcategoryDetail[];
}

interface Account {
  code: string;
  account_name: string;
  balance: number;
  previous_amount: number;
  difference: number;
}

interface SubcategoryDetail {
  subcategory_name: string;
  total: number;
  previous_total: number;
  difference: number;
  accounts: Account[];
}

interface Totals {
  total_assets: number;
  total_liabilities: number;
  total_equity: number;
}

interface Balancesheet {
  assets: Asset[];
  liabilities: Asset[];
  equity: Equity[];
}

interface Asset {
  account_id: number;
  account_name: string;
  account_code: string;
  current_balance: string;
  previous_balance: number;
}

interface Equity {
  account_id: number;
  account_name: string;
  account_code: string;
  current_balance: string;
  previous_balance: number;
}

const ComparisonBalanceSheet: React.FC = () => {
  const [incomeStatement, setIncomeStatement] =
    useState<ComparisonBalanceSheet | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { token, isFetchingLocalToken } = useAuth();

  const fetchDataFromApi = async () => {
    if (isFetchingLocalToken || !token.access_token) return;
    setIsLoading(true);
    try {
      const response = await apiRequest<ServerResponse<ComparisonBalanceSheet>>(
        REPORTS_ENDPOINTS.COMPARISON_BALANCE_SHEET.GET_ALL,
        "GET",
        token.access_token
      );
      console.log("resp", response.data);

      setIncomeStatement(response.data.data as ComparisonBalanceSheet);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  console.log("is", incomeStatement);
  useEffect(() => {
    fetchDataFromApi();
  }, [isFetchingLocalToken, token.access_token]);

  const { assets, equity, liabilities } = incomeStatement || {
    assets: [],
    equity: [],
    liabilities: [],
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text("Balance Sheet", 20, 10);

    const generateSection = (title: string, items: SubcategoryDetail[]) => {
      if (!items) return;
      const tableBody: any[] = [];

      tableBody.push([
        {
          content: title,
          colSpan: 5, // Updated to match column count
          styles: {
            fontStyle: "bold" as "bold",
            halign: "left",
            fillColor: [222, 226, 230],
          },
        },
      ]);

      // Add subcategory rows and data
      items.forEach((item) => {
        tableBody.push([
          {
            content: item.subcategory_name,
            colSpan: 5, // Updated to match column count
            styles: {
              fontStyle: "bold" as "bold",
              halign: "left",
              fillColor: [246, 249, 252],
            },
          },
        ]);

        tableBody.push([
          {
            content: "Code",
            styles: { halign: "left", fontStyle: "bold" },
          },
          {
            content: "Account Name",
            styles: { halign: "left", fontStyle: "bold" },
          },
          {
            content: "Current Amount",
            styles: { halign: "center", fontStyle: "bold" },
          },
          {
            content: "Previous Amount",
            styles: { halign: "center", fontStyle: "bold" },
          },
          {
            content: "Difference",
            styles: { halign: "center", fontStyle: "bold" },
          },
        ]);

        item.accounts.forEach((account) => {
          tableBody.push([
            account.code,
            account.account_name,
            {
              content: account.balance.toLocaleString(),
              styles: { halign: "center" },
            },
            {
              content: account.previous_amount.toLocaleString(),
              styles: { halign: "center" },
            },
            {
              content: account.difference.toLocaleString(),
              styles: { halign: "center" },
            },
          ]);
        });
      });

      const total = items.reduce((acc, item) => acc + item.total, 0);
      const previousTotal = items.reduce(
        (acc, item) => acc + item.previous_total,
        0
      );
      const differenceTotal = items.reduce(
        (acc, item) => acc + item.difference,
        0
      );

      tableBody.push([
        {
          content: `TOTAL ${title}`,
          colSpan: 2,
          styles: { fontStyle: "bold", halign: "left" },
        },
        {
          content: total.toLocaleString(),
          styles: { fontStyle: "bold", halign: "right" },
        },
        {
          content: previousTotal.toLocaleString(),
          styles: { fontStyle: "bold", halign: "right" },
        },
        {
          content: differenceTotal.toLocaleString(),
          styles: { fontStyle: "bold", halign: "right" },
        },
      ]);

      autoTable(doc, {
        body: tableBody,
        theme: "grid",
        margin: { top: 5 },
        tableLineWidth: 0, // Removes outer table borders
        tableLineColor: [255, 255, 255], // Makes sure no table outline
        didParseCell: function (data) {
          if (data.section === "body") {
            data.cell.styles.lineWidth = {
              top: 0.2,
              right: 0,
              bottom: 0.2,
              left: 0,
            }; // [top, right, bottom, left]
          }
        },
      });
    };

    generateSection("ASSETS", incomeStatement?.assets || []);
    generateSection("EQUITY", incomeStatement?.equity || []);
    generateSection("LIABILITIES", incomeStatement?.liabilities || []);

    doc.save("BalanceSheet.pdf");
  };

  return (
    <div className="bg-white p-3">
      <div className="flex justify-between items-center mb-4">
        <p className="font-bold text-xl">Balance Comparison Sheet </p>
        <button
          className="bg-shade px-2 py-1 rounded text-white flex gap-2 items-center"
          onClick={handleExportPDF}
        >
          <Icon icon="solar:printer-bold" fontSize={20} />
          Print
        </button>
      </div>

      {/* Custom Table Component */}

      {isLoading ? (
        "Loading ..."
      ) : (
        <table className="w-full">
          <tbody>
            <tr className="font-bold bg-gray-300">
              <td className="p-3 " colSpan={5}>
                ASSETS
              </td>
            </tr>

            {assets?.map((item: SubcategoryDetail) => {
              return (
                <>
                  <tr className="font-bold bg-gray-100">
                    <td className="p-3 " colSpan={5}>
                      {item.subcategory_name}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-3 font-semibold py-2 border-gray-200 border-b w-[100px]">
                      Code
                    </td>
                    <td className="px-3 py-2 font-semibold border-gray-200 border-b">
                      Account Name
                    </td>
                    <td className="px-3 py-2 font-semibold border-gray-200 border-b">
                      Current Amount
                    </td>
                    <td className="px-3 py-2 font-semibold border-gray-200 border-b">
                      Previous Amount
                    </td>
                    <td className="px-3 py-2 font-semibold border-gray-200 border-b">
                      Difference
                    </td>
                  </tr>

                  {item.accounts.map((account: any) => {
                    return (
                      <tr>
                        <td className="px-3 py-2 border-gray-200 border-b w-[100px]">
                          {account.code}
                        </td>
                        <td className="px-3 py-2 border-gray-200 border-b">
                          {account.account_name}
                        </td>
                        <td className="px-3 py-2 border-gray-200 border-b">
                          {account.balance.toLocaleString()}
                        </td>
                        <td className="px-3 py-2 border-gray-200 border-b">
                          {account.previous_amount.toLocaleString()}
                        </td>
                        <td className="px-3 py-2 border-gray-200 border-b">
                          {account.difference.toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </>
              );
            })}
            <tr className="font-bold bg-gray-200">
              <td className="p-3 " colSpan={2}>
                TOTAL ASSETS
              </td>
              <td className="p-3 ">
                {assets
                  ?.reduce(
                    (acc, item: SubcategoryDetail) => acc + item.total,
                    0
                  )
                  .toLocaleString()}
              </td>
              <td className="p-3 ">
                {assets
                  ?.reduce(
                    (acc, item: SubcategoryDetail) => acc + item.previous_total,
                    0
                  )
                  .toLocaleString()}
              </td>
              <td className="p-3 ">
                {assets
                  ?.reduce(
                    (acc, item: SubcategoryDetail) => acc + item.difference,
                    0
                  )
                  .toLocaleString()}
              </td>
            </tr>

            <tr className="font-bold bg-gray-300">
              <td className="p-3 " colSpan={5}>
                EQUITY
              </td>
            </tr>
            {equity?.map((item: SubcategoryDetail) => {
              return (
                <>
                  <tr className="font-bold bg-gray-100">
                    <td className="p-3 " colSpan={5}>
                      {item.subcategory_name}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-3 font-semibold py-2 border-gray-200 border-b w-[100px]">
                      Code
                    </td>
                    <td className="px-3 py-2 font-semibold border-gray-200 border-b">
                      Account Name
                    </td>
                    <td className="px-3 py-2 font-semibold border-gray-200 border-b">
                      Current Amount
                    </td>
                    <td className="px-3 py-2 font-semibold border-gray-200 border-b">
                      Previous Amount
                    </td>
                    <td className="px-3 py-2 font-semibold border-gray-200 border-b">
                      Difference
                    </td>
                  </tr>

                  {item.accounts.map((account: any) => {
                    return (
                      <tr>
                        <td className="px-3 py-2 border-gray-200 border-b w-[100px]">
                          {account.code}
                        </td>
                        <td className="px-3 py-2 border-gray-200 border-b">
                          {account.account_name}
                        </td>
                        <td className="px-3 py-2 border-gray-200 border-b">
                          {account.balance.toLocaleString()}
                        </td>
                        <td className="px-3 py-2 border-gray-200 border-b">
                          {account.previous_amount.toLocaleString()}
                        </td>
                        <td className="px-3 py-2 border-gray-200 border-b">
                          {account.difference.toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </>
              );
            })}
            <tr className="font-bold bg-gray-200">
              <td className="p-3 " colSpan={2}>
                TOTAL EQUITY
              </td>
              <td className="p-3 ">
                {equity
                  ?.reduce(
                    (acc, item: SubcategoryDetail) => acc + item.total,
                    0
                  )
                  .toLocaleString()}
              </td>
              <td className="p-3 ">
                {equity
                  ?.reduce(
                    (acc, item: SubcategoryDetail) => acc + item.previous_total,
                    0
                  )
                  .toLocaleString()}
              </td>
              <td className="p-3 ">
                {equity
                  ?.reduce(
                    (acc, item: SubcategoryDetail) => acc + item.difference,
                    0
                  )
                  .toLocaleString()}
              </td>
            </tr>
            <tr className="font-bold bg-gray-300">
              <td className="p-3 " colSpan={5}>
                LIABILITIES
              </td>
            </tr>
            {liabilities?.map((item: SubcategoryDetail) => {
              return (
                <>
                  <tr className="font-bold bg-gray-100">
                    <td className="p-3 " colSpan={5}>
                      {item.subcategory_name}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-3 font-semibold py-2 border-gray-200 border-b w-[100px]">
                      Code
                    </td>
                    <td className="px-3 py-2 font-semibold border-gray-200 border-b">
                      Account Name
                    </td>
                    <td className="px-3 py-2 font-semibold border-gray-200 border-b">
                      Current Amount
                    </td>
                    <td className="px-3 py-2 font-semibold border-gray-200 border-b">
                      Previous Amount
                    </td>
                    <td className="px-3 py-2 font-semibold border-gray-200 border-b">
                      Difference
                    </td>
                  </tr>

                  {item.accounts.map((account: any) => {
                    return (
                      <tr>
                        <td className="px-3 py-2 border-gray-200 border-b w-[100px]">
                          {account.code}
                        </td>
                        <td className="px-3 py-2 border-gray-200 border-b">
                          {account.account_name}
                        </td>
                        <td className="px-3 py-2 border-gray-200 border-b">
                          {account.balance.toLocaleString()}
                        </td>
                        <td className="px-3 py-2 border-gray-200 border-b">
                          {account.previous_amount.toLocaleString()}
                        </td>
                        <td className="px-3 py-2 border-gray-200 border-b">
                          {account.difference.toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </>
              );
            })}
            <tr className="font-bold bg-gray-200">
              <td className="p-3 " colSpan={2}>
                TOTAL LIABILITIES
              </td>
              <td className="p-3 ">
                {liabilities
                  ?.reduce(
                    (acc, item: SubcategoryDetail) => acc + item.total,
                    0
                  )
                  .toLocaleString()}
              </td>
              <td className="p-3 ">
                {liabilities
                  ?.reduce(
                    (acc, item: SubcategoryDetail) => acc + item.previous_total,
                    0
                  )
                  .toLocaleString()}
              </td>
              <td className="p-3 ">
                {liabilities
                  ?.reduce(
                    (acc, item: SubcategoryDetail) => acc + item.difference,
                    0
                  )
                  .toLocaleString()}
              </td>
            </tr>
          </tbody>
        </table>
      )}
      {incomeStatement === null && !isLoading ? "No data Present" : ""}
    </div>
  );
};

export default ComparisonBalanceSheet;
