import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import top_logo from "../assets/Single_HandSignal.png";
import styles from "../styles/Nav.module.css";

const Nav: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    const confirmed = window.confirm("정말 로그아웃 하시겠습니까?");
    if (confirmed) {
      navigate("/");
    }
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
          onClick={() => navigate("/mypage")}
          className={styles.navButton}
        >
          마이페이지
        </button>
        <button
          onClick={handleLogout}
          className={`${styles.navButton} ${styles.logoutButton}`}
        >
          로그아웃
        </button>
      </div>
    </nav>
  );
};

export default Nav;
