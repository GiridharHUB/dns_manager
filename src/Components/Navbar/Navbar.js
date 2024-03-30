import React from "react";
import { NavLink } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  return (
    <div className="navbar">
      <div className="navbar-header">
        <h2>DNS Manager</h2>
      </div>
      <div className="navbar-content">
        <button className="primary-btn" style={{ backgroundColor: "white", color: '#009879' }}>
          Login
        </button>
      </div>
    </div>
  );
};

export default Navbar;
