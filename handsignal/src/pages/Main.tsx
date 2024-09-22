import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import header_logo from "../assets/Single_HandSignal2.png";
import styles from "../styles/Main.module.css";
import Nav from "./Nav";

const cardData = [
  { title: "일상생활 속 수어", description: "수어를 처음 접한다면?" },
  {
    title: "노래를 통해 수어 접하기",
    description: "수어와 조금 더 친해져볼까요?",
  },
  { title: "기본회화", description: "조금 더 원활한 대화를 위한 수어!" },
  {
    title: "국립국어원 수어사전",
    description: "더 많은 수어 단어를 찾아보세요!",
  },
];

const Main: React.FC = () => {
  const navigate = useNavigate();

  const handleCardClick = (index: number) => {
    if (index === 3) {
      window.location.href = "https://sldict.korean.go.kr/front/main/main.do#";
    } else {
      navigate(`/page${index + 1}`);
    }
  };

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
        {cardData.map((card, index) => (
          <motion.div
            key={index}
            className={styles.card}
            onClick={() => handleCardClick(index)}
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
            aria-label={`카드 ${index + 1}`}
          >
            <h3>{card.title}</h3>
            <p>{card.description}</p>
          </motion.div>
        ))}
      </motion.main>
    </motion.div>
  );
};

export default Main;
