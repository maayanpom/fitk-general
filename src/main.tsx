import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import { DirectionProvider } from "@/components/ui/direction"
import "./index.css"
import App from "./App.tsx"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <DirectionProvider dir="rtl">
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </DirectionProvider>
  </StrictMode>,
)
