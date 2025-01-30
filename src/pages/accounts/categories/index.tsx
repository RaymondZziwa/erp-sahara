import useAccounts from "../../../hooks/accounts/useAccounts";
import AccountsAccodions from "./AccountsAccodions";

const Accounts = () => {
  const { data, loading, error } = useAccounts();

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-6">Categories</h2>
      {loading && <p className="text-blue-600">Loading...</p>}
      {error && <p className="text-red-600">Error loading accounts.</p>}

      <AccountsAccodions accounts={data} />
    </div>
  );
};

export default Accounts;
