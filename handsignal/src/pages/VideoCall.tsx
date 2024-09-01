import React, { useEffect, useRef, useState } from "react";
import SimplePeer from "simple-peer";
import { useLocation, useNavigate } from "react-router-dom"; // React Router DOM을 사용하여 페이지 이동
import "../styles/VideoCall.module.css"; // CSS 파일 가져오기
import styles from "../styles/VideoCall.module.css"; // CSS 모듈 가져오기
import Nav from "./Nav";

const VideoCall: React.FC = () => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [idToCall, setIdToCall] = useState("");

  const myVideo = useRef<HTMLVideoElement>(null);
  const userVideo = useRef<HTMLVideoElement>(null);
  const connectionRef = useRef<SimplePeer.Instance | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  // location.state가 null일 경우 기본값 설정
  const {
    name = "사용자",
    audioEnabled = true,
    videoEnabled = true,
  } = location.state || {};

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: videoEnabled, audio: audioEnabled })
      .then((stream) => {
        setStream(stream);
        if (myVideo.current) {
          myVideo.current.srcObject = stream;
        }
      })
      .catch((error) => {
        console.error("미디어 장치 접근 오류.", error);
        alert("카메라와 마이크에 접근할 수 없습니다. 권한을 확인해 주세요.");
      });

    // Cleanup on component unmount
    return () => {
      if (myVideo.current) {
        myVideo.current.srcObject = null;
      }
      if (userVideo.current) {
        userVideo.current.srcObject = null;
      }
    };
  }, [audioEnabled, videoEnabled]);

  const toggleAudio = () => {
    if (stream) {
      const audioTracks = stream.getAudioTracks();
      audioTracks.forEach((track) => (track.enabled = !track.enabled));
    }
  };

  const toggleVideo = () => {
    if (stream) {
      const videoTracks = stream.getVideoTracks();
      videoTracks.forEach((track) => (track.enabled = !track.enabled));
    }
  };

  const leaveCall = () => {
    setCallEnded(true);
    if (myVideo.current) {
      myVideo.current.srcObject = null;
    }
    if (userVideo.current) {
      userVideo.current.srcObject = null;
    }
    connectionRef.current?.destroy();
    navigate("/"); // 홈으로 이동
  };

  return (
    <>
      <Nav />
      <div className={styles.container}>
        <div className={styles.videoContainer}>
          {stream && (
            <video
              playsInline
              muted
              ref={myVideo}
              autoPlay
              className={styles.video}
            />
          )}
          {callAccepted && !callEnded ? (
            <video
              playsInline
              ref={userVideo}
              autoPlay
              className={styles.video}
            />
          ) : null}
        </div>
        <div className={styles.controls}>
          <input
            type="text"
            value={idToCall}
            onChange={(e) => setIdToCall(e.target.value)}
            placeholder="전화할 ID를 입력하세요"
            className={styles.inputField}
          />
          <div>
            {callAccepted && !callEnded ? (
              <>
                <button onClick={leaveCall} className={styles.button}>
                  통화 종료
                </button>
                <button onClick={toggleAudio} className={styles.button}>
                  마이크{" "}
                  {stream && stream.getAudioTracks()[0]?.enabled
                    ? "끄기"
                    : "켜기"}
                </button>
                <button onClick={toggleVideo} className={styles.button}>
                  카메라{" "}
                  {stream && stream.getVideoTracks()[0]?.enabled
                    ? "끄기"
                    : "켜기"}
                </button>
              </>
            ) : (
              <button
                onClick={() => console.log(`Call ${idToCall}`)} // Placeholder action
                className={styles.button}
              >
                전화 걸기
              </button>
            )}
          </div>
        </div>
        <p>사용자 이름: {name}</p>
      </div>
    </>
  );
};

export default VideoCall;
