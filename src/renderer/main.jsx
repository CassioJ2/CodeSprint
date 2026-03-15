import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { FlagsProvider } from "./context/FlagsContext";
import "./styles/tokens.css";
import "./styles/global.css";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <FlagsProvider>
      <App />
    </FlagsProvider>
  </React.StrictMode>,
);
