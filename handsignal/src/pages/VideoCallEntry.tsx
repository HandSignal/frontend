import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/VideoCallEntry.module.css"; // CSS 모듈 가져오기
import Nav from "./Nav";

const VideoCallEntry: React.FC = () => {
  const [name, setName] = useState(""); // 사용자 이름
  const [audioEnabled, setAudioEnabled] = useState(true); // 마이크 상태
  const [videoEnabled, setVideoEnabled] = useState(true); // 카메라 상태
  const navigate = useNavigate(); // 페이지 이동을 위한 훅

  const handleJoin = () => {
    if (name.trim() === "") {
      alert("이름을 입력해 주세요.");
      return;
    }
    navigate("/videocall", {
      state: { name, audioEnabled, videoEnabled },
    }); // 화상통화 방으로 이동
  };

  return (
    <>
      <Nav />
      <div className={styles.container}>
        <h1 className={styles.title}>입장 방</h1>
        <div className={styles.controls}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="사용자 이름을 입력하세요"
            className={styles.inputField}
          />
          <div>
            <label>
              <input
                type="checkbox"
                checked={audioEnabled}
                onChange={() => setAudioEnabled(!audioEnabled)}
              />
              마이크 {audioEnabled ? "켜기" : "끄기"}
            </label>
            <label>
              <input
                type="checkbox"
                checked={videoEnabled}
                onChange={() => setVideoEnabled(!videoEnabled)}
              />
              카메라 {videoEnabled ? "켜기" : "끄기"}
            </label>
          </div>
          <button onClick={handleJoin} className={styles.button}>
            입장
          </button>
        </div>
      </div>
    </>
  );
};

export default VideoCallEntry;
