import ReactDOM from "react-dom/client";
import { Toaster } from "react-hot-toast";
import App from "./App";
import "./styles/global.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3500,
        style: { fontSize: "14px" },
      }}
    />
  </>,
);
