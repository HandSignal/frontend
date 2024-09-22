import React from "react";
import SignList from "./SignList3";
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
          <h1>좀 더 원활한 대화를 원한다면?</h1>
          <p>수어를 통해 더 풍성한 대화를 나눠보세요!</p>
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
