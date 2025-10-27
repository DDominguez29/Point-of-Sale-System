import { Link } from "react-router-dom";

import { useWelcomePage } from "../contexts/WelcomePageContext";
import { useAuth } from "../contexts/AuthContext";
import "./TopNav.css";

export function TopNav() {

  const { pageData: welcomeData } = useWelcomePage();
  const { user, userType, logout } = useAuth();

  return (
    <header className="topnav">
      <div className="nav-left">
        <Link to="/menu" className="btn btn-ghost">Menu</Link>
      </div>
      <div className="nav-center">
        <Link to="/" className="brand">{welcomeData?.FoodTruckName || "Food Truck POS"}</Link>
      </div>
      <div className="nav-right">
        {user ? (
          <>
            <span className="nav-user-name">Hello, {user.Fname}</span>
            {userType === "manager" && (
              <Link to="/manager" className="btn btn-ghost">Dashboard</Link>
            )}
            <button onClick={logout} className="btn btn-primary-nav">Log out</button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-primary-nav">Log in</Link>
            <Link to="/signup" className="btn btn-ghost">Sign up</Link>
          </>
        )}
      </div>
    </header>
  );
}
