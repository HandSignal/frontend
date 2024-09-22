import { useCallback, useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import { Camera } from "@mediapipe/camera_utils";
import { Holistic, Results } from "@mediapipe/holistic";
import { drawCanvas } from "../utils/drawCanvas";
import "../styles/Recognize.css";
import Nav from "./Nav";
import axios from "axios";
import {
  FaCamera,
  FaLanguage,
  FaRecordVinyl,
  FaStopCircle,
} from "react-icons/fa";

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

  const [modelResult, setModelResult] = useState<string | null>(null);

  useEffect(() => {
    const requestCameraPermission = async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert(
          "이 브라우저는 카메라를 지원하지 않습니다. 최신 브라우저를 사용해 주세요."
        );
        return;
      }

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
        alert(
          "카메라 권한 요청에 실패했습니다. 브라우저의 카메라 권한을 확인해 주세요.."
        );
        setCameraPermission(false);
      }
    };

    requestCameraPermission();
  }, []);

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
          pose_keypoints: prevData.pose_keypoints.concat([poseKeypoints]),
          left_hand_keypoints: prevData.left_hand_keypoints.concat([
            leftHandKeypoints,
          ]),
          right_hand_keypoints: prevData.right_hand_keypoints.concat([
            rightHandKeypoints,
          ]),
        }));
      }
    },
    [isRecording]
  );

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
      setIsRecordingIndicatorVisible(false);

      const countdownInterval = setInterval(() => {
        setCountdown((prevCountdown) => {
          if (prevCountdown === 1) {
            clearInterval(countdownInterval);
            setIsRecording(true);
            setIsRecordingIndicatorVisible(true);
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

    const formattedData = {
      pose_keypoint: recordedData.pose_keypoints,
      left_hand_keypoint: recordedData.left_hand_keypoints,
      right_hand_keypoint: recordedData.right_hand_keypoints,
    };

    const blob = new Blob([JSON.stringify(formattedData)], {
      type: "application/json",
    });

    // 현재 시간을 기준으로 파일명 생성
    const currentTime = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `data_${currentTime}.json`;

    const formData = new FormData();
    formData.append("data", blob, filename);

    try {
      const response = await axios.post(
        "http://43.203.16.219:8080/translate/sign-language",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200) {
        const {
          file: { modelResult },
        } = response.data;

        setModelResult(modelResult);
      } else {
        const errorText = response.statusText;
        alert(`데이터 업로드 실패: ${errorText}`);
      }
    } catch (error) {
      console.error("업로드 오류:", error);
      alert(`데이터 업로드 중 오류가 발생했습니다.`);
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
            <div className="recording-indicator">동작 인식 중입니다</div>
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
              <FaCamera
                style={{
                  marginRight: "8px",
                  transform: "translateY(3px)",
                }}
              />
              {isCameraOn ? "카메라 끄기" : "카메라 켜기"}
            </button>
            <button
              className="button"
              type="button"
              onClick={toggleRecording}
              disabled={isCountdownActive}
            >
              {isRecording ? (
                <>
                  <FaStopCircle
                    style={{
                      marginRight: "8px",
                      transform: "translateY(3px)",
                    }}
                  />
                  인식 중지
                </>
              ) : (
                <>
                  <FaRecordVinyl
                    style={{
                      marginRight: "8px",
                      transform: "translateY(3px)",
                    }}
                  />
                  인식 시작
                </>
              )}
            </button>
            <button
              className="button"
              type="submit"
              disabled={!recordedData.pose_keypoints.length}
            >
              <FaLanguage
                style={{
                  marginRight: "8px",
                  transform: "translateY(3px)",
                }}
              />
              번역하기
            </button>
          </div>
        </form>
        {/* modelResult 값이 있을 때만 화면에 표시 */}
        {modelResult && (
          <div className="model-result">
            <h3>번역 결과 : {modelResult}</h3>
          </div>
        )}
      </div>
    </>
  );
};

export default Recognize;
