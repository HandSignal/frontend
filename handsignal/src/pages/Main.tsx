import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import header_logo from "../assets/Single_HandSignal2.png";
import styles from "../styles/Main.module.css";
import Nav from "./Nav";

const Main: React.FC = () => {
  const navigate = useNavigate();

  return (
    <motion.div
      className={styles.homeContainer}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ duration: 2 }}
    >
      <Nav />

      <header className={styles.homeHeader}>
        <motion.img
          src={header_logo}
          alt="Header Logo"
          className={styles.headerLogo}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 2 }}
        />
        <motion.h2
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 1 }}
        >
          소통의 한계를 넘어 우리 이제 편하게 대화해요!
        </motion.h2>
        <motion.h4
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 2 }}
        >
          카메라를 키고 수어를 입력해주세요! 수어를 텍스트로 번역해드립니다.
        </motion.h4>
      </header>
      <motion.main
        className={styles.cardGrid}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {Array.from({ length: 8 }, (_, index) => (
          <motion.div
            key={index}
            className={styles.card}
            onClick={() => navigate(`/page${(index % 4) + 1}`)}
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
            aria-label={`카드 ${(index % 4) + 1}`}
          >
            <h3>카드 {(index % 4) + 1}</h3>
            <p>카드 {(index % 4) + 1}의 설명</p>
          </motion.div>
        ))}
      </motion.main>
    </motion.div>
  );
};

export default Main;
