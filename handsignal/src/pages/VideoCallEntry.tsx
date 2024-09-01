import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/VideoCallEntry.module.css"; // CSS 모듈 가져오기
import Nav from "./Nav";

const VideoCallEntry: React.FC = () => {
  const [name, setName] = useState(""); // 사용자 이름
  const [audioEnabled, setAudioEnabled] = useState(true); // 마이크 상태
  const [videoEnabled, setVideoEnabled] = useState(true); // 카메라 상태
  const [stream, setStream] = useState<MediaStream | null>(null); // 미디어 스트림
  const [error, setError] = useState<string | null>(null); // 오류 상태
  const myVideo = useRef<HTMLVideoElement | null>(null); // 비디오 요소 참조
  const navigate = useNavigate(); // 페이지 이동을 위한 훅

  useEffect(() => {
    const getMediaStream = async () => {
      try {
        if (audioEnabled || videoEnabled) {
          const mediaStream = await navigator.mediaDevices.getUserMedia({
            video: videoEnabled,
            audio: audioEnabled,
          });
          setStream(mediaStream);
          if (myVideo.current) {
            myVideo.current.srcObject = mediaStream;
          }
        }
      } catch (err) {
        console.error("미디어 장치 접근 오류.", err);
        if (err instanceof Error) {
          if (err.message.includes("Permission denied")) {
            setError(
              "카메라와 마이크에 접근할 수 없습니다. 권한을 확인해 주세요."
            );
          } else if (err.message.includes("Not Found")) {
            setError("카메라 또는 마이크 장치가 감지되지 않습니다.");
          } else {
            setError("미디어 장치 접근 오류가 발생했습니다.");
          }
        }
      }
    };

    getMediaStream();

    // Cleanup on component unmount
    return () => {
      if (myVideo.current) {
        myVideo.current.srcObject = null;
      }
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, [audioEnabled, videoEnabled]);

  useEffect(() => {
    if (stream) {
      const videoTracks = stream.getVideoTracks();
      videoTracks.forEach((track) => (track.enabled = videoEnabled));
    }
  }, [videoEnabled, stream]);

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
          <div className={styles.videoContainer}>
            <video
              ref={myVideo}
              autoPlay
              playsInline
              className={`${styles.video} ${
                !videoEnabled ? styles.videoDisabled : ""
              }`}
            />
          </div>
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

        {error && <p className={styles.error}>{error}</p>}
      </div>
    </>
  );
};

export default VideoCallEntry;
