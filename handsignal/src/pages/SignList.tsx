import React from "react";
import SignItem from "./SignItem";
import styles from "../styles/SignList.module.css"; // CSS 모듈로 임포트

const signData = [
  {
    name: "도움",
    videoUrl: "path/to/help.mp4",
    description: "이 수화는 '도움'을 의미합니다.",
  },
  {
    name: "응급상황",
    videoUrl: "path/to/emergency.mp4",
    description: "이 수화는 '응급상황'을 의미합니다.",
  },
  // 나머지 수화 데이터
];

const SignList: React.FC = () => {
  return (
    <div className={styles.signList}>
      {signData.map((sign) => (
        <SignItem
          key={sign.name}
          name={sign.name}
          videoUrl={sign.videoUrl}
          description={sign.description}
        />
      ))}
    </div>
  );
};

export default SignList;
