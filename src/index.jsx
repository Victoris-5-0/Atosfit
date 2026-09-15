import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/tailwind.css";
import "./styles/index.css";
import { applyTheme, getSavedTheme } from "./utils/theme";
import { applyDocumentLanguage, getSavedLanguage } from "./utils/language";

// Apply persisted theme early (before React render) to avoid flash
try {
  applyTheme(getSavedTheme());
} catch (e) {
  applyTheme('dark');
}

try {
  applyDocumentLanguage(getSavedLanguage());
} catch {}

const container = document.getElementById("root");
const root = createRoot(container);

root.render(<App />);
