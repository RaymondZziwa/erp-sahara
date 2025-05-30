//@ts-nocheck
import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Calendar } from "primereact/calendar";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { createRequest } from "../../../utils/api";
import useAuth from "../../../hooks/useAuth";
import { ACCOUNTS_ENDPOINTS } from "../../../api/accountsEndpoints";
import { Ledger } from "../../../redux/slices/types/ledgers/Ledger";
import useCurrencies from "../../../hooks/procurement/useCurrencies";
import { AccountType } from "../../../redux/slices/types/accounts/accountTypes";
import useProjects from "../../../hooks/projects/useProjects";
import useBudgets from "../../../hooks/budgets/useBudgets";
import FileUploadInput from "../../../components/FileUploadInput";
import { toast } from "react-toastify";
import useAssetsAccounts from "../../../hooks/accounts/useAssetsAccounts";
import useChartOfAccounts from "../../../hooks/accounts/useChartOfAccounts";

interface AddOrModifyItemProps {
  visible: boolean;
  onClose: () => void;
  item?: Ledger;
  onSave: () => void;
  debitAccountType: AccountType;
  creditAccountType: AccountType;
  endpoint: string;
  title?: string;
  journalType: string;
  creditAccountsHeader: string;
  debitAccountsHeader: string;
}

interface AddLedger {
  transaction_date: Date;
  reference: string;
  project_id?: number | null;
  segment_id?: number | null;
  budget_id?: number | null;
  journal_type_id: number;
  description: string;
  lines: {
    debit_account_id: number;
    credit_account_id: number;
    amount: number;
    currency_id: number;
    budget_item_id?: number;
  }[];
  currency_id: number;
  supporting_files: File[];
}

const AddOrModifyItem: React.FC<AddOrModifyItemProps> = ({
  visible,
  onClose,
  item,
  title,
  onSave,
  endpoint,
  journalType,
}) => {
  const [formState, setFormState] = useState<Partial<AddLedger>>({
    transaction_date: new Date(),
    reference: "",
    project_id: null,
    segment_id: null,
    budget_id: null,
    journal_type_id: journalType.toLowerCase().includes("expense")
      ? 4
      : journalType.toLowerCase().includes("sale")
      ? 5
      : journalType.toLowerCase().includes("cashflow")
      ? 20
      : journalType.toLowerCase().includes("banking")
      ? 20
      : 3,
    description: "",
    lines: [],
    currency_id: 2,
    supporting_files: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { token } = useAuth();
  const { data: currenciesData, loading: currenciesLoading } = useCurrencies();
  const { data: projects, loading: projectsLoading } = useProjects();
  const { data: budgets, loading: budgetsLoading } = useBudgets();
  const [selectedBudgetItemMaxAmounts, setSelectedBudgetItemMaxAmounts] =
    useState<{ [key: number]: number }>({});
  const [budgetItems, setBudgetItems] = useState([]);
  const { data, refresh: getCOA } = useChartOfAccounts();
  const {
    expenseAccounts,
    cashAccounts,
    payableAccounts,
    receivableAccounts,
    prepaidAccounts,
    liabilityAccounts,
    incomeAccounts,
    data: accounts,
    refresh,
  } = useAssetsAccounts();

  useEffect(() => {
    if (!accounts) {
      refresh();
    }
  }, [accounts]);

  useEffect(() => {
    if (!data) {
      getCOA();
    }
  }, []);

  const currencies = currenciesData.map((curr) => ({
    label: curr.code,
    value: curr.id,
  }));

  // Replace the useEffect with this version
  useEffect(() => {
    if (formState.budget_id) {
      // Find the selected budget from the budgets data
      const selectedBudget = budgets.find(
        (budget) => budget.id === formState.budget_id
      );

      if (selectedBudget && selectedBudget.items) {
        setBudgetItems(selectedBudget.items);
      } else {
        setBudgetItems([]);
        toast.warning("No items found for selected budget");
      }
    } else {
      setBudgetItems([]);
    }
  }, [formState.budget_id, budgets]); // Add budgets to dependency array

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const data = {
      ...formState,
      transaction_date:
        formState.transaction_date?.toISOString().slice(0, 10) ?? "",
      reference: formState.reference ?? "",
      journal_type_id: formState.journal_type_id,
      description: formState.description ?? "",
      currency_id: formState.currency_id,
      lines: formState?.lines.map((line) => ({
        debit_account_id: line.debit_account_id,
        credit_account_id: line.credit_account_id,
        amount: line.amount,
        currency_id: formState.currency_id!,
        budget_item_id: line.budget_item_id, // Include budget_item_id in payload
      })),
      supporting_files: formState.supporting_files,
    };

    const method = item?.id ? "PUT" : "POST";
    const endPoint = item?.id
      ? ACCOUNTS_ENDPOINTS.TRANSACTIONS.UPDATE(item.id.toString())
      : endpoint;

    try {
      await createRequest(endPoint, token.access_token, data, onSave, method);
      //toast.success('Record saved successfully')
      setIsSubmitting(false);

      onSave();
      onClose();
    } catch (error) {
      console.error("Error saving transaction:", error);
      toast.error(error?.response?.data?.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const footer = (
    <div className="flex justify-end space-x-2 mt-2">
      <Button
        severity="danger"
        disabled={isSubmitting}
        label="Cancel"
        icon="pi pi-times"
        onClick={onClose}
        className="p-button-text !bg-red-500"
        size="small"
      />
      <Button
        loading={isSubmitting}
        disabled={isSubmitting}
        label={item?.id ? "Update" : "Submit"}
        icon="pi pi-check"
        type="submit"
        form="ledger-form"
        size="small"
      />
    </div>
  );

  const handleItemChange = (
    index: number,
    field: keyof (typeof formState.lines)[0],
    value: number
  ) => {
    const updatedLines = [...(formState.lines ?? [])];
    updatedLines[index] = { ...updatedLines[index], [field]: value };

    // If we have a budget selected
    if (formState.budget_id) {
      let selectedBudgetItem;

      // For expense journals, look at debit account
      if (
        field === "debit_account_id" &&
        journalType.toLowerCase().includes("expense")
      ) {
        selectedBudgetItem = budgetItems.find(
          (item) => item.chart_of_account_id === value
        );
      }
      // For sale journals, look at credit account
      else if (
        field === "credit_account_id" &&
        journalType.toLowerCase().includes("sale")
      ) {
        selectedBudgetItem = budgetItems.find(
          (item) => item.chart_of_account_id === value
        );
      }

      if (selectedBudgetItem) {
        setSelectedBudgetItemMaxAmounts((prev) => ({
          ...prev,
          [index]: selectedBudgetItem.amount,
        }));
        // Add the budget_item_id to the line
        updatedLines[index].budget_item_id = selectedBudgetItem.id;
      }
    }

    setFormState((prevState) => ({
      ...prevState,
      lines: updatedLines,
    }));
  };

  const removeItem = (index: number) => {
    const updatedLines = [...(formState.lines ?? [])];
    updatedLines.splice(index, 1);
    setFormState((prevState) => ({
      ...prevState,
      lines: updatedLines,
    }));
  };

  const getDebitAccountOptions = () => {
    if (
      journalType.toLowerCase().includes("expense") ||
      journalType.toLowerCase().includes("add payable")
    ) {
      return expenseAccounts;
    } else if (journalType.toLowerCase().includes("income")) {
      return cashAccounts;
    } else if (journalType.toLowerCase().includes("bank")) {
      return cashAccounts;
    } else if (journalType.toLowerCase().includes("clear payable")) {
      return payableAccounts;
    } else if (journalType.toLowerCase().includes("add receivable")) {
      return receivableAccounts;
    } else if (journalType.toLowerCase().includes("clear receivable")) {
      return cashAccounts;
    } else if (journalType.toLowerCase().includes("add prepaid")) {
      return cashAccounts;
    } else if (journalType.toLowerCase().includes("clear prepaid")) {
      return prepaidAccounts;
    } else {
      return cashAccounts;
    }
  };

  // useEffect(()=> {
  //   alert(journalType)
  // }, [])

  const getCreditAccountOptions = () => {
    if (journalType.toLowerCase().includes("expense")) {
      return cashAccounts;
    } else if (journalType.toLowerCase().includes("income")) {
      return expenseAccounts;
    } else if (
      journalType.toLowerCase().includes("bank") ||
      journalType.toLowerCase().includes("clear payable")
    ) {
      return cashAccounts;
    } else if (journalType.toLowerCase().includes("add payable")) {
      return payableAccounts;
    } else if (journalType.toLowerCase().includes("add receivable")) {
      return incomeAccounts;
    } else if (journalType.toLowerCase().includes("clear receivable")) {
      return receivableAccounts;
    } else if (journalType.toLowerCase().includes("add prepaid")) {
      return prepaidAccounts;
    } else if (journalType.toLowerCase().includes("clear prepaid")) {
      return liabilityAccounts;
    }
  };

  return (
    <Dialog
      header={title}
      visible={visible}
      className="max-w-full md:max-w-screen-lg px-2 md:w-[1024px]"
      footer={footer}
      onHide={onClose}
    >
      <form
        id="ledger-form"
        onSubmit={handleSave}
        className="p-fluid grid grid-cols-1 md:grid-cols-2 gap-1"
      >
        <div className="">
          <label htmlFor="transaction_date">
            Transaction Date<span className="text-red-500">*</span>
          </label>
          <Calendar
            className="p-inputtext-sm"
            maxDate={new Date()}
            id="transaction_date"
            value={formState.transaction_date || null}
            onChange={(e) =>
              setFormState({
                ...formState,
                transaction_date: e.value ?? new Date(),
              })
            }
            dateFormat="dd/mm/yy"
            showIcon
            placeholder="Select Date"
          />
        </div>
        <div className="">
          <label htmlFor="reference">Reference</label>
          <InputText
            className="p-inputtext-sm"
            id="reference"
            name="reference"
            value={formState.reference}
            onChange={handleInputChange}
            placeholder="Enter Reference"
          />
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 col-span-full gap-2">
          <div className="">
            <label htmlFor="account type">
              Currency <span className="text-red-500">*</span>
            </label>
            <Dropdown
              className="p-inputtext-sm"
              loading={currencies.length == 0 && currenciesLoading}
              value={formState.currency_id}
              options={currencies}
              onChange={(e: DropdownChangeEvent) =>
                setFormState({ ...formState, currency_id: e.value })
              }
              placeholder="Select Currency"
            />
          </div>
        </div>
        <div className="col-span-full">
          <label htmlFor="description">Description</label>
          <InputTextarea
            className="p-inputtext-sm"
            required
            id="description"
            name="description"
            value={formState.description}
            onChange={handleInputChange}
            placeholder="Enter Description"
            rows={2}
          />
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 col-span-full gap-2">
          {(journalType.toLowerCase().includes("expense") ||
            journalType.toLowerCase().includes("sale")) && (
            <>
              <div className="">
                <label htmlFor="account type">Project (Optional)</label>
                <Dropdown
                  className="p-inputtext-sm"
                  filter
                  showClear
                  loading={projectsLoading}
                  value={formState.project_id}
                  options={projects.map((project) => ({
                    value: project.id,
                    label: project.name,
                  }))}
                  onChange={(e: DropdownChangeEvent) =>
                    setFormState({ ...formState, project_id: e.value })
                  }
                  placeholder="Select Project"
                />
              </div>
              <div className="">
                <label htmlFor="account type">Budget (Optional)</label>
                <Dropdown
                  className="p-inputtext-sm"
                  showClear
                  filter
                  loading={budgetsLoading}
                  value={formState.budget_id}
                  options={budgets.map((budget) => ({
                    value: budget.id,
                    label: budget.name,
                  }))}
                  onChange={(e: DropdownChangeEvent) =>
                    setFormState({ ...formState, budget_id: e.value })
                  }
                  placeholder="Select Budget"
                />
              </div>
            </>
          )}
        </div>
        <div className="col-span-full mt-2">
          <h3 className="font-bold text-xl">Entries</h3>
          <DataTable
            size="small"
            value={formState.lines}
            emptyMessage="No items added yet."
            className="w-full"
            footer={
              <div className="p-field mt-3">
                <Button
                  size="small"
                  type="button"
                  label="More"
                  icon="pi pi-plus"
                  onClick={() =>
                    setFormState((prevState) => ({
                      ...prevState,
                      lines: [
                        ...(prevState.lines ?? []),
                        {
                          debit_account_id: 0,
                          credit_account_id: 0,
                          amount: 0,
                          currency_id: formState.currency_id ?? 0,
                          budget_item_id: undefined, // Initialize as undefined
                        },
                      ],
                    }))
                  }
                  className="p-button-outlined w-max"
                />
              </div>
            }
          >
            <Column
              header="Debit Account"
              body={(line: (typeof formState.lines)[0], options) => (
                <Dropdown
                  className="p-inputtext-sm"
                  loading={false}
                  value={line.debit_account_id}
                  filter
                  options={
                    formState.budget_id &&
                    journalType.toLowerCase().includes("expense")
                      ? budgetItems
                          .filter((it) => it.type.toLowerCase() === "expense")
                          .map((item) => ({
                            value: item.chart_of_account_id,
                            label: `${item.name} (Budget: ${item.remaining_balance_amount})`,
                          }))
                      : journalType.toLowerCase().includes("clear prepaid") ||
                        journalType.toLowerCase().includes("add prepaid") ||
                        journalType
                          .toLowerCase()
                          .includes("clear receivable") ||
                        journalType.toLowerCase().includes("add receivable") ||
                        journalType.toLowerCase().includes("clear payable") ||
                        journalType.toLowerCase().includes("add payable")
                      ? getDebitAccountOptions().map((account) => ({
                          value: account.id,
                          label: `${account.name} (${account.balance})`,
                        }))
                      : journalType.toLowerCase().includes("expense")
                      ? data
                          .filter(
                            (acc) =>
                              acc.account_sub_category.account_category.name ===
                              "Expenses"
                          )
                          .map((account) => ({
                            value: account.id,
                            label: `${account.name}`,
                          }))
                      : journalType.toLowerCase().includes("income") ||
                        journalType.toLowerCase().includes("clear")
                      ? data
                          .filter(
                            (acc) =>
                              acc.account_sub_category.account_category.name ===
                              "Assets"
                          )
                          .map((account) => ({
                            value: account.id,
                            label: `${account.name} (${account.balance})`,
                          }))
                      : journalType.toLowerCase().includes("general")
                      ? data.map((account) => ({
                          value: account.id,
                          label: `${account.name} (${account.balance})`,
                        }))
                      : journalType.toLowerCase().includes("payable")
                      ? data
                          .filter(
                            (acc) =>
                              acc.account_sub_category.account_category.name ===
                              "Liabilities"
                          )
                          .map((account) => ({
                            value: account.id,
                            label: `${account.name} (${account.balance})`,
                          }))
                      : getDebitAccountOptions().map((account) => ({
                          value: account.id,
                          label: `${account.name} (${account.balance})`,
                        }))
                  }
                  onChange={(e) =>
                    handleItemChange(
                      options.rowIndex,
                      "debit_account_id",
                      e.value
                    )
                  }
                  placeholder="Select Debit Account"
                />
              )}
            />
            <Column
              header="Credit Account"
              body={(line: (typeof formState.lines)[0], options) => (
                <Dropdown
                  className="p-inputtext-sm"
                  loading={false}
                  filter
                  value={line.credit_account_id}
                  options={
                    formState.budget_id &&
                    journalType.toLowerCase().includes("sale")
                      ? budgetItems
                          .filter((it) => it.type.toLowerCase() === "income")
                          .map((item) => ({
                            value: item.chart_of_account_id,
                            label: `${item.name} (Budget: ${item.remaining_amount})`,
                          }))
                      : journalType.toLowerCase().includes("clear prepaid") ||
                        journalType.toLowerCase().includes("add prepaid") ||
                        journalType
                          .toLowerCase()
                          .includes("clear receivable") ||
                        journalType.toLowerCase().includes("add receivable") ||
                        journalType.toLowerCase().includes("clear payable") ||
                        journalType.toLowerCase().includes("add payable") ||
                        journalType.toLowerCase().includes("expenses")
                      ? getCreditAccountOptions().map((account) => ({
                          value: account.id,
                          label: `${account.name} (${account.balance})`,
                        }))
                      : journalType.toLowerCase().includes("clear")
                      ? data
                          .filter(
                            (acc) =>
                              acc.account_sub_category.account_category.name ===
                              "Assets"
                          )
                          .map((account) => ({
                            value: account.id,
                            label: `${account.name} (${account.balance})`,
                          }))
                      : journalType.toLowerCase().includes("sales")
                      ? data
                          .filter(
                            (acc) =>
                              acc.account_sub_category.account_category.name ===
                              "Income"
                          )
                          .map((account) => ({
                            value: account.id,
                            label: `${account.name}`,
                          }))
                      : journalType.toLowerCase().includes("general")
                      ? data.map((account) => ({
                          value: account.id,
                          label: `${account.name} (${account.balance})`,
                        }))
                      : journalType.toLowerCase().includes("payable")
                      ? data
                          .filter(
                            (acc) =>
                              acc.account_sub_category.account_category.name ===
                              "Liabilities"
                          )
                          .map((account) => ({
                            value: account.id,
                            label: `${account.name} (${account.balance})`,
                          }))
                      : getCreditAccountOptions().map((account) => ({
                          value: account.id,
                          label: `${account.name} (${account.balance})`,
                        }))
                  }
                  onChange={(e) =>
                    handleItemChange(
                      options.rowIndex,
                      "credit_account_id",
                      e.value
                    )
                  }
                  placeholder="Select Credit Account"
                />
              )}
            />
            <Column
              header="Amount"
              body={(line: (typeof formState.lines)[0], options) => {
                // Get the selected debit account ID for this line
                const debitAccountId = line.debit_account_id;

                // Find the corresponding budget item (if exists)
                const budgetItem =
                  formState.budget_id &&
                  journalType.toLowerCase().includes("expense")
                    ? budgetItems.find(
                        (item) => item.chart_of_account_id === debitAccountId
                      )
                    : null;

                // Get the max allowed amount from the budget item
                const maxAmount = budgetItem?.amount;

                return (
                  <InputNumber
                    className="w-max p-inputtext-sm"
                    value={line.amount}
                    min={0}
                    max={maxAmount}
                    onValueChange={(e) => {
                      const newValue = e.value ?? 0;
                      if (maxAmount && newValue > maxAmount) {
                        toast.warning(
                          `Amount cannot exceed budget allocation (${maxAmount})`
                        );
                        return;
                      }
                      handleItemChange(options.rowIndex, "amount", newValue);
                    }}
                    onKeyDown={(e) => {
                      // Prevent typing if it would exceed max amount
                      if (
                        maxAmount &&
                        line.amount >= maxAmount &&
                        e.key !== "Backspace"
                      ) {
                        e.preventDefault();
                      }
                    }}
                  />
                );
              }}
            />
            <Column
              header="Actions"
              body={(_, options) => (
                <Button
                  type="button"
                  icon="pi pi-trash"
                  className="!bg-red-500 p-2"
                  onClick={() => removeItem(options.rowIndex)}
                />
              )}
            />
          </DataTable>
        </div>
        <div className="col-span-full h-24">
          <h4 className="text-xl font-bold my-2">Support Files</h4>
          <FileUploadInput
            uploadVisible={false}
            onFilesChange={(files) =>
              setFormState({ ...formState, supporting_files: files })
            }
          />
        </div>
      </form>
    </Dialog>
  );
};

export default AddOrModifyItem;
