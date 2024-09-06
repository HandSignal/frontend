import React, { useState, useEffect, useRef, useCallback } from "react";
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
import { Camera } from "@mediapipe/camera_utils";
import { drawCanvas } from "../utils/drawCanvas";
import axios from "axios";

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
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [recording, setRecording] = useState(false);
  const [recordedData, setRecordedData] = useState<FrameData>({
    pose_keypoints: [],
    left_hand_keypoints: [],
    right_hand_keypoints: [],
  });
  const [holistic, setHolistic] = useState<Holistic | null>(null);
  const [isRecordingIndicatorVisible, setIsRecordingIndicatorVisible] =
    useState(false);

  // Refs
  const socketRef = useRef<Socket>();
  const myVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection>();
  const streamRef = useRef<MediaStream | null>(null);
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cameraRef = useRef<Camera | null>(null);

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

  const onResults = useCallback(
    (results: Results) => {
      const canvasCtx = canvasRef.current?.getContext("2d");
      if (canvasCtx) {
        drawCanvas(canvasCtx, results);
      }

      const poseKeypoints: Keypoint[] =
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

      if (recording) {
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
      }
    },
    [recording]
  );

  const startRecording = () => {
    if (holistic) {
      holistic.onResults(onResults);
      setRecording(true);
      setIsRecordingIndicatorVisible(true);
    }
  };

  const stopRecording = () => {
    if (holistic) {
      holistic.onResults(() => {});
    }

    const blob = new Blob([JSON.stringify(recordedData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "recorded_data.json";
    a.click();
    URL.revokeObjectURL(url);

    setRecording(false);
    setIsRecordingIndicatorVisible(false);
  };

  const saveDataToServer = async () => {
    if (!recordedData.pose_keypoints.length) {
      alert("저장할 데이터가 없습니다.");
      return;
    }

    const formattedData = {
      pose_keypoints: recordedData.pose_keypoints,
      left_hand_keypoints: recordedData.left_hand_keypoints,
      right_hand_keypoints: recordedData.right_hand_keypoints,
    };

    const formData = new FormData();
    formData.append(
      "file",
      new Blob([JSON.stringify(formattedData, null, 2)], {
        type: "application/json",
      }),
      "recorded_data.json"
    );

    try {
      const response = await axios.post(
        "http://43.203.16.219:5000/files/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200) {
        alert("데이터가 성공적으로 저장되었습니다.");
      } else {
        alert("데이터 저장에 실패했습니다.");
      }
    } catch (error) {
      console.error("데이터 전송 중 오류 발생:", error);
      alert("데이터 저장 중 오류가 발생했습니다.");
    }
  };

  // Define WebRTC createOffer and createAnswer functions
  const createOffer = async () => {
    if (pcRef.current) {
      const offer = await pcRef.current.createOffer();
      await pcRef.current.setLocalDescription(offer);

      socketRef.current?.emit("offer", offer);
    }
  };

  const createAnswer = async (offer: RTCSessionDescriptionInit) => {
    if (pcRef.current) {
      await pcRef.current.setRemoteDescription(offer);
      const answer = await pcRef.current.createAnswer();
      await pcRef.current.setLocalDescription(answer);

      socketRef.current?.emit("answer", answer);
    }
  };

  useEffect(() => {
    getMedia();
  }, [getMedia]);

  useEffect(() => {
    socketRef.current = io("http://43.203.16.219:5000");
    pcRef.current = new RTCPeerConnection();

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

    socketRef.current.on("getCandidate", (candidate) => {
      if (pcRef.current) {
        pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });
  }, []);

  return (
    <div>
      <Nav />
      <div className={styles.container}>
        <div className={styles.videos}>
          <video ref={myVideoRef} autoPlay muted className={styles.video} />
          <video ref={remoteVideoRef} autoPlay className={styles.video} />
          <Webcam ref={webcamRef} className={styles.hiddenWebcam} />
          <canvas ref={canvasRef} className={styles.overlayCanvas} />
        </div>

        <div className={styles.controls}>
          <FontAwesomeIcon
            icon={audioEnabled ? faMicrophone : faMicrophoneSlash}
            className={styles.icon}
            onClick={() => toggleMedia("audio")}
          />
          <FontAwesomeIcon
            icon={videoEnabled ? faVideo : faVideoSlash}
            className={styles.icon}
            onClick={() => toggleMedia("video")}
          />
          <FontAwesomeIcon
            icon={faRecordVinyl}
            className={styles.icon}
            onClick={recording ? stopRecording : startRecording}
          />
          <FontAwesomeIcon
            icon={faPaperPlane}
            className={styles.icon}
            onClick={saveDataToServer}
          />
        </div>

        {isRecordingIndicatorVisible && (
          <div className={styles.recordingIndicator}>Recording...</div>
        )}
      </div>
    </div>
  );
};

export default VideoCall;
