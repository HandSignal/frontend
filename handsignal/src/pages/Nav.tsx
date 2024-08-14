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
        <img
          src={top_logo}
          alt="Navigation Toggle"
          className={styles.navToggleImage}
        />
      </label>
      <div className={styles.navMenu}>
        <img
          className={styles.navLogo}
          src={top_logo}
          onClick={handleClick}
          style={{ cursor: "pointer" }}
        />
        <button
          onClick={() => navigate("/section1")}
          className={styles.navButton}
        >
          section1
        </button>
        <button
          onClick={() => navigate("/section2")}
          className={styles.navButton}
        >
          section2
        </button>
        <button
          onClick={() => navigate("/section3")}
          className={styles.navButton}
        >
          section3
        </button>
        <button
          onClick={() => navigate("/section4")}
          className={styles.navButton}
        >
          section4
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
