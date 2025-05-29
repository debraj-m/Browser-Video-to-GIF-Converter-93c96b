import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// Create a root element and render the App
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to measure performance, you can use the commented code below
// import reportWebVitals from "./reportWebVitals";
// reportWebVitals(console.log);

// Enable Cross-Origin Isolation for optimal ffmpeg.wasm performance
if (!window.crossOriginIsolated) {
  console.warn(
    "Cross-Origin-Isolation is not enabled. This may affect ffmpeg.wasm performance. " +
    "For best results, consider running with proper COOP/COEP headers."
  );
}