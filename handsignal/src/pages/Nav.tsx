import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import top_logo from "../assets/Single_HandSignal.png";
import styles from "../styles/Nav.module.css";
import Modal from "./LogoutModal";

const Nav: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation(); // 현재 경로를 가져오기 위한 useLocation 훅

  const handleLogout = () => {
    setIsModalOpen(true);
  };

  const handleConfirmLogout = () => {
    setIsModalOpen(false);
    navigate("/");
  };

  const handleCancelLogout = () => {
    setIsModalOpen(false);
  };

  const handleClick = () => {
    navigate("/home");
  };

  // 현재 경로에 따라 동적으로 스타일을 적용할 수 있도록 helper 함수를 만듭니다.
  const getButtonClass = (path: string) => {
    return location.pathname === path
      ? `${styles.navButton} ${styles.active}`
      : `${styles.navButton}`;
  };

  return (
    <nav className={styles.homeNav}>
      <input
        type="checkbox"
        id="navToggle"
        className={styles.navToggleCheckbox}
      />
      <label htmlFor="navToggle" className={styles.navToggleLabel}>
        &#9776;
      </label>
      <div className={styles.navMenu}>
        <img
          className={styles.navLogo}
          src={top_logo}
          onClick={handleClick}
          style={{ cursor: "pointer" }}
        />
        <button
          onClick={() => navigate("/recognize")}
          className={getButtonClass("/recognize")}
        >
          수화 번역기
        </button>
        <button
          onClick={() => navigate("/videocall-entry")}
          className={getButtonClass("/videocall-entry")}
        >
          수화 통화
        </button>
        <button
          onClick={handleLogout}
          className={`${styles.navButton} ${styles.logoutButton}`}
        >
          초기화면
        </button>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCancelLogout}
        onConfirm={handleConfirmLogout}
      />
    </nav>
  );
};

export default Nav;
