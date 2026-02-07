import { useState } from "react";
import ItemManager from "./components/ItemManager";
import UserManager from "./components/UserManager";
import "./App.css";

function App() {
  const [activeTab, setActiveTab] = useState("items");

  return (
    <div className="app">
      <nav className="nav-tabs">
        <button
          className={`nav-tab ${activeTab === "items" ? "active" : ""}`}
          onClick={() => setActiveTab("items")}
        >
          📦 Item Manager
        </button>
        <button
          className={`nav-tab ${activeTab === "users" ? "active" : ""}`}
          onClick={() => setActiveTab("users")}
        >
          👤 User Manager
        </button>
      </nav>
      <main className="content">
        {activeTab === "items" ? <ItemManager /> : <UserManager />}
      </main>
    </div>
  );
}

export default App;
