import { Bell, Search } from "lucide-react";

function Header() {
  return (
    <header className="topbar">
      <div className="header-title">
        <h1>Dashboard</h1>
        <p>Welcome to your business operations platform.</p>
      </div>

      <div className="header-actions">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search..."
          />
        </div>

        <button className="notification-button">
          <Bell size={20} />
        </button>

        <div className="profile">
          <div className="profile-avatar">
            G
          </div>

          <div className="profile-info">
            <strong>Gowtham</strong>
            <span>Administrator</span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;