import React from "react";
import SignList from "./SignList";
import styles from "../styles/Page.module.css";
import header_logo from "../assets/Single_HandSignal2.png";
import Nav from "./Nav";

const Page1: React.FC = () => {
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
      </div>
    </>
  );
};

export default Page1;
