import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { TrialBalance } from "../../../redux/slices/types/reports/TrialBalance";
import useAuth from "../../../hooks/useAuth";
import { REPORTS_ENDPOINTS } from "../../../api/reportsEndpoints";
import { apiRequest, baseURL } from "../../../utils/api";
import { ServerResponse } from "../../../redux/slices/types/ServerResponse";
import Header from "../../../components/custom/print_header";
import axios from "axios";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Printer, FileText, TrendingUp, Calculator } from "lucide-react";

function TrialBalanceReport() {
  const { token, isFetchingLocalToken } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [trialBalanceData, setTrialBalanceData] = useState<TrialBalance | null>(
    null
  );

  // const print = async () => {
  //   try {
  //     const response = await axios.get(
  //       `${baseURL}/reports/accounting/print-tb`,
  //       {
  //         responseType: "blob", // Important for downloading files
  //         headers: {
  //           Authorization: `Bearer ${token.access_token || ""}`,
  //         },
  //       }
  //     );

  //     const url = window.URL.createObjectURL(new Blob([response.data]));
  //     const link = document.createElement("a");
  //     link.href = url;
  //     link.setAttribute("download", "trial-balance-report.pdf"); // Adjust filename/extension if needed
  //     document.body.appendChild(link);
  //     link.click();
  //     link.remove();
  //     window.URL.revokeObjectURL(url);
  //   } catch (error) {
  //     console.error("Error downloading the trial balance report:", error);
  //   }
  // };

  const print = async () => {
    try {
      const response = await axios.get(
        `${baseURL}/reports/accounting/print-tb`,
        {
          responseType: "blob",
          headers: {
            Authorization: `Bearer ${token.access_token || ""}`,
          },
        }
      );

      // Explicitly set the MIME type as PDF
      const file = new Blob([response.data], { type: "application/pdf" });
      const fileURL = URL.createObjectURL(file);

      // Open the file in a new browser tab
      window.open(fileURL, "_blank");
    } catch (error) {
      console.error("Error previewing the trial balance report:", error);
    }
  };


  const fetchDataFromApi = async () => {
    if (isFetchingLocalToken || !token.access_token) return;
    setIsLoading(true);
    try {
      const response = await apiRequest<ServerResponse<TrialBalance>>(
        REPORTS_ENDPOINTS.TRIAL_BALANCES.GET_ALL,
        "GET",
        token.access_token
      );
      setTrialBalanceData(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDataFromApi();
  }, [isFetchingLocalToken, token.access_token]);


  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-accent/20 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <Card className="bg-gradient-card shadow-lg border-0 animate-fade-in">
          <CardHeader className="bg-gradient-header rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <Header title="Trial Balance Report" />
                  <p className="text-sm text-muted-foreground mt-1">
                    Financial position summary as of {new Date().toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {Array.isArray(trialBalanceData) && (
                  <Badge 
                    variant={isBalanced ? "default" : "destructive"}
                    className="gap-1 px-3 py-1"
                  >
                    <Calculator className="h-3 w-3" />
                    {isBalanced ? "Balanced" : "Unbalanced"}
                  </Badge>
                )}
                
                <Button
                  onClick={print}
                  className="bg-gradient-primary hover:bg-primary-hover transition-all duration-200 shadow-md"
                  size="sm"
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Print Report
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Main Report Card */}
        <Card className="bg-gradient-card shadow-xl border-0 animate-fade-in">
          <CardContent className="p-0">
            {isLoading && trialBalanceData === null ? (
              <div className="p-6 space-y-4">
                <div className="text-center text-muted-foreground mb-6">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                  Loading trial balance data...
                </div>
                {/* Loading skeleton */}
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex space-x-4">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                ))}
              </div>
            ) : Array.isArray(trialBalanceData) && trialBalanceData.length > 0 ? (
              <div className="overflow-hidden">
                {/* Enhanced Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    {/* Table Header */}
                    <thead>
                      <tr className="bg-report-header border-b-2 border-primary/20">
                        <th className="px-6 py-4 text-left font-semibold text-foreground border-r border-border/50 w-32">
                          <div className="flex items-center gap-2">
                            <span>A/C Code</span>
                          </div>
                        </th>
                        <th className="px-6 py-4 text-left font-semibold text-foreground border-r border-border/50">
                          <div className="flex items-center gap-2">
                            <span>Account Name</span>
                          </div>
                        </th>
                        <th className="px-6 py-4 text-right font-semibold text-foreground border-r border-border/50 w-32">
                          <div className="flex items-center justify-end gap-2">
                            <TrendingUp className="h-4 w-4 text-success" />
                            <span>Debit</span>
                          </div>
                        </th>
                        <th className="px-6 py-4 text-right font-semibold text-foreground w-32">
                          <div className="flex items-center justify-end gap-2">
                            <TrendingUp className="h-4 w-4 text-primary rotate-180" />
                            <span>Credit</span>
                          </div>
                        </th>
                      </tr>
                    </thead>
                    
                    {/* Table Body */}
                    <tbody>
                      {trialBalanceData.map((item, index) => (
                        <tr 
                          key={`${item.account_code}-${index}`}
                          className="border-b border-border/30 hover:bg-muted/30 transition-colors duration-150 animate-slide-in group"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <td className="px-6 py-4 border-r border-border/30">
                            <code className="text-sm font-mono bg-muted/50 px-2 py-1 rounded text-muted-foreground">
                              {item.account_code}
                            </code>
                          </td>
                          <td className="px-6 py-4 border-r border-border/30">
                            <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                              {item.account_name}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right border-r border-border/30">
                            {item.debit ? (
                              <span className="font-semibold text-success">
                                {item.debit.toLocaleString()}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            {item.credit ? (
                              <span className="font-semibold text-primary">
                                {item.credit.toLocaleString()}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                      
                      {/* Totals Row */}
                      <tr className="bg-report-total border-t-2 border-primary/20">
                        <td colSpan={2} className="px-6 py-5 border-r border-border/50">
                          <div className="flex items-center gap-2">
                            <div className="p-1 bg-primary/10 rounded">
                              <Calculator className="h-4 w-4 text-primary" />
                            </div>
                            <span className="font-bold text-lg text-foreground">Total</span>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-right border-r border-border/50">
                          <div className="space-y-1">
                            <span className="font-bold text-lg text-success">
                              {totalDebit.toLocaleString()}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className="space-y-1">
                            <span className="font-bold text-lg text-primary">
                              {totalCredit.toLocaleString()}
                            </span>
                          </div>
                        </td>
                      </tr>
                      
                      {/* Balance Verification Row */}
                      <tr className="bg-gradient-to-r from-accent/20 to-primary/10">
                        <td colSpan={2} className="px-6 py-3 border-r border-border/50">
                          <span className="font-semibold text-foreground">Balance Verification</span>
                        </td>
                        <td colSpan={2} className="px-6 py-3 text-center">
                          <Badge 
                            variant={isBalanced ? "default" : "destructive"}
                            className="text-sm px-3 py-1"
                          >
                            {isBalanced ? "✓ Trial Balance is Balanced" : "⚠ Trial Balance is Unbalanced"}
                          </Badge>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="p-4 bg-muted/30 rounded-lg inline-block mb-4">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">No Data Available</h3>
                <p className="text-muted-foreground">
                  No trial balance data found for the selected period.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer Information */}
        {Array.isArray(trialBalanceData) && trialBalanceData.length > 0 && (
          <Card className="bg-gradient-card shadow-md border-0">
            <CardContent className="p-4">
              <div className="flex justify-between items-center text-sm text-muted-foreground">
                <span>
                  Total Accounts: <strong className="text-foreground">{trialBalanceData.length}</strong>
                </span>
                <span>
                  Generated on {new Date().toLocaleString()}
                </span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default TrialBalanceReport;
