import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import "../styles/Login.css";
import Logo from "../assets/HS_Logo.png";

const Login: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [animationFinished, setAnimationFinished] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const validUsername = "user";
    const validPassword = "pass";

    if (username === validUsername && password === validPassword) {
      setError("");
      setAnimationFinished(true);
      setTimeout(() => {
        navigate("/home");
      }, 500);
    } else {
      setError("아이디 또는 비밀번호가 일치하지 않습니다.");
    }
  };

  const handleSignup = () => {
    navigate("/signup");
  };

  return (
    <motion.div
      className="home-container"
      initial={{ opacity: 1 }}
      animate={{ opacity: animationFinished ? 0 : 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="left-section"
        initial={{ x: animationFinished ? "0" : "-100%" }}
        animate={{ x: animationFinished ? "-100%" : "0" }}
        transition={{ duration: 0.5 }}
      >
        <img src={Logo} alt="Logo" className="logo" />
      </motion.div>
      <motion.div
        className="right-section"
        initial={{ x: animationFinished ? "0" : "100%" }}
        animate={{ x: animationFinished ? "100%" : "0" }}
        transition={{ duration: 0.5 }}
      >
        <div className="login-container">
          <h2>Login</h2>
          <form onSubmit={handleSubmit} className="login-form">
            <div className="input-group">
              <label htmlFor="username">아이디</label>
              <input
                type="text"
                id="username"
                name="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <label htmlFor="password">비밀번호</label>
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="error-message">{error}</p>}
            <div className="button-container">
              <button
                type="button"
                className="left-button"
                onClick={handleSignup}
              >
                회원가입
              </button>
              <button type="submit" className="right-button">
                로그인
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Login;
