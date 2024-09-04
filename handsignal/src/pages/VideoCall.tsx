import React, { useEffect, useRef, useState } from "react";
import SimplePeer from "simple-peer";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "../styles/VideoCall.module.css";
import Nav from "./Nav";

const VideoCall: React.FC = () => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [idToCall, setIdToCall] = useState("");
  const [peer, setPeer] = useState<SimplePeer.Instance | null>(null);

  const myVideo = useRef<HTMLVideoElement>(null);
  const userVideo = useRef<HTMLVideoElement>(null);
  const connectionRef = useRef<SimplePeer.Instance | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

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

    return () => {
      if (myVideo.current) {
        myVideo.current.srcObject = null;
      }
      if (userVideo.current) {
        userVideo.current.srcObject = null;
      }
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, [audioEnabled, videoEnabled]);

  const callUser = (id: string) => {
    const peer = new SimplePeer({
      initiator: true,
      trickle: false,
      stream: stream!,
    });

    peer.on("signal", (data) => {
      console.log("SIGNAL", data);
    });

    peer.on("stream", (userStream) => {
      if (userVideo.current) {
        userVideo.current.srcObject = userStream;
      }
    });

    peer.on("close", () => {
      setCallEnded(true);
    });

    connectionRef.current = peer;
    setPeer(peer);
  };

  const answerCall = (signalData: SimplePeer.SignalData) => {
    const peer = new SimplePeer({
      initiator: false,
      trickle: false,
      stream: stream!,
    });

    peer.on("signal", (data) => {
      // 여기서 신호를 다시 발신자에게 전송
      console.log("ANSWER SIGNAL", data);
    });

    peer.on("stream", (userStream) => {
      if (userVideo.current) {
        userVideo.current.srcObject = userStream;
      }
    });

    peer.signal(signalData);
    connectionRef.current = peer;
    setCallAccepted(true);
    setPeer(peer);
  };

  const leaveCall = () => {
    setCallEnded(true);
    connectionRef.current?.destroy();
    navigate("/");
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
          {callAccepted && !callEnded && (
            <video
              playsInline
              ref={userVideo}
              autoPlay
              className={styles.video}
            />
          )}
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
              </>
            ) : (
              <button
                onClick={() => callUser(idToCall)}
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
