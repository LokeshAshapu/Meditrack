import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom"; // 1. Import this
import './index.css';

ReactDOM.createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter> {/* 2. Wrap your App in the router here */}
      <App />
    </BrowserRouter>
  </StrictMode>
);