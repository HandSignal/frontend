import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import "../styles/Entry.css";
import Logo from "../assets/HS_Logo.png";
import styles from "../styles/Main.module.css";

const Entry: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [animationFinished, setAnimationFinished] = useState(false);
  const navigate = useNavigate();

  const handleHome = () => {
    navigate("/home");
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
          <header className={styles.homeHeader}>
            <motion.h2
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 1 }}
            >
              소통의 한계를 넘어 <br />
              우리 이제 편하게 대화해요!
            </motion.h2>
            <motion.h4
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 2 }}
            >
              카메라를 키고 수어를 입력해주세요! <br />
              수어를 텍스트로 번역해드립니다.
            </motion.h4>
          </header>
          <button onClick={handleHome} type="submit" className="right-button">
            시작하기
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Entry;
