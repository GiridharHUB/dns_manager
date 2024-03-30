import React from "react";
import { NavLink } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  return (
    <div className="navbar">
      <div className="navbar-header">
        <NavLink
          to={"/"}
          style={{ textDecoration: "none", color: "whitesmoke" }}
        >
          <h2>DNS Manager</h2>
        </NavLink>
      </div>
      <div className="navbar-content">
        {localStorage.getItem("isLoggedIn") ? (
          <button
            className="primary-btn"
            style={{ backgroundColor: "white", color: "#009879" }}
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
          >
            Logout
          </button>
        ) : (
          <NavLink to={"/login"}>
            <button
              className="primary-btn"
              style={{ backgroundColor: "white", color: "#009879" }}
            >
              Login
            </button>
          </NavLink>
        )}
      </div>
    </div>
  );
};

export default Navbar;
