import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Set document title
document.title = "Apex Minds - Tactical Decision Simulator";

// Add meta tags for better SEO
const metaDescription = document.createElement('meta');
metaDescription.name = 'description';
metaDescription.content = 'Advanced 3D tactical decision-making simulator for training scenarios and performance tracking';
document.head.appendChild(metaDescription);

createRoot(document.getElementById("root")!).render(<App />);
