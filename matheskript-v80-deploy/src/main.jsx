import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { spracheStarten } from "./i18n.js";
spracheStarten().finally(() => createRoot(document.getElementById("root")).render(<App />));
