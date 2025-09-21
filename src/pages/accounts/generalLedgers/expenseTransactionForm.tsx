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
  debitLabel?: string;
  creditLabel?: string;
  journalType: string;
  creditAccountsHeader: string;
  debitAccountsHeader: string;
}

interface AddLedger {
  transaction_date: Date;
  reference: string;
  narrative: string;
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
    narrative: "",
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
  const [selectedBudget, setSelectedBudget] = useState()
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
    
  const [creditAccountId, setCreditAccountId] = useState<number | null>(null);

  const addDebitLine = () => {
    if (!creditAccountId) {
      toast.warning("Please select a Credit Account first.");
      return;
    }
    setFormState((prev) => ({
      ...prev,
      lines: [
        ...(prev.lines ?? []),
        {
          debit_account_id: 0,
          credit_account_id: creditAccountId,
          amount: 0,
          currency_id: formState.currency_id ?? 0,
        },
      ],
    }));
  };

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
      narrative: formState.narrative ?? "",
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
      className="max-w-full md:max-w-screen-lg px-2 md:w-[600px]"
      footer={footer}
      onHide={onClose}
    >
      <form
        id="ledger-form"
        onSubmit={handleSave}
        className="p-fluid grid grid-cols-1 md:grid-cols-1 gap-1"
      >
        
        <div className="relative mt-6">
  <label className="absolute -top-3 left-4 bg-white px-2 text-sm font-semibold text-gray-700">
    Journal Details
  </label>

  <div className="border border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-1 p-4 rounded-lg">
    <div>
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

    <div>
      <label htmlFor="reference">Reference / PVN</label>
      <InputText
        className="p-inputtext-sm"
        id="reference"
        name="reference"
        value={formState.reference}
        onChange={handleInputChange}
        placeholder="Reference/PVN"
      />
    </div>

    <div className="grid md:grid-cols-2 lg:grid-cols-4 col-span-full gap-2">
      <div className="col-span-2">
        <label htmlFor="narrative">Narrative</label>
        <InputText
          className="p-inputtext-sm"
          id="narrative"
          name="narrative"
          value={formState.narrative}
          onChange={handleInputChange}
          placeholder="Narrative"
        />
      </div>

      <div className="col-span-2">
        <label htmlFor="currency">
          Currency <span className="text-red-500">*</span>
        </label>
        <Dropdown
          className="p-inputtext-sm"
          loading={currencies.length === 0 && currenciesLoading}
          value={formState.currency_id}
          options={currencies}
          onChange={(e: DropdownChangeEvent) =>
            setFormState({ ...formState, currency_id: e.value })
          }
          placeholder="Select Currency"
        />
      </div>
    </div>
  </div>
        </div>
        <div className="relative border border-gray-300 rounded-lg p-4 col-span-full mt-4">
  {/* Floating Label */}
  <div className="absolute -top-3 left-4 bg-white px-2 text-sm font-semibold text-gray-700">
    Budget Info
  </div>

  {/* Content Grid */}
  <div className="grid md:grid-cols-2 lg:grid-cols-1 gap-2">
    {(journalType.toLowerCase().includes("expense") ||
      journalType.toLowerCase().includes("sale")) && (
      <>
        <div>
          <label htmlFor="budget_id">Budget <span className="text-red-500">*</span></label>
          <Dropdown
            id="budget_id"
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
</div>

<div className="relative border border-gray-300 rounded-lg p-4 col-span-full mt-4">
  {/* Floating Label */}
  <div className="absolute -top-3 left-4 bg-white px-2 text-sm font-semibold text-gray-700">
    Optional Info
  </div>

  {/* Content Grid */}
  <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-2">
    {(journalType.toLowerCase().includes("expense") ||
      journalType.toLowerCase().includes("sale")) && (
      <>
        <div>
          <label htmlFor="project_id">Project (Optional)</label>
          <Dropdown
            id="project_id"
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
      </>
    )}
  </div>
</div>

        <div className="relative border border-gray-300 rounded-lg p-4 mt-4">
  {/* Floating Label */}
  <div className="absolute -top-3 left-4 bg-white px-2 text-sm font-semibold text-gray-700">
    Entries
  </div>

  {/* Your actual content inside */}
  <div>
    {/* CREDIT ACCOUNT SELECT */}
    <div className="mb-4">
      <label className="text-sm font-semibold">Credit Account</label>
      <Dropdown
        value={creditAccountId}
        options={getCreditAccountOptions().map((acc) => ({
          label: `${acc.name} (${acc.balance})`,
          value: acc.id,
        }))}
        onChange={(e) => setCreditAccountId(e.value)}
        placeholder="Select Credit Account"
        className="p-inputtext-sm w-full"
      />
    </div>

    {/* DATA TABLE */}
    <DataTable
      value={formState.lines}
      emptyMessage="No debits added."
      className="w-full"
      size="small"
      footer={
        <div className="mt-3">
          <Button
            size="small"
            type="button"
            label="Add Expense"
            icon="pi pi-plus"
            onClick={addDebitLine}
            className="p-button-outlined"
          />
        </div>
      }
    >
      <Column
        header="Expense Accounts"
        body={(line, options) => (
          <Dropdown
            value={line.debit_account_id}
            options={getDebitAccountOptions().map((acc) => ({
              label: `${acc.name} (${acc.balance})`,
              value: acc.id,
            }))}
            onChange={(e) =>
              handleItemChange(options.rowIndex, "debit_account_id", e.value)
            }
            className="p-inputtext-sm w-full"
            placeholder="Select Expense Account"
          />
        )}
      />
      <Column
        header="Amount"
        body={(line, options) => (
          <InputNumber
            value={line.amount}
            min={0}
            className="w-full p-inputtext-sm"
            onValueChange={(e) =>
              handleItemChange(options.rowIndex, "amount", e.value ?? 0)
            }
          />
        )}
      />
      <Column
        header="Actions"
        body={(_, options) => (
          <Button
            icon="pi pi-trash"
            className="p-button-danger p-button-sm"
            onClick={() => removeItem(options.rowIndex)}
          />
        )}
      />
    </DataTable>
  </div>
</div>

<div className="relative border border-gray-300 rounded-lg p-4 col-span-full mt-4">
  {/* Floating Label */}
  <div className="absolute -top-3 left-4 bg-white px-2 text-sm font-semibold text-gray-700">
    Support Files
  </div>

  {/* File Upload Input */}
  <input
    type="file"
    multiple
    onChange={(e) => {
      const files = e.target.files;
      if (files) {
        setFormState({
          ...formState,
          supporting_files: Array.from(files),
        });
      }
    }}
    className="block w-full text-sm text-gray-500
               file:mr-4 file:py-2 file:px-4
               file:rounded-full file:border-0
               file:text-sm file:font-semibold
               file:bg-blue-50 file:text-blue-700
               hover:file:bg-blue-100"
  />

  {/* Uploaded File Names */}
  {formState.supporting_files?.length > 0 && (
    <ul className="mt-2 list-disc list-inside text-sm text-gray-700">
      {formState.supporting_files.map((file, index) => (
        <li key={index}>{file.name}</li>
      ))}
    </ul>
  )}
</div>


      </form>
    </Dialog>
  );
};

export default AddOrModifyItem;
