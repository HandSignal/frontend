// src/components/Nav.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import top_logo from "../assets/Single_HandSignal.png";
import styles from "../styles/Nav.module.css";
import Modal from "./LogoutModal";

const Nav: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

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
          className={styles.navButton}
        >
          수화 번역기
        </button>
        <button
          onClick={() => navigate("/section2")}
          className={styles.navButton}
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
