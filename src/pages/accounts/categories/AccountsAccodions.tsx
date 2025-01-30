import React from "react";
import { Accordion, AccordionTab } from "primereact/accordion";
import { IAccountType } from "../../../redux/slices/types/accounts/AccountType";

interface AccountsAccodionsProps {
  accounts: IAccountType[];
}

const AccountsAccodions: React.FC<AccountsAccodionsProps> = ({ accounts }) => {
  // Generate an array of indices for all tabs to make all accordions open by default
  const allIndices = accounts.map((_, index) => index);

  return (
    <div className="p-4">
      <Accordion activeIndex={allIndices} multiple>
        {accounts.map((account) => (
          <AccordionTab
            key={account.id}
            header={
              <div className="flex items-center justify-between h-2 border-gray-200">
                <h3 className="text-xl font-bold text-gray-800">
                  {account.name}
                </h3>
                <span className="text-base text-gray-600">{account.code}</span>
              </div>
            }
          >
            {account.account_sub_categories.length > 0 && (
              <Accordion multiple>
                {account.account_sub_categories.map((subCategory) => (
                  <AccordionTab
                    key={subCategory.id}
                    header={
                      <div className="flex items-center justify-between h-2 border-gray-200">
                        <h4 className="text-lg font-semibold text-gray-800">
                          {subCategory.name}
                        </h4>
                        <span className="text-base text-gray-600">
                          {subCategory.code}
                        </span>
                      </div>
                    }
                  >
                    {subCategory.children.length > 0 && (
                      <Accordion multiple>
                        {subCategory.children.map((child) => (
                          <AccordionTab
                            key={child.id}
                            header={
                              <div className="flex items-center justify-between h-2 border-gray-200">
                                <h5 className="text-base font-medium text-gray-800">
                                  {child.name}
                                </h5>
                                <span className="text-sm text-gray-600">
                                  {child.code}
                                </span>
                              </div>
                            }
                          >
                            {child.children.length > 0 && (
                              <ul className="list-disc list-inside pl-4">
                                {child.children.map((grandChild) => (
                                  <li key={grandChild.id} className="text-sm">
                                    {grandChild.name} (Code: {grandChild.code})
                                  </li>
                                ))}
                              </ul>
                            )}
                          </AccordionTab>
                        ))}
                      </Accordion>
                    )}
                  </AccordionTab>
                ))}
              </Accordion>
            )}
          </AccordionTab>
        ))}
      </Accordion>
    </div>
  );
};

export default AccountsAccodions;
