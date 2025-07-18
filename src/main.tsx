import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Theme } from "@radix-ui/themes";
import { ThemeProvider } from "next-themes";
import App from "./App.tsx";
//import './index.css'
import "@radix-ui/themes/styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <Theme>
        <App />
      </Theme>
    </ThemeProvider>
  </StrictMode>,
);
