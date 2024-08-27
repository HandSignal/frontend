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
          <h1>위급 상황에서 사용할 수 있는 수화</h1>
          <p>아래의 수화를 통해 위급 상황에서 필요한 표현을 배워보세요.</p>
        </header>
        <div className={styles.cardGrid}>
          <SignList />
        </div>
      </div>
    </>
  );
};

export default Page1;
