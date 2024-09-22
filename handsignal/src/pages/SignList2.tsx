import React from "react";
import styles from "../styles/SignList.module.css";

const signData = [
  {
    title: "흰수염고래 - 정은지",
    videoUrl: "https://www.youtube.com/watch?v=_U0qJCp0CAw",
  },
  {
    title: "세글자송 - 스톤뮤직",
    videoUrl: "https://www.youtube.com/watch?v=TzUxZe3E4tA",
  },
  {
    title: "오래된 노래 - 유손생",
    videoUrl: "https://www.youtube.com/watch?v=8uCbc7idGf0",
  },
  {
    title: "신호등 - 말뚝이의 영재교실",
    videoUrl: "https://www.youtube.com/watch?v=Tn32s1lNZ7I",
  },
  {
    title: "질투 - 반짝이는워터멜론",
    videoUrl: "https://www.youtube.com/watch?v=cZXm7vmTL0o",
  },
  {
    title: "누가 죄인인가 - Handspeak Korea",
    videoUrl: "https://www.youtube.com/watch?v=AX4daVKMhBw",
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
