import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { AccessibilityProvider } from "./Components/Acessibilidade/AccessibilityContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AccessibilityProvider>
      <App />
    </AccessibilityProvider>
  </StrictMode>
);
