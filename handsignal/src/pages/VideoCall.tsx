import React, { useEffect, useRef, useState } from "react";
import SimplePeer from "simple-peer";
import socket from "../utils/socket"; // socket.ts에서 가져오기
import "../styles/VideoCall.module.css"; // CSS 파일 가져오기
import Nav from "./Nav";
import styles from "../styles/VideoCall.module.css"; // CSS 모듈 가져오기

const VideoCall: React.FC = () => {
  const [me, setMe] = useState<string>("");
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [receivingCall, setReceivingCall] = useState(false);
  const [caller, setCaller] = useState("");
  const [callerSignal, setCallerSignal] = useState<any>(null);
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [idToCall, setIdToCall] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const myVideo = useRef<HTMLVideoElement>(null);
  const userVideo = useRef<HTMLVideoElement>(null);
  const connectionRef = useRef<SimplePeer.Instance | null>(null);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        setStream(stream);
        if (myVideo.current) {
          myVideo.current.srcObject = stream;
        }
      })
      .catch((error) => {
        console.error("Error accessing media devices.", error);
        setError(
          "Failed to access camera and microphone. Please check your permissions."
        );
      });

    socket.on("me", (id: string) => {
      setMe(id);
    });

    socket.on(
      "callUser",
      (data: { from: string; name: string; signal: any }) => {
        setReceivingCall(true);
        setCaller(data.from);
        setName(data.name);
        setCallerSignal(data.signal);
      }
    );

    return () => {
      socket.off("callUser");
      socket.off("me");
    };
  }, []);

  const callUser = (id: string) => {
    const peer = new SimplePeer({
      initiator: true,
      trickle: false,
      stream: stream!,
    });

    peer.on("signal", (data) => {
      socket.emit("callUser", {
        userToCall: id,
        signalData: data,
        from: me,
        name: name,
      });
    });

    peer.on("stream", (stream) => {
      if (userVideo.current) {
        userVideo.current.srcObject = stream;
      }
    });

    socket.on("callAccepted", (signal) => {
      setCallAccepted(true);
      peer.signal(signal);
    });

    connectionRef.current = peer;
  };

  const answerCall = () => {
    setCallAccepted(true);
    const peer = new SimplePeer({
      initiator: false,
      trickle: false,
      stream: stream!,
    });

    peer.on("signal", (data) => {
      socket.emit("answerCall", { signal: data, to: caller });
    });

    peer.on("stream", (stream) => {
      if (userVideo.current) {
        userVideo.current.srcObject = stream;
      }
    });

    peer.signal(callerSignal);
    connectionRef.current = peer;
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
  };

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

  return (
    <>
      <Nav />
      <div className={styles.container}>
        {error && <div className={styles.error}>{error}</div>}
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
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your Name"
            className={styles.inputField}
          />
          <input
            type="text"
            value={idToCall}
            onChange={(e) => setIdToCall(e.target.value)}
            placeholder="ID to Call"
            className={styles.inputField}
          />
          <div>
            {callAccepted && !callEnded ? (
              <>
                <button onClick={leaveCall} className={styles.button}>
                  Hang Up
                </button>
                <button onClick={toggleAudio} className={styles.button}>
                  Toggle Audio
                </button>
                <button onClick={toggleVideo} className={styles.button}>
                  Toggle Video
                </button>
              </>
            ) : (
              <button
                onClick={() => callUser(idToCall)}
                className={styles.button}
              >
                Call
              </button>
            )}
          </div>
        </div>
        {receivingCall && !callAccepted ? (
          <div>
            <h1 className={styles.callingText}>{name} is calling...</h1>
            <button onClick={answerCall} className={styles.button}>
              Answer
            </button>
          </div>
        ) : null}
        <p>Your ID: {me}</p>
      </div>
    </>
  );
};

export default VideoCall;
