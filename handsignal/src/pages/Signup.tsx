import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../assets/HS_Logo.png";

const Signup: React.FC = () => {
  const [nickname, setNickname] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    if (nickname && username && password) {
      alert("회원가입이 완료되었습니다! \n로그인 페이지로 이동합니다.");
      setError("");
      navigate("/");
    } else {
      setError("모든 필드를 채워주세요.");
    }
  };

  return (
    <div className="home-container">
      <div className="left-section">
        <img src={Logo} alt="Logo" className="logo" />
      </div>
      <div className="right-section">
        <div className="login-container">
          <h2>Sign Up</h2>
          <form onSubmit={handleSubmit} className="login-form">
            <div className="input-group">
              <label htmlFor="nickname">닉네임</label>
              <input
                type="text"
                id="nickname"
                name="nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                required
              />
            </div>
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
            <div className="input-group">
              <label htmlFor="confirmPassword">비밀번호 확인</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="error-message">{error}</p>}
            <div className="button-container">
              <button type="submit" className="right-button">
                회원가입
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;
