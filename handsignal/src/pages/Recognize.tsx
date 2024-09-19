import { useCallback, useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import { Camera } from "@mediapipe/camera_utils";
import { Holistic, Results } from "@mediapipe/holistic";
import { drawCanvas } from "../utils/drawCanvas";
import "../styles/Recognize.css";
import Nav from "./Nav";
import axios from "axios";

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

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    uploadData();
  };

  const uploadData = async () => {
    if (!recordedData.pose_keypoints.length) {
      alert("저장할 데이터가 없습니다.");
      return;
    }

    // JSON 데이터를 문자열로 변환
    const formattedData = {
      pose_keypoints: recordedData.pose_keypoints,
      left_hand_keypoints: recordedData.left_hand_keypoints,
      right_hand_keypoints: recordedData.right_hand_keypoints,
    };

    // JSON 데이터를 Blob으로 변환
    const blob = new Blob([JSON.stringify(formattedData)], {
      type: "application/json", // MIME 타입을 'application/json'으로 설정
    });

    // FormData 객체 생성
    const formData = new FormData();
    // 'data' 키로 파일을 추가 (키는 서버 요구사항에 맞게 'data'로 설정)
    formData.append("data", blob, "recorded_data.json");

    try {
      // 서버에 파일 업로드 요청
      const response = await axios.post(
        "http://43.203.16.219:8080/files/upload",
        formData
      );

      if (response.status === 200) {
        alert("데이터가 성공적으로 업로드되었습니다.");
      } else {
        console.error("데이터 업로드 실패:", response.statusText);
        alert("데이터 업로드에 실패했습니다.");
      }
    } catch (error) {
      console.error("업로드 오류:", error);
      alert("데이터 업로드 중 오류가 발생했습니다.");
    }
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

        <form onSubmit={handleFormSubmit} encType="multipart/form-data">
          <div className="buttonContainer">
            <button
              className="button"
              type="button"
              onClick={toggleCamera}
              disabled={cameraPermission === null}
            >
              {isCameraOn ? "카메라 끄기" : "카메라 켜기"}
            </button>
            <button
              className="button"
              type="button"
              onClick={toggleRecording}
              disabled={isCountdownActive}
            >
              {isRecording ? "녹화 중지" : "녹화 시작"}
            </button>
            <button
              className="button"
              type="submit"
              disabled={!recordedData.pose_keypoints.length}
            >
              데이터 업로드
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default Recognize;
