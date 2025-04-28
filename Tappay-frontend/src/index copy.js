import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { Provider } from "react-redux";
import { store, persistor } from "./components/Redux/store"; // Note: now importing persistor too
import { ThemeProvider } from "styled-components";
import { theme } from "./theme";
import { PersistGate } from "redux-persist/integration/react"; // Import PersistGate

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <Provider store={store}>
    {/* PersistGate delays rendering until persisted state is restored */}
    <PersistGate loading={null} persistor={persistor}>
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    </PersistGate>
  </Provider>
);

reportWebVitals();
