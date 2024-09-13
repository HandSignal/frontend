import React from "react";
import SignList from "./SignList";
import { useNavigate } from "react-router-dom";

import styles from "../styles/Page.module.css";
import Nav from "./Nav";

const Page3: React.FC = () => {
  const navigate = useNavigate();
  const handleHome = () => {
    navigate("/home");
  };
  return (
    <>
      <Nav />
      <div className={styles.homeContainer}>
        <header className={styles.homeHeader}>
          <h1>인사하기 수어</h1>
          <p>아래의 수화를 통해 다양한 인사 표현을 배워보세요.</p>
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

export default Page3;
