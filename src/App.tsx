import { Provider } from "react-redux";
import AppRouter from "./routes";
import store from "./redux/store";
import { PrimeReactProvider } from "primereact/api";

const App = () => {
  return (
    <Provider store={store}>
      <PrimeReactProvider
        value={{
          pt: {
            button: {
              // Global default button (teal styling)
              root: {
                className:
                  "bg-teal-500 hover:bg-teal-700 cursor-pointer text-white border-round border-none flex focus:ring-0",
              },
            },
            progressbar: {
              root: {
                className:
                  "overflow-hidden relative border-0 h-6 bg-gray-200 rounded-md",
              },
              value: { className: "bg-teal-500" },
            },
            panel: {},
          },
        }}
      >
        <AppRouter />
      </PrimeReactProvider>
    </Provider>
  );
};

export default App;
