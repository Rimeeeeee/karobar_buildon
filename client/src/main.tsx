import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { ThirdwebProvider } from "thirdweb/react";
import "./index.css";
import { WagmiProvider } from "wagmi";
import { KBRTokenContextProvider } from "./context/context";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThirdwebProvider>
      <KBRTokenContextProvider>
        <div className="no-scrollbar">
          <App />
        </div>
      </KBRTokenContextProvider>
    </ThirdwebProvider>
  </React.StrictMode>,
);