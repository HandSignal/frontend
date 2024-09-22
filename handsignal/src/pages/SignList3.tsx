import React from "react";
import styles from "../styles/SignList.module.css";

const signData = [
  {
    title: "정말 괜찮아요",
    videoUrl: "https://www.youtube.com/shorts/JkY-F3Pxlio",
  },
  {
    title: "무슨 일이에요?",
    videoUrl: "https://www.youtube.com/shorts/1izr0VRcP2A",
  },
  {
    title: "이해해요",
    videoUrl: "https://www.youtube.com/shorts/G1qMJVF1htk",
  },
  {
    title: "어디가세요?",
    videoUrl: "https://www.youtube.com/shorts/0k0OJ-gIo18",
  },
  {
    title: "농담이에요",
    videoUrl: "https://www.youtube.com/shorts/qxLLOXbv6OA",
  },
  {
    title: "재미있어요",
    videoUrl: "https://www.youtube.com/shorts/bYjQNJCMhRI",
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
