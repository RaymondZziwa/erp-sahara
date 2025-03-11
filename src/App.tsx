import { Provider } from "react-redux";
import AppRouter from "./routes";
import store from "./redux/store";
import { PrimeReactProvider } from "primereact/api";
import i18n from "./locales/config/config";
import { I18nextProvider } from "react-i18next";

const App = () => {
  return (
    <I18nextProvider i18n={i18n}>
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
    </I18nextProvider>
  );
};

export default App;
