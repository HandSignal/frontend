// src/pages/Recognize.tsx
import React, { useCallback, useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import { Camera } from "@mediapipe/camera_utils";
import { Holistic, Results } from "@mediapipe/holistic";
import { drawCanvas } from "../utils/drawCanvas";
import "../styles/Recognize.css";
import Nav from "./Nav";

const Recognize: React.FC = () => {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cameraRef = useRef<Camera | null>(null);

  const [holistic, setHolistic] = useState<Holistic | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedData, setRecordedData] = useState<any[]>([]);
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
          // `close` 메서드가 없을 경우, 객체를 null로 설정
          setHolistic(null);
        }
      };
    }
  }, [cameraPermission, holistic]);

  // Mediapipe Holistic 결과 처리
  const onResults = useCallback(
    (results: Results) => {
      const canvasCtx = canvasRef.current?.getContext("2d");

      if (canvasCtx) {
        drawCanvas(canvasCtx, results);
      }

      const poseKeypoints = results.poseLandmarks?.map((point) => [
        point.x,
        point.y,
        point.z,
        point.visibility,
      ]);
      const leftHandKeypoints = results.leftHandLandmarks?.map((point) => [
        point.x,
        point.y,
        point.z,
        point.visibility,
      ]);
      const rightHandKeypoints = results.rightHandLandmarks?.map((point) => [
        point.x,
        point.y,
        point.z,
        point.visibility,
      ]);

      if (isRecording) {
        setRecordedData((prevData: any[]) => [
          ...prevData,
          {
            pose_keypoints: poseKeypoints || [],
            left_hand_keypoints: leftHandKeypoints || [],
            right_hand_keypoints: rightHandKeypoints || [],
          },
        ]);
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
      setIsRecordingIndicatorVisible(true);

      const countdownInterval = setInterval(() => {
        setCountdown((prevCountdown) => {
          if (prevCountdown === 1) {
            clearInterval(countdownInterval);
            setIsRecording(true);
            setIsRecordingIndicatorVisible(false);
            setRecordedData([]);
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

  // 녹화된 데이터를 JSON 파일로 저장하는 함수
  const saveDataToJson = () => {
    let poseKeypointsArray: any[] = [];
    let leftHandKeypointsArray: any[] = [];
    let rightHandKeypointsArray: any[] = [];

    recordedData.forEach((result) => {
      if (result.pose_keypoints) {
        const formattedPoseKeypoints = result.pose_keypoints.map(
          (point: any) => ({
            x: point[0],
            y: point[1],
            z: point[2],
            visibility: point[3] || 0,
          })
        );
        poseKeypointsArray = poseKeypointsArray.concat(formattedPoseKeypoints);
      }
      if (result.left_hand_keypoints) {
        const formattedLeftHandKeypoints = result.left_hand_keypoints.map(
          (point: any) => ({
            x: point[0],
            y: point[1],
            z: point[2],
            visibility: point[3] || 0,
          })
        );
        leftHandKeypointsArray = leftHandKeypointsArray.concat(
          formattedLeftHandKeypoints
        );
      }
      if (result.right_hand_keypoints) {
        const formattedRightHandKeypoints = result.right_hand_keypoints.map(
          (point: any) => ({
            x: point[0],
            y: point[1],
            z: point[2],
            visibility: point[3] || 0,
          })
        );
        rightHandKeypointsArray = rightHandKeypointsArray.concat(
          formattedRightHandKeypoints
        );
      }
    });

    const formattedData = {
      pose_keypoints: poseKeypointsArray,
      left_hand_keypoints: leftHandKeypointsArray,
      right_hand_keypoints: rightHandKeypointsArray,
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
            disabled={!recordedData.length}
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
