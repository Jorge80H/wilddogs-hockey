import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { captureAttribution } from "./lib/attribution";
import { initAdTracking } from "./lib/analytics";

captureAttribution();
initAdTracking();

createRoot(document.getElementById("root")!).render(<App />);
