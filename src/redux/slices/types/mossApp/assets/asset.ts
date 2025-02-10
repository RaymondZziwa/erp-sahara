export interface Asset {
    name: string,
    supplier?: string, //Nullable
    asset_account_id: number,
    asset_category_id: number,
    identity_no: string,
    purchase_date: string,
    date_put_to_use: string,
    purchase_cost: number,
    current_value: number,
    date_when: string,
    depreciation_account_id: number,
    depreciation_loss_account_id: number, //Pull from expense ledgers list
    depreciation_gain_account_id: number, //Pull from income category list
    expense_account_id: number, //Pull from expense ledgers list
    depreciation_method: string,//straight_line, declining_balance
    depreciation_rate: number,
    income_account_id: number,
    appreciation_account_id: number,
    appreciation_loss_account_id: number,
    appreciation_gain_account_id: number,
    appreciation_rate: number, //nullable pick if user selects item as appreciating item 
    salvage_value: number,
    useful_life: number,
    description: string
}