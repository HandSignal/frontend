import { useCallback, useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import { Camera } from "@mediapipe/camera_utils";
import { Holistic, Results } from "@mediapipe/holistic";
import { drawCanvas } from "../utils/drawCanvas";
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
  const [countdown, setCountdown] = useState<number>(0);
  const [isCountdownActive, setIsCountdownActive] = useState<boolean>(false);
  const [isRecordingIndicatorVisible, setIsRecordingIndicatorVisible] =
    useState<boolean>(false);

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
        console.error("Camera permission error:", error);
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
        if (newHolistic) {
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

        camera.start();
        holistic.onResults(onResults);

        return () => {
          camera.stop();
        };
      }
    }
  }, [holistic, onResults, cameraPermission]);

  const toggleRecording = () => {
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

  const saveDataToServer = async () => {
    if (!recordedData.pose_keypoints.length) {
      console.warn("저장할 데이터가 없습니다.");
      alert("저장할 데이터가 없습니다.");
      return;
    }

    const formattedData = {
      pose_keypoint: recordedData.pose_keypoints,
      left_hand_keypoint: recordedData.left_hand_keypoints,
      right_hand_keypoint: recordedData.right_hand_keypoints,
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
      console.log("서버로 데이터 전송 시작");
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
        console.log("데이터가 성공적으로 저장되었습니다.");
        alert("데이터가 성공적으로 저장되었습니다.");
      } else {
        console.log("데이터 저장에 실패했습니다. 상태 코드:", response.status);
        alert("데이터 저장에 실패했습니다.");
      }
    } catch (error) {
      console.error("데이터 전송 중 오류 발생:", error);
      alert("데이터 저장 중 오류가 발생했습니다.");
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

        <div className="buttonContainer">
          <button
            className="button"
            onClick={toggleRecording}
            disabled={isCountdownActive}
          >
            {isRecording ? "녹화 중지" : "녹화 시작"}
          </button>
          <button
            className="button"
            onClick={saveDataToServer}
            disabled={!recordedData.pose_keypoints.length}
          >
            데이터 저장
          </button>
        </div>
      </div>
    </>
  );
};

export default Recognize;
