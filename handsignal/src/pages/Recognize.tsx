import { useCallback, useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import { Camera } from "@mediapipe/camera_utils";
import { Holistic, Results } from "@mediapipe/holistic";
import { drawCanvas } from "../utils/drawCanvas";
import "../styles/Recognize.css";
import Nav from "./Nav";

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

  const [countdown, setCountdown] = useState<number>(0);
  const [isCountdownActive, setIsCountdownActive] = useState<boolean>(false);
  const [isRecordingIndicatorVisible, setIsRecordingIndicatorVisible] =
    useState<boolean>(false);

  // 카메라 권한 요청 함수
  useEffect(() => {
    const requestCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        if (stream) {
          setCameraPermission(true);
          stream.getTracks().forEach((track) => track.stop());
        } else {
          setCameraPermission(false);
        }
      } catch (error) {
        console.error("카메라 권한 요청 오류:", error);
        setCameraPermission(false);
      }
    };

    requestCameraPermission();
  }, []);

  // Holistic 인스턴스 초기화 및 정리
  useEffect(() => {
    if (cameraPermission === true && holistic === null) {
      const newHolistic = new Holistic({
        locateFile: (file) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`,
      });

      newHolistic.setOptions({
        modelComplexity: 0,
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

  // Holistic 결과 처리 함수
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

  // 카메라 및 Holistic 인스턴스 설정
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
              console.error("Holistic에 이미지 전송 오류:", error);
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

  // 녹화 시작/중지 및 카운트다운 처리
  const toggleRecording = () => {
    if (!isCameraOn) {
      alert("카메라가 꺼져 있습니다. 녹화를 시작하기 전에 카메라를 켜주세요.");
      return;
    }

    if (isCountdownActive) {
      setIsCountdownActive(false);
      setCountdown(0);
      setIsRecording(false);
      setIsRecordingIndicatorVisible(false);
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      setIsRecordingIndicatorVisible(false);
    } else {
      setIsCountdownActive(true);
      setCountdown(3);
      setIsRecordingIndicatorVisible(false); // 카운트다운 중에는 표시하지 않음

      const countdownInterval = setInterval(() => {
        setCountdown((prevCountdown) => {
          if (prevCountdown === 1) {
            clearInterval(countdownInterval);
            setIsRecording(true);
            setIsRecordingIndicatorVisible(true); // 카운트다운 종료 후 녹화 시작
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

  // 카메라 켜기/끄기 처리
  const toggleCamera = () => {
    setIsCameraOn((prev) => {
      const newStatus = !prev;

      if (newStatus && webcamRef.current) {
        const video = webcamRef.current.video;
        if (video) {
          if (!cameraRef.current) {
            const camera = new Camera(video, {
              onFrame: async () => {
                try {
                  if (holistic) {
                    await holistic.send({ image: video });
                  }
                } catch (error) {
                  console.error("Holistic에 이미지 전송 오류:", error);
                }
              },
              width: 1920,
              height: 1080,
            });
            cameraRef.current = camera;
            camera.start();
          } else {
            cameraRef.current.start();
          }
        }
      } else if (cameraRef.current) {
        cameraRef.current.stop();
      }

      return newStatus;
    });
  };

  // 녹화된 데이터 다운로드 처리
  const downloadData = () => {
    if (!recordedData.pose_keypoints.length) {
      alert("저장할 데이터가 없습니다.");
      return;
    }

    const formattedData = {
      pose_keypoint: recordedData.pose_keypoints,
      left_hand_keypoint: recordedData.left_hand_keypoints,
      right_hand_keypoint: recordedData.right_hand_keypoints,
    };

    const blob = new Blob([JSON.stringify(formattedData, null, 2)], {
      type: "application/json",
    });

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
        <div className="webcam-container">
          <canvas ref={canvasRef} className="canvas" width={720} height={480} />
          <Webcam
            audio={false}
            style={{ visibility: "hidden" }}
            width={720}
            height={480}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            videoConstraints={{
              width: 720,
              height: 480,
              facingMode: "user",
            }}
          />
          {isCountdownActive && <div className="countdown">{countdown}</div>}
          {!isCountdownActive && isRecordingIndicatorVisible && (
            <div className="recording-indicator">녹화 중</div>
          )}
        </div>

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
            onClick={downloadData}
            disabled={!recordedData.pose_keypoints.length}
          >
            데이터 다운로드
          </button>
        </div>
      </div>
    </>
  );
};

export default Recognize;
