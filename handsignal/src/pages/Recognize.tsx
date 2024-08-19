import { useCallback, useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import { Camera } from "@mediapipe/camera_utils";
import { Holistic, Results } from "@mediapipe/holistic";
import { drawCanvas } from "../utils/drawCanvas";
import "../styles/Recognize.css";
import Nav from "./Nav";

// 타입 정의
interface Keypoint {
  x: number;
  y: number;
  z: number;
  visibility: number;
}

interface FrameData {
  pose_keypoints: Keypoint[][];
  left_hand_keypoints: Keypoint[][];
  right_hand_keypoints: Keypoint[][];
}

const Recognize = () => {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cameraRef = useRef<Camera | null>(null);

  const [holistic, setHolistic] = useState<Holistic | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedData, setRecordedData] = useState<FrameData>({
    pose_keypoints: [],
    left_hand_keypoints: [],
    right_hand_keypoints: [],
  });
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(
    null
  );
  const [isCameraOn, setIsCameraOn] = useState(false);

  // 카운트다운 및 녹화 상태 관련 상태 변수
  const [countdown, setCountdown] = useState<number>(0);
  const [isCountdownActive, setIsCountdownActive] = useState<boolean>(false);
  const [isRecordingIndicatorVisible, setIsRecordingIndicatorVisible] =
    useState<boolean>(false);

  // 카메라 권한 요청 및 상태 관리
  useEffect(() => {
    const requestCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        if (stream) {
          setCameraPermission(true);
          stream.getTracks().forEach((track) => track.stop()); // 테스트 후 스트림 중지
        } else {
          setCameraPermission(false);
        }
      } catch (error) {
        console.error("Camera permission error:", error);
        setCameraPermission(false);
      }
    };

    requestCameraPermission();
  }, []);

  // Mediapipe Holistic 객체 초기화
  useEffect(() => {
    if (cameraPermission === true && holistic === null) {
      const newHolistic = new Holistic({
        locateFile: (file) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`,
      });

      newHolistic.setOptions({
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      setHolistic(newHolistic);

      return () => {
        if (holistic) {
          (holistic as Holistic).close();
          setHolistic(null);
        }
      };
    }
  }, [cameraPermission, holistic]);

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
          visibility: point.visibility ?? 0, // Handle undefined with default value
        })) || [];

      const leftHandKeypoints: Keypoint[] =
        results.leftHandLandmarks?.map((point) => ({
          x: point.x,
          y: point.y,
          z: point.z,
          visibility: point.visibility ?? 0, // Handle undefined with default value
        })) || [];

      const rightHandKeypoints: Keypoint[] =
        results.rightHandLandmarks?.map((point) => ({
          x: point.x,
          y: point.y,
          z: point.z,
          visibility: point.visibility ?? 0, // Handle undefined with default value
        })) || [];

      if (isRecording) {
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
    [isRecording]
  );

  // 웹캠 및 Mediapipe Holistic 모델과 Camera 객체 연동
  useEffect(() => {
    if (cameraPermission === true && holistic && webcamRef.current) {
      const video = webcamRef.current.video;
      if (video) {
        const camera = new Camera(video, {
          onFrame: async () => {
            try {
              if (holistic) {
                await holistic.send({ image: video });
              }
            } catch (error) {
              console.error("Error sending image to holistic:", error);
            }
          },
          width: 1280,
          height: 720,
        });

        cameraRef.current = camera;

        if (isCameraOn) {
          camera.start();
        } else {
          camera.stop();
        }

        holistic.onResults(onResults);

        return () => {
          camera.stop();
          cameraRef.current = null;
        };
      }
    }
  }, [holistic, onResults, cameraPermission, isCameraOn]);

  // 녹화 시작/중지 토글 함수
  const toggleRecording = () => {
    if (!isCameraOn) {
      alert("카메라가 꺼져 있습니다. 녹화를 시작하기 전에 카메라를 켜주세요.");
      return;
    }

    if (isCountdownActive) {
      // 카운트다운이 진행 중일 때 녹화 중지 버튼을 누르면 카운트다운을 중지하고 녹화도 중지합니다.
      setIsCountdownActive(false);
      setCountdown(0);
      setIsRecording(false);
      setIsRecordingIndicatorVisible(false);
      return;
    }

    if (isRecording) {
      // 이미 녹화 중인 경우 녹화 중지
      setIsRecording(false);
      setIsRecordingIndicatorVisible(false);
    } else {
      // 녹화를 시작하는 경우
      setIsCountdownActive(true);
      setCountdown(3);
      setIsRecordingIndicatorVisible(true);

      const countdownInterval = setInterval(() => {
        setCountdown((prevCountdown) => {
          if (prevCountdown === 1) {
            clearInterval(countdownInterval);
            setIsRecording(true);
            setIsRecordingIndicatorVisible(false);
            setRecordedData({
              pose_keypoints: [],
              left_hand_keypoints: [],
              right_hand_keypoints: [],
            });
            setIsCountdownActive(false);
          }
          return prevCountdown - 1;
        });
      }, 1000);
    }
  };

  // 카메라 기능 토글 함수
  const toggleCamera = () => {
    setIsCameraOn((prev) => {
      const newStatus = !prev;
      if (newStatus && webcamRef.current) {
        const video = webcamRef.current.video;
        if (video) {
          const camera = new Camera(video, {
            onFrame: async () => {
              try {
                if (holistic) {
                  await holistic.send({ image: video });
                }
              } catch (error) {
                console.error("Error sending image to holistic:", error);
              }
            },
            width: 1280,
            height: 720,
          });
          cameraRef.current = camera;
          camera.start();
          setHolistic((prevHolistic) => {
            if (prevHolistic) {
              prevHolistic.onResults(onResults);
            }
            return prevHolistic;
          });
        }
      } else if (cameraRef.current) {
        cameraRef.current.stop();
        cameraRef.current = null;
      }
      return newStatus;
    });
  };

  const saveDataToJson = () => {
    const formattedData = {
      pose_keypoint: recordedData.pose_keypoints,
      left_hand_keypoint: recordedData.left_hand_keypoints,
      right_hand_keypoint: recordedData.right_hand_keypoints,
    };

    const jsonData = JSON.stringify(formattedData, null, 2);
    const blob = new Blob([jsonData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "recorded_data.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <Nav />
      <div className="container">
        <Webcam
          audio={false}
          style={{ visibility: "hidden" }}
          width={1280}
          height={700}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          videoConstraints={{ facingMode: "user" }}
        />
        <div className="buttonContainer">
          <button
            className="button"
            onClick={toggleCamera}
            disabled={cameraPermission === null}
          >
            {isCameraOn ? "카메라 끄기" : "카메라 켜기"}
          </button>
          <button
            className="button"
            onClick={toggleRecording}
            disabled={isCountdownActive}
          >
            {isRecording ? "녹화 중지" : "녹화 시작"}
          </button>
          <button
            className="button"
            onClick={saveDataToJson}
            disabled={!recordedData.pose_keypoints.length}
          >
            데이터 저장
          </button>
        </div>
        <canvas ref={canvasRef} className="canvas" width={1280} height={720} />
        {isCountdownActive && <div className="countdown">{countdown}</div>}
        {isRecordingIndicatorVisible && (
          <div className="recording-indicator">녹화 중</div>
        )}
      </div>
    </>
  );
};

export default Recognize;
