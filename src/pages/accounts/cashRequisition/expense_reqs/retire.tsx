const Retire = () => {
      const handleRetirement = async (requisition: CashRequisition) => {
        confirmDialog({
          message: "Are you sure you want to retire this requisition?",
          header: "Confirm Retirement",
          icon: "pi pi-exclamation-triangle",
          accept: async () => {
            try {
              const response = await axios.post(
                `${baseURL}/accounts/cash-requisitions/${requisition.id}/retirement`,
                {},
                {
                  headers: {
                    Authorization: `Bearer ${token?.access_token}`,
                  },
                }
              );
    
              if (response.data.success) {
                toastRef.current?.show({
                  severity: "success",
                  summary: "Retired",
                  detail: response.data.message,
                  life: 3000,
                });
                refresh();
              }
            } catch (error: any) {
              toastRef.current?.show({
                severity: "error",
                summary: "Error",
                detail:
                  error.response?.data?.message || "Failed to retire requisition",
                life: 3000,
              });
            }
          },
        });
      };
}
export default Retire