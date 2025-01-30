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
import useLedgerChartOfAccounts from "../../../hooks/accounts/useLedgerChartOfAccounts";
import { AccountType } from "../../../redux/slices/types/accounts/accountTypes";
import useProjects from "../../../hooks/projects/useProjects";
import useBudgets from "../../../hooks/budgets/useBudgets";
import FileUploadInput from "../../../components/FileUploadInput";
import { toast } from "react-toastify";

interface AddOrModifyItemProps {
  visible: boolean;
  onClose: () => void;
  item?: Ledger;
  onSave: () => void;
  debitAccountType: AccountType;
  creditAccountType: AccountType;
  endpoint: string;
  journalType: string;
  creditAccountsHeader: string;
  debitAccountsHeader: string;
}

interface IAddLedger {
  transaction_date: string;
  reference?: string;
  journal_type_id: number;
  description: string;
  lines: Line[];
  supporting_files?: File[];
  currency_id: number;
}

interface AddLedger {
  transaction_date: Date;
  reference: string;
  project_id?: number | null;
  segment_id?: number | null;
  budget_id?: number | null;
  journal_type_id: number;
  description: string;
  debitLines: Line[];
  creditLines: Line[];
  currency_id: number;
  supporting_files: File[];
}

interface Line {
  chart_of_account_id: number;
  credit_amount?: number;
  debit_amount?: number;
  currency_id: number;
}

const AddOrModifyItem: React.FC<AddOrModifyItemProps> = ({
  visible,
  onClose,
  item,
  onSave,
  debitAccountType,
  creditAccountType,
  endpoint,
  journalType,
}) => {
  const [formState, setFormState] = useState<Partial<AddLedger>>({
    transaction_date: new Date(),
    reference: "",
    project_id: null,
    segment_id: null,
    budget_id: null,
    journal_type_id: 0,
    description: "",
    debitLines: [],
    creditLines: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { token } = useAuth();
  const { data: currenciesData, loading: currenciesLoading } = useCurrencies();
  const { data: projects, loading: projectsLoading } = useProjects();
  const { data: budgets, loading: budgetsLoading } = useBudgets();

  const { data: creditAccounts, loading: creditAccountsLoading } =
    useLedgerChartOfAccounts({
      accountType: creditAccountType,
    });
  const { data: debitAccounts, loading: debitAccountsLoading } =
    useLedgerChartOfAccounts({
      accountType: debitAccountType,
    });
  const currencies = currenciesData.map((curr) => ({
    label: curr.code,
    value: curr.id,
  }));

  useEffect(() => {
    if (item) {
      // setFormState({ ...item });
    } else {
      setFormState({
        transaction_date: new Date(),
        reference: "",
        project_id: null,
        segment_id: null,
        budget_id: null,
        journal_type_id: 3,
        description: "",
        debitLines: [],
        creditLines: [],
      });
    }
  }, [item]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const isBalanced = () => {
    const totalCredit = (formState.creditLines || []).reduce(
      (acc, line) => acc + (line.credit_amount || 0),
      0
    );
    const totalDebit = (formState.debitLines || []).reduce(
      (acc, line) => acc + (line.debit_amount || 0),
      0
    );
    return totalCredit === totalDebit;
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isBalanced()) {
      toast.warn("Credit and debit amounts must balance.");
      return;
    }

    setIsSubmitting(true);
    if (
      !formState.journal_type_id ||
      !formState.currency_id ||
      formState.currency_id == undefined
    ) {
      setIsSubmitting(false);
      return;
    }
    const data: IAddLedger = {
      ...formState,
      lines: [
        ...(formState.creditLines ?? []),
        ...(formState.debitLines ?? []),
      ].map((line) => ({ ...line, currency_id: formState.currency_id! })),

      transaction_date:
        formState.transaction_date?.toISOString().slice(0, 10) ?? "",
      reference: formState.reference,
      //"project_id": 1, Nullable
      // "segment_id": 2, Nullable
      //"budget_id": 3, Nullable
      journal_type_id: formState.journal_type_id,
      description: formState.description ?? "",
      currency_id: formState.currency_id,
      supporting_files: formState?.supporting_files,
    };
    const method = item?.id ? "PUT" : "POST";
    const endPoint = item?.id
      ? ACCOUNTS_ENDPOINTS.TRANSACTIONS.UPDATE(item.id.toString())
      : endpoint;

    await createRequest(endPoint, token.access_token, data, onSave, method);
    setIsSubmitting(false);
    setFormState({
      reference: "",
      project_id: null,
      segment_id: null,
      budget_id: null,
      journal_type_id: 0,
      description: "",
      debitLines: [],
      creditLines: [],
    });
    onSave();
    onClose();
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
    type: "credit" | "debit",
    index: number,
    field: keyof Line,
    value: string | number
  ) => {
    const updatedItems =
      type == "credit"
        ? [...(formState.creditLines ?? [])]
        : [...(formState.debitLines ?? [])];
    updatedItems[index] = { ...updatedItems[index], [field]: value };

    type == "credit"
      ? setFormState((prevState) => ({
          ...prevState,
          creditLines: updatedItems,
        }))
      : setFormState((prevState) => ({
          ...prevState,
          debitLines: updatedItems,
        }));
  };

  const handleItemSelectChange = (
    type: "credit" | "debit",
    index: number,
    value: string
  ) => {
    const selectedItem = (
      type === "credit" ? creditAccounts : debitAccounts
    ).find((item) => item.id.toString() === value.toString());

    if (selectedItem) {
      const updatedItems = [
        ...(type === "credit"
          ? formState.creditLines ?? []
          : formState.debitLines ?? []),
      ];

      updatedItems[index] = {
        ...updatedItems[index],
        chart_of_account_id: selectedItem.id,
      };

      if (type === "credit") {
        setFormState((prevState) => ({
          ...prevState,
          creditLines: [...updatedItems],
        }));
      } else {
        setFormState((prevState) => ({
          ...prevState,
          debitLines: [...updatedItems],
        }));
      }
    }
  };

  const removeItem = (type: "credit" | "debit", index: number) => {
    const updatedItems =
      type == "credit"
        ? [...(formState.creditLines ?? [])]
        : [...(formState.debitLines ?? [])];
    updatedItems.splice(index, 1);
    type == "credit"
      ? setFormState((prevState) => ({
          ...prevState,
          creditLines: updatedItems,
        }))
      : setFormState((prevState) => ({
          ...prevState,
          debitLines: updatedItems,
        }));
  };

  const addItem = (type: "credit" | "debit") => {
    type == "credit"
      ? setFormState((prevState) => ({
          ...prevState,
          creditLines: [
            ...(prevState.creditLines ?? []),
            {
              chart_of_account_id: 0,
              currency_id: 0,
              credit_amount: 0,
              debit_amount: 0,
            },
          ],
        }))
      : setFormState((prevState) => ({
          ...prevState,
          debitLines: [
            ...(prevState.debitLines ?? []),
            {
              chart_of_account_id: 0,
              currency_id: 0,
              credit_amount: 0,
              debit_amount: 0,
            },
          ],
        }));
  };
  return (
    <Dialog
      header={
        item?.id ? `${journalType ?? ""} Journal` : `${journalType} Journal`
      }
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
          <label htmlFor="transaction_date">Transaction Date</label>
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
          <div className="">
            <label htmlFor="account type">Currency</label>
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
        </div>
        <div className="col-span-full">
          <h3 className="font-bold  text-xl">{creditAccountType} - Credit</h3>
          <div className="col-span-full">
            <DataTable
              size="small"
              value={formState.creditLines}
              emptyMessage="No items added yet."
              className="w-full"
              footer={
                <div className="p-field mt-3">
                  <Button
                    size="small"
                    type="button"
                    label="Add Item"
                    icon="pi pi-plus"
                    onClick={() => addItem("credit")}
                    className="p-button-outlined w-max"
                  />
                </div>
              }
            >
              <Column
                header="Item"
                field="item_name"
                className="p-inputtext-sm"
                body={(item: Line, options) =>
                  item.chart_of_account_id > 0 ? (
                    creditAccounts.find(
                      (acc) => acc.id === item.chart_of_account_id
                    )?.name
                  ) : (
                    <Dropdown
                      loading={creditAccountsLoading}
                      value={item.chart_of_account_id}
                      options={creditAccounts?.map((account) => ({
                        value: account.id,
                        label: account.name,
                      }))}
                      onChange={(e) =>
                        handleItemSelectChange(
                          "credit",
                          options.rowIndex,
                          e.value
                        )
                      }
                      placeholder="Select Account"
                    />
                  )
                }
              />
              <Column
                header="Amount"
                field="credit_amount"
                body={(item: Line, options) => (
                  <InputNumber
                    className="w-max p-inputtext-sm"
                    value={item.credit_amount}
                    onChange={(e) =>
                      handleItemChange(
                        "credit",
                        options.rowIndex,
                        "credit_amount",
                        e.value ? +e.value : ""
                      )
                    }
                  />
                )}
              />

              <Column
                header="Actions"
                body={(_, options) => (
                  <Button
                    type="button"
                    icon="pi pi-trash"
                    className="!bg-red-500 p-2"
                    onClick={() => removeItem("credit", options.rowIndex)}
                  />
                )}
              />
            </DataTable>
          </div>
        </div>

        <div className="col-span-full">
          <h3 className="font-bold  text-xl">{debitAccountType} - Debit</h3>
          <div className="col-span-full">
            <DataTable
              size="small"
              value={formState.debitLines}
              emptyMessage="No items added yet."
              className="w-full"
              footer={
                <div className="p-field mt-3">
                  <Button
                    size="small"
                    type="button"
                    label="Add Item"
                    icon="pi pi-plus"
                    onClick={() => addItem("debit")}
                    className="p-button-outlined w-max"
                  />
                </div>
              }
            >
              <Column
                header="Item"
                field="item_name"
                body={(item: Line, options) =>
                  item.chart_of_account_id > 0 ? (
                    debitAccounts.find(
                      (acc) => acc.id === item.chart_of_account_id
                    )?.name
                  ) : (
                    <Dropdown
                      className="p-inputtext-sm"
                      loading={debitAccountsLoading}
                      value={item.chart_of_account_id}
                      options={debitAccounts?.map((account) => ({
                        value: account.id,
                        label: account.name,
                      }))}
                      onChange={(e) =>
                        handleItemSelectChange(
                          "debit",
                          options.rowIndex,
                          e.value
                        )
                      }
                      placeholder="Select Account"
                    />
                  )
                }
              />
              <Column
                header="Amount"
                field="debit_amount"
                body={(item: Line, options) => (
                  <InputNumber
                    className="w-max p-inputtext-sm"
                    value={item.debit_amount}
                    onChange={(e) =>
                      handleItemChange(
                        "debit",
                        options.rowIndex,
                        "debit_amount",
                        e.value ? +e.value : ""
                      )
                    }
                  />
                )}
              />

              <Column
                header="Actions"
                body={(_, options) => (
                  <Button
                    type="button"
                    icon="pi pi-trash"
                    className="!bg-red-500 p-2"
                    onClick={() => removeItem("credit", options.rowIndex)}
                  />
                )}
              />
            </DataTable>
          </div>
        </div>
        <div className="col-span-full">
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
