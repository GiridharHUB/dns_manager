import React, { useState } from "react";
import "./Login.css";
import userIcon from "../../Assets/img/userIcon.png";
import pass from "../../Assets/img/pass.png";
import { useNavigate } from "react-router-dom";
import { message } from "antd";
import axios from "axios";

function Login() {
  const [visible, setVisible] = useState(false);
  const [data, setData] = useState([]);
  const navigate = useNavigate();
  const login = async () => {
    if (data.length === 0) {
      return message.error("Please enter all the fields");
    } else {
      await axios
        .post("https://dns-manager-mxbz.vercel.app/login", { data })
        .then((response) => {
          if (response.status === 200) {
            localStorage.setItem("isLoggedIn", true);
            navigate("/");
            window.location.reload();
          } else {
            message.error("Incorrect username or password");
          }
        });
    }
  };
  const onChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };
  return (
    <div className="login-main">
      <div className="login-body">
        <div className="login-card">
          <h3 style={{ textAlign: "center", color: "#009879" }}>Login</h3>
          <div className="login-form">
            <div className="login-form-username">
              <input
                type="text"
                placeholder="example@email.com"
                onChange={onChange}
                name="userid"
              />
              <img
                src={userIcon}
                alt="bfi-logo-img"
                className="username-icon"
              />
            </div>
            <div className="login-form-username">
              <input
                type={visible ? "text" : "password"}
                placeholder="password"
                name="password"
                onChange={onChange}
              />
              <img
                src={pass}
                alt="bfi-logo-img"
                className="password-icon"
                onClick={() => setVisible(!visible)}
              />
            </div>
            <button
              className="primary-btn"
              style={{ margin: "2vh" }}
              onClick={login}
            >
              Login
            </button>
            {/* <span style={{ fontWeight: "700", marginBottom: "5vh" }}>
              Forgot{" "}
              <span style={{ color: "rgba(0, 114, 188, 1)" }}>Password?</span>
            </span> */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
