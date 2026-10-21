import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import VaultApp from "./pages/VaultApp";
import Docs from "./pages/Docs";
import Status from "./pages/Status";
import Changelog from "./pages/Changelog";
import { LangProvider } from "./lib/i18n";

function App() {
  return (
    <LangProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/app" element={<VaultApp />} />
          <Route path="/docs" element={<Docs />} />
          <Route path="/status" element={<Status />} />
          <Route path="/changelog" element={<Changelog />} />
          <Route path="*" element={<Landing />} />
        </Routes>
      </BrowserRouter>
    </LangProvider>
  );
}

export default App;
