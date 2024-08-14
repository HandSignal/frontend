import React from "react";
import "../styles/Home.css";
import Logo from "../assets/HS_Logo.png";

const Home: React.FC = () => {
  return (
    <div className="home-container">
      <div className="left-section">
        <img src={Logo} alt="Logo" className="logo" />
      </div>
      <div className="right-section">
        <div className="login-container">
          <h2>로그인</h2>
          <form>
            <div className="input-group">
              <label htmlFor="username">아이디</label>
              <input type="text" id="username" name="username" required />
            </div>
            <div className="input-group">
              <label htmlFor="password">비밀번호</label>
              <input type="password" id="password" name="password" required />
            </div>
            <button type="submit">로그인</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Home;
