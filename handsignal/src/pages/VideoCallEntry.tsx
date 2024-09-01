import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMicrophone,
  faMicrophoneSlash,
  faVideo,
  faVideoSlash,
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import styles from "../styles/VideoCallEntry.module.css";
import Nav from "./Nav";

const VideoCallEntry: React.FC = () => {
  const [name, setName] = useState("");
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [roomId, setRoomId] = useState("");
  const myVideo = useRef<HTMLVideoElement | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const getMediaStream = async () => {
      try {
        if (!videoEnabled && !audioEnabled) {
          return;
        }

        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: videoEnabled,
          audio: audioEnabled,
        });

        setStream(mediaStream);

        if (myVideo.current) {
          myVideo.current.srcObject = mediaStream;
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

  const handleCreateRoom = async () => {
    if (name.trim() === "") {
      alert("이름을 입력해 주세요.");
      return;
    }
    try {
      const response = await axios.post("/api/rooms");
      const newRoomId = response.data.roomId;
      navigate(
        `/video-calls/room/entry/${newRoomId}?name=${encodeURIComponent(name)}`
      );
    } catch (err) {
      console.error("방 생성 오류", err);
      setError("방 생성 오류가 발생했습니다.");
    }
  };

  const handleJoinRoom = async () => {
    if (name.trim() === "" || !roomId.trim()) {
      alert("이름과 방 ID를 입력해 주세요.");
      return;
    }
    try {
      await axios.post(`/api/rooms/${roomId}/join`, { name });
      navigate(
        `/video-calls/room/entry/${roomId}?name=${encodeURIComponent(name)}`
      );
    } catch (err) {
      console.error("방 입장 오류", err);
      setError("방 입장 오류가 발생했습니다.");
    }
  };

  return (
    <>
      <div className={styles.container}>
        <Nav />
        <div className={styles.controls}>
          <div className={styles.videoContainer}>
            <video
              ref={myVideo}
              autoPlay
              playsInline
              className={videoEnabled ? styles.video : styles.videoDisabled}
            />
          </div>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="사용자 이름을 입력하세요"
            className={styles.inputField}
          />
          <input
            type="text"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            placeholder="방 ID 입력 (기존 방 입장)"
            className={styles.inputField}
          />
          <div className={styles.iconControls}>
            <div
              onClick={() => setAudioEnabled(!audioEnabled)}
              className={styles.icon}
            >
              <FontAwesomeIcon
                icon={audioEnabled ? faMicrophone : faMicrophoneSlash}
                size="2x"
                color={audioEnabled ? "#4CAF50" : "#f44336"}
              />
              <span className={styles.iconText}>
                {audioEnabled ? "마이크 켜기" : "마이크 끄기"}
              </span>
            </div>
            <div
              onClick={() => setVideoEnabled(!videoEnabled)}
              className={styles.icon}
            >
              <FontAwesomeIcon
                icon={videoEnabled ? faVideo : faVideoSlash}
                size="2x"
                color={videoEnabled ? "#4CAF50" : "#f44336"}
              />
              <span className={styles.iconText}>
                {videoEnabled ? "카메라 켜기" : "카메라 끄기"}
              </span>
            </div>
          </div>
          <div className={styles.buttonContainer}>
            <button onClick={handleCreateRoom} className={styles.button}>
              방 생성
            </button>
            <button onClick={handleJoinRoom} className={styles.button}>
              방 입장
            </button>
          </div>
        </div>
        {error && <p className={styles.error}>{error}</p>}
      </div>
    </>
  );
};

export default VideoCallEntry;
