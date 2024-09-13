import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMicrophone,
  faMicrophoneSlash,
  faVideo,
  faVideoSlash,
  faRecordVinyl,
  faPaperPlane,
} from "@fortawesome/free-solid-svg-icons";
import styles from "../styles/VideoCall.module.css";
import { io, Socket } from "socket.io-client";
import Nav from "./Nav";
import Webcam from "react-webcam";
import { Holistic, Results } from "@mediapipe/holistic";

// Keypoint and FrameData interfaces
interface Keypoint {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

interface FrameData {
  pose_keypoints: Keypoint[][];
  left_hand_keypoints: Keypoint[][];
  right_hand_keypoints: Keypoint[][];
}

const VideoCall = () => {
  // States
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [recording, setRecording] = useState(false);
  const [translateEnabled, setTranslateEnabled] = useState(false);
  const [translationResult, setTranslationResult] = useState("");
  const [userName, setUserName] = useState("User");
  const [roomId, setRoomId] = useState<string>("");
  const [recordedData, setRecordedData] = useState<FrameData>({
    pose_keypoints: [],
    left_hand_keypoints: [],
    right_hand_keypoints: [],
  });

  // Refs
  const socketRef = useRef<Socket>();
  const myVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection>();
  const streamRef = useRef<MediaStream | null>(null);
  const holisticRef = useRef<Holistic | null>(null);
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Media Handlers
  const toggleMedia = (type: "audio" | "video") => {
    if (type === "audio") {
      setAudioEnabled((prev) => !prev);
    } else {
      setVideoEnabled((prev) => !prev);
    }
  };

  const getMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: videoEnabled,
        audio: audioEnabled,
      });

      streamRef.current = stream;
      if (myVideoRef.current) myVideoRef.current.srcObject = stream;

      if (pcRef.current && socketRef.current) {
        stream.getTracks().forEach((track) => {
          pcRef.current?.addTrack(track, stream);
        });

        pcRef.current.onicecandidate = (e) => {
          if (e.candidate) {
            socketRef.current?.emit("candidate", e.candidate);
          }
        };

        pcRef.current.ontrack = (e) => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = e.streams[0];
          }
        };
      }
    } catch (e) {
      console.error(e);
    }
  };

  const updateMediaTracks = () => {
    if (streamRef.current) {
      const audioTracks = streamRef.current.getAudioTracks();
      const videoTracks = streamRef.current.getVideoTracks();

      // Enable/disable audio tracks
      audioTracks.forEach((track) => (track.enabled = audioEnabled));

      // Enable/disable video tracks
      videoTracks.forEach((track) => {
        track.enabled = videoEnabled;
        if (!videoEnabled) {
          track.stop(); // Stop the track if video is disabled
        }
      });
    }
  };

  const startRecording = () => {
    setRecordedData({
      pose_keypoints: [],
      left_hand_keypoints: [],
      right_hand_keypoints: [],
    });

    const holistic = holisticRef.current;
    if (holistic) {
      holistic.onResults((results: Results) => {
        console.log("Results received:", results); // Debug log

        const poseKeypoints =
          results.poseLandmarks?.map((point) => ({
            x: point.x,
            y: point.y,
            z: point.z,
            visibility: point.visibility ?? 0,
          })) || [];

        const leftHandKeypoints =
          results.leftHandLandmarks?.map((point) => ({
            x: point.x,
            y: point.y,
            z: point.z,
          })) || [];

        const rightHandKeypoints =
          results.rightHandLandmarks?.map((point) => ({
            x: point.x,
            y: point.y,
            z: point.z,
          })) || [];

        setRecordedData((prevData) => ({
          pose_keypoints: [...prevData.pose_keypoints, poseKeypoints],
          left_hand_keypoints: [
            ...prevData.left_hand_keypoints,
            leftHandKeypoints,
          ],
          right_hand_keypoints: [
            ...prevData.right_hand_keypoints,
            rightHandKeypoints,
          ],
        }));
      });
    } else {
      console.error("Holistic instance is not initialized");
    }
    setRecording(true);
  };

  const stopRecording = () => {
    if (holisticRef.current) {
      holisticRef.current.onResults(() => {}); // Stop receiving results
    }

    // Save data to a JSON file
    downloadJSONFile(recordedData);

    setRecording(false);
  };

  // Function to download JSON file
  const downloadJSONFile = (data: FrameData) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "recorded_data.json";
    a.click();
    URL.revokeObjectURL(url); // Clean up the URL object
  };

  // Translation Handlers
  const handleTranslate = () => {
    setTranslateEnabled(true);
    setTranslationResult("번역 결과가 여기에 표시됩니다.");
  };

  const handleSendTranslation = () => {
    console.log("Sending translation:", translationResult);
  };

  // Socket and PeerConnection setup
  useEffect(() => {
    socketRef.current = io("localhost:8080");

    pcRef.current = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    socketRef.current.on("all_users", (allUsers) => {
      if (allUsers.length > 0) {
        createOffer();
      }
    });

    socketRef.current.on("getOffer", (sdp) => createAnswer(sdp));
    socketRef.current.on("getAnswer", (sdp) => {
      if (pcRef.current) {
        pcRef.current.setRemoteDescription(sdp);
      }
    });
    socketRef.current.on("getCandidate", async (candidate) => {
      if (pcRef.current) {
        await pcRef.current.addIceCandidate(candidate);
      }
    });

    getMedia();

    return () => {
      socketRef.current?.disconnect();
      pcRef.current?.close();
    };
  }, []);

  const createOffer = async () => {
    if (pcRef.current && socketRef.current) {
      try {
        const sdp = await pcRef.current.createOffer();
        await pcRef.current.setLocalDescription(sdp);
        socketRef.current.emit("offer", sdp);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const createAnswer = async (sdp: RTCSessionDescription) => {
    if (pcRef.current && socketRef.current) {
      try {
        await pcRef.current.setRemoteDescription(sdp);
        const answerSdp = await pcRef.current.createAnswer();
        await pcRef.current.setLocalDescription(answerSdp);
        socketRef.current.emit("answer", answerSdp);
      } catch (e) {
        console.error(e);
      }
    }
  };

  // Update media tracks when audio/video states change
  useEffect(() => {
    if (streamRef.current) {
      updateMediaTracks();
    } else {
      getMedia();
    }
  }, [audioEnabled, videoEnabled]);

  // Holistic initialization
  useEffect(() => {
    if (webcamRef.current && !holisticRef.current) {
      const holistic = new Holistic({
        locateFile: (file) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`,
      });

      holistic.setOptions({
        modelComplexity: 0,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      holisticRef.current = holistic;

      holisticRef.current.onResults((results: Results) => {
        // Optional: Process results if needed
      });
    }

    return () => {
      if (holisticRef.current) {
        holisticRef.current = null; // Cleanup on unmount
      }
    };
  }, [webcamRef.current]);

  return (
    <div className={styles.container}>
      <Nav />
      <div className={styles.videoContainer}>
        <div className={styles.videoWrapper}>
          <Webcam
            ref={webcamRef}
            audio={false}
            videoConstraints={{ facingMode: "user" }}
            className={videoEnabled ? styles.video : styles.videoDisabled}
          />
          <canvas
            ref={canvasRef}
            className={styles.canvas}
            width={640}
            height={480}
          />
          <div className={styles.nameTag}>{userName}</div>
        </div>
        <div className={styles.videoWrapper}>
          <video ref={remoteVideoRef} className={styles.video} autoPlay />
          <div className={styles.nameTag}>Remote User</div>
        </div>
      </div>
      <div className={styles.controls}>
        <div className={styles.iconControls}>
          <div onClick={() => toggleMedia("audio")} className={styles.icon}>
            <FontAwesomeIcon 
              icon={audioEnabled ? faMicrophone : faMicrophoneSlash}
              size="2x"
              color={audioEnabled ? "#4CAF50" : "#f44336"}
            />
            <span className={styles.iconText}>
              {audioEnabled ? "마이크 켜기" : "마이크 끄기"}
            </span>
          </div>
          <div onClick={() => toggleMedia("video")} className={styles.icon}>
            <FontAwesomeIcon
              icon={videoEnabled ? faVideo : faVideoSlash}
              size="2x"
              color={videoEnabled ? "#4CAF50" : "#f44336"}
            />
            <span className={styles.iconText}>
              {videoEnabled ? "카메라 켜기" : "카메라 끄기"}
            </span>
          </div>
          <div
            onClick={() => (recording ? stopRecording() : startRecording())}
            className={styles.icon}
          >
            <FontAwesomeIcon
              icon={faRecordVinyl}
              size="2x"
              color={recording ? "#f44336" : "#4CAF50"}
            />
            <span className={styles.iconText}>
              {recording ? "녹화 중지" : "녹화 시작"}
            </span>
          </div>
        </div>
        <div className={styles.controls}>
          <button onClick={handleTranslate} className={styles.button}>
            번역하기
          </button>
          {translateEnabled && (
            <div className={styles.translateContainer}>
              <textarea
                className={styles.inputField}
                value={translationResult}
                onChange={(e) => setTranslationResult(e.target.value)}
                placeholder="번역 결과를 입력하세요"
              />
              <button onClick={handleSendTranslation} className={styles.button}>
                <FontAwesomeIcon icon={faPaperPlane} /> 번역 결과 전송
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoCall;
