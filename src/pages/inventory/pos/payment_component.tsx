//@ts-nocheck
import { useEffect, useState } from "react";
import Select from "react-select";
import usePaymentMethods from "../../../hooks/procurement/usePaymentMethods";
import { InputText } from "primereact/inputtext";
import { RootState } from "../../../redux/store";
import { useSelector } from "react-redux";

const PaymentComponent = ({ setPaymentMethod, setClientName }) => {
  const { data: methods = [] } = usePaymentMethods();
  const customers = useSelector((state: RootState) => state.customers.data);
  const [isRegistered, setIsRegistered] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientName, setClientNameState] = useState("");
  const [contact, setContact] = useState('')
  const [clients, setClients] = useState<any>([])


  useEffect(()=> {
    // Format clients for React Select
    const clientOptions = customers?.map(client => ({
      value: client.organization_name,
      label: client.organization_name,
    }));

    setClients(clientOptions)

  },[customers])

  // Options for the payment method
  const paymentOptions = methods?.map((method) => ({
    value: method.id,
    label: method.name,
  }));

  // Handle changes
  const handleClientChange = (option) => {
    setSelectedClient(option);
    setClientName(option?.value);
  };

  const handleClientNameChange = (e) => {
    setClientNameState(e.target.value);
    setClientName(e.target.value);
  };

  const contactHandler = (e) => {
    setContact(e.target.value)
  }

  return (
    <div className="p-4 bg-white shadow-md rounded-lg">
      <h3 className="text-lg font-semibold mb-3">Payment Details</h3>

      {/* Registered / Not Registered Selection */}
      <div className="flex items-center space-x-4">
        Is client registered?
        <label className="flex items-center ml-2 space-x-2">
          <input
            type="radio"
            name="isRegistered"
            value="true"
            checked={isRegistered === true}
            onChange={() => setIsRegistered(true)}
            className="w-4 h-4"
          />
          <span>Yes</span>
        </label>
        <label className="flex items-center space-x-2">
          <input
            type="radio"
            name="isRegistered"
            value="false"
            checked={isRegistered === false}
            onChange={() => setIsRegistered(false)}
            className="w-4 h-4"
          />
          <span>No</span>
        </label>
      </div>

      {/* Client Selection */}
      {isRegistered ? (
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            Select Client (Optional)
          </label>
          <Select
            options={clients}
            value={clients?.find(
              (option) => option.value === selectedClient?.value
            )}
            onChange={handleClientChange}
            placeholder="Select a client..."
          />
        </div>
      ) : (
        <>
          <div className="mb-4 mt-4">
            <InputText
              id="name"
              name="client_name"
              value={clientName}
              onChange={handleClientNameChange}
              placeholder="Client name"
              className="w-full"
            />
          </div>
          <div className="mb-4 mt-4">
            <InputText
              id="contact"
              name="contact"
              value={contact}
              onChange={contactHandler}
              placeholder="Contact"
              className="w-full"
            />
          </div>
        </>
      )}

      {/* Payment Method Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">
          Payment Method (Optional)
        </label>
        <Select
          options={paymentOptions}
          onChange={(option) => setPaymentMethod(option.value)}
        />
      </div>
    </div>
  );
};

export default PaymentComponent;
