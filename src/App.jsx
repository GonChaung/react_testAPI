import { useState } from "react";
import ItemManager from "./components/ItemManager";
import UserManager from "./components/UserManager";
import ProfileManager from "./components/ProfileManager";
import "./App.css";

function App() {
  const [activeTab, setActiveTab] = useState("items");

  const renderContent = () => {
    switch (activeTab) {
      case "items":
        return <ItemManager />;
      case "users":
        return <UserManager />;
      case "profiles":
        return <ProfileManager />;
      default:
        return <ItemManager />;
    }
  };

  return (
    <div className="app">
      <nav className="nav-tabs">
        <button
          className={`nav-tab ${activeTab === "items" ? "active" : ""}`}
          onClick={() => setActiveTab("items")}
        >
          Item Manager
        </button>
        <button
          className={`nav-tab ${activeTab === "users" ? "active" : ""}`}
          onClick={() => setActiveTab("users")}
        >
          User Manager
        </button>
        <button
          className={`nav-tab ${activeTab === "profiles" ? "active" : ""}`}
          onClick={() => setActiveTab("profiles")}
        >
          Profile Manager
        </button>
      </nav>
      <main className="content">{renderContent()}</main>
    </div>
  );
}

export default App;
