import { useEffect, useState } from "react";
import useAuth from "../useAuth.ts";
import { apiRequest } from "../../utils/api.ts";
import { ServerResponse } from "../../redux/slices/types/ServerResponse.ts";
import { ACCOUNTS_ENDPOINTS } from "../../api/accountsEndpoints.ts";
import { ChartOfAccountDetails } from "../../redux/slices/types/accounts/subCategories/ChartOfAccounts.ts";

/**
 * Custom hook to fetch chart of account details for a specific account.
 *
 * @param {number} accountId - The ID of the account to fetch details for.
 * @param {string} [startDate] - Optional start date for the account details. Defaults to the first day of the current year (e.g., "2024-01-01").
 * @param {string} [endDate] - Optional end date for the account details. Defaults to today's date (e.g., "2024-10-23").
 * @returns {{ data: ChartOfAccountDetails, loading: boolean, refresh: () => void }} An object containing the account details, loading state, and a refresh function to re-fetch data.
 */
const useChartOfAccountDetails = (
  accountId: number,
  startDate?: string, // Optional startDate parameter
  endDate?: string // Optional endDate parameter
) => {
  const { token, isFetchingLocalToken } = useAuth();
  const [chartOfAccountDetails, setChartOfAccountDetails] =
    useState<ChartOfAccountDetails>();
  const [loading, setLoading] = useState(false);

  // Default startDate to the first day of the current year
  const defaultStartDate =
    startDate ||
    new Date(new Date().getFullYear(), 0, 1).toISOString().split("T")[0]; // e.g., "2024-01-01"

  // Default endDate to today's date
  const defaultEndDate = endDate || new Date().toISOString().split("T")[0]; // e.g., "2024-10-23"

  const fetchDataFromApi = async () => {
    if (isFetchingLocalToken) return;
    if (!token.access_token) {
      return;
    }
    setLoading(true);
    try {
      const response = await apiRequest<ServerResponse<ChartOfAccountDetails>>(
        ACCOUNTS_ENDPOINTS.CHART_OF_ACCOUNTS.GET_ACCOUNT_DETAILS(
          accountId.toString(),
          defaultStartDate, // Use the default or provided startDate
          defaultEndDate // Use the default or provided endDate
        ),
        "GET",
        token.access_token
      );
      // if (!response.success) {
      //   throw Error("No data");
      // }

      setChartOfAccountDetails(response.data);
    } catch (error) {
      setLoading(false);
      console.error("Error fetching account details:", error); // Added error logging
    } finally {
      setLoading(false); // Ensure loading is set to false on completion
    }
  };

  useEffect(() => {
    fetchDataFromApi();
  }, [isFetchingLocalToken, token.access_token]); // Dependencies remain unchanged

  const data = { data: chartOfAccountDetails, loading };

  return { ...data, refresh: fetchDataFromApi };
};

export default useChartOfAccountDetails;
