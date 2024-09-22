import React from "react";
import SignList from "./SignList2";
import { useNavigate } from "react-router-dom";

import styles from "../styles/Page.module.css";
import Nav from "./Nav";

const Page2: React.FC = () => {
  const navigate = useNavigate();
  const handleHome = () => {
    navigate("/home");
  };
  return (
    <>
      <Nav />
      <div className={styles.homeContainer}>
        <header className={styles.homeHeader}>
          <h1>노래를 통해 수어 접하기</h1>
          <p>수어와 조금 더 친해져볼까요?</p>
        </header>
        <div className={styles.cardGrid}>
          <SignList />
        </div>
        <button onClick={handleHome} className={styles.back}>
          돌아가기
        </button>
      </div>
    </>
  );
};

export default Page2;
