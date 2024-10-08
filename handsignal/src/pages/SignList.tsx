import React from "react";
import styles from "../styles/SignList.module.css";

const signData = [
  {
    title: "안녕하세요",
    videoUrl: "https://www.youtube.com/shorts/pLxvxWVDM4I",
  },
  {
    title: "새해 복 많이 받으세요",
    videoUrl: "https://www.youtube.com/shorts/LW2atE74vh4",
  },
  {
    title: "맛있게 드세요!",
    videoUrl: "https://www.youtube.com/shorts/QLxkrMbxWMo",
  },
  {
    title: "잘 부탁드립니다",
    videoUrl: "https://www.youtube.com/shorts/cquUC-P1QGw",
  },
  {
    title: "만나서 반갑습니다",
    videoUrl: "https://www.youtube.com/shorts/dEIVBu6DxCg",
  },
  {
    title: "감사합니다",
    videoUrl: "https://www.youtube.com/shorts/G3csBbw_j60",
  },
];

const SignList: React.FC = () => {
  return (
    <div className={styles.signList}>
      {signData.map((sign, index) => (
        <div key={index} className={styles.signCard}>
          <h3>{sign.title}</h3>
          {sign.videoUrl.includes("youtube.com") ||
          sign.videoUrl.includes("youtu.be") ? (
            <iframe
              className={styles.signVideo}
              width="100%"
              height="315"
              src={sign.videoUrl
                .replace("/shorts/", "/embed/")
                .replace("watch?v=", "embed/")}
              title={sign.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          ) : (
            <video className={styles.signVideo} controls>
              <source src={sign.videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          )}
        </div>
      ))}
    </div>
  );
};

export default SignList;
