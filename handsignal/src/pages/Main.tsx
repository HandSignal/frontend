import React from "react";
import { useNavigate } from "react-router-dom";

const Main: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/login");
  };

  return (
    <div className="home-container">
      <header className="home-header">
        <h1>환영합니다!</h1>
        <p>메인 홈페이지에 오신 것을 환영합니다.</p>
      </header>
      <nav className="home-nav">
        <button onClick={() => navigate("/profile")} className="nav-button">
          프로필
        </button>
        <button onClick={() => navigate("/settings")} className="nav-button">
          설정
        </button>
        <button onClick={handleLogout} className="nav-button logout-button">
          로그아웃
        </button>
      </nav>
    </div>
  );
};

export default Main;
