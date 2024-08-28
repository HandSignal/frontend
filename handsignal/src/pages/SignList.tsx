import React from "react";
import styles from "../styles/SignList.module.css";

const signData = [
  { title: "안녕하세요", videoUrl: "https://example.com/video1.mp4" },
  { title: "안녕히 가세요", videoUrl: "https://example.com/video2.mp4" },
  { title: "안녕히 계세요", videoUrl: "https://example.com/video3.mp4" },
  { title: "감사합니다", videoUrl: "https://example.com/video4.mp4" },
];

const SignList: React.FC = () => {
  return (
    <div className={styles.signList}>
      {signData.map((sign, index) => (
        <div key={index} className={styles.signCard}>
          <h3>{sign.title}</h3>
          <video className={styles.signVideo} controls>
            <source src={sign.videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      ))}
    </div>
  );
};

export default SignList;
