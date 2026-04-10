import React, { useState } from "react";
import { AppProvider } from "./context/AppContext";
import { Shell } from "./components/layout/Shell";
import { Dashboard } from "./pages/Dashboard";
import { People } from "./pages/People";
import { Products } from "./pages/Products";
import { Expenses } from "./pages/Expenses";
import { Summary } from "./pages/Summary";

function MainContent() {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <Shell activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === "dashboard" && <Dashboard />}
      {activeTab === "people" && <People />}
      {activeTab === "products" && <Products />}
      {activeTab === "expenses" && <Expenses />}
      {activeTab === "summary" && <Summary />}
    </Shell>
  );
}

function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}

export default App;
