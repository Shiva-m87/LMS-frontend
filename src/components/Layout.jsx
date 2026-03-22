import React from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isNavOpen, setIsNavOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleNav = () => {
    setIsNavOpen(!isNavOpen);
  };

  const closeNav = () => {
    setIsNavOpen(false);
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-brand">
          <Link to="/" onClick={closeNav}>Leave Management System</Link>
        </div>
        
        <button className="nav-toggle" onClick={toggleNav} aria-label="Toggle navigation">
          <span></span>
          <span></span>
          <span></span>
        </button>

        <div className={`nav-links ${isNavOpen ? 'open' : ''}`}>
          {user ? (
            <>
              <span className="nav-link" style={{ cursor: "default" }}>
                {user.name}{" "}
                <span style={{ fontSize: "0.8rem", opacity: 0.7 }}>
                  ({user.role})
                </span>
              </span>
              <button
                onClick={handleLogout}
                className="btn btn-outline"
                style={{ padding: "0.4rem 1rem", fontSize: "0.9rem" }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link" onClick={closeNav}>
                Login
              </Link>
              <Link to="/register" className="nav-link" onClick={closeNav}>
                Register
              </Link>
            </>
          )}
        </div>
      </nav>
      <main className="container mt-4 mb-4">
        <Outlet />
      </main>
    </>
  );
};

export default Layout;
