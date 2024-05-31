import { useCallback, useEffect, useRef, useState, SetStateAction } from "react";
import Webcam from "react-webcam";
import { css } from "@emotion/css";
import { Camera } from "@mediapipe/camera_utils";
import { Holistic, Results } from "@mediapipe/holistic";
import { drawCanvas } from "./utils/drawCanvas";

const App = () => {
  // 웹캠 및 캔버스 레퍼런스 설정
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Mediapipe Holistic 모델 및 녹화 관련 상태 설정
  const [holistic, setHolistic] = useState<Holistic | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedData, setRecordedData] = useState<any[]>([]);

  // Mediapipe Holistic 모델 초기화 및 설정
  useEffect(() => {
    if (!holistic) {
      const newHolistic = new Holistic({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`;
        },
      });

      newHolistic.setOptions({
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      setHolistic(newHolistic);
    }

    // 컴포넌트 언마운트 시 Mediapipe Holistic 모델 종료
    return () => {
      if (holistic) {
        holistic.close();
      }
    };
  }, [holistic]);

  
// Mediapipe Holistic 결과 처리 및 녹화 데이터 저장
  const onResults = useCallback((results: Results) => {
    const canvasCtx = canvasRef.current!.getContext("2d")!;
    
    // 캔버스에 결과 그리기
    drawCanvas(canvasCtx, results);

    // 필요한 키포인트 데이터 추출
    const poseKeypoints = results.poseLandmarks?.map(point => [point.x, point.y, point.z]);
    const leftHandKeypoints = results.leftHandLandmarks?.map(point => [point.x, point.y, point.z]);
    const rightHandKeypoints = results.rightHandLandmarks?.map(point => [point.x, point.y, point.z]);

    // 녹화 중이라면 데이터 저장
    if (isRecording) {
      setRecordedData((prevData: any[]) => {
        // 이전 상태를 가져와서 새로운 상태를 명시적으로 구성
        return [
          ...prevData,
          {
            pose_keypoints: poseKeypoints || [],
            left_hand_keypoints: leftHandKeypoints || [],
            right_hand_keypoints: rightHandKeypoints || [],
          }
        ];
      });
    }
  }, [isRecording]);

  // 웹캠과 Mediapipe Holistic 모델 연결
  useEffect(() => {
    if (holistic && webcamRef.current) {
      const camera = new Camera(webcamRef.current.video!, {
        onFrame: async () => {
          await holistic.send({ image: webcamRef.current!.video! });
        },
        width: 1280,
        height: 720,
      });
      camera.start();
      holistic.onResults(onResults);
    }
  }, [holistic, onResults]);


  // 녹화 시작/중지 토글 함수
  const toggleRecording = () => {
    setIsRecording((prev) => !prev);
    if (!isRecording) {
      setRecordedData([]); // 새로운 녹화 시작 시 기록된 데이터 초기화
    }
  };

  const saveDataToJson = () => {
    // 포즈, 왼손, 오른손 키포인트 배열 초기화
    let poseKeypointsArray: any[] = [];
    let leftHandKeypointsArray: any[] = [];
    let rightHandKeypointsArray: any[] = [];
  
    // recordedData 배열을 순회하면서 각 레코드에서 키포인트를 추출하여 배열에 추가
    recordedData.forEach(result => {
      if (result.pose_keypoints) {
        const formattedPoseKeypoints = result.pose_keypoints.map((point: any) => ({
          x: point[0],
          y: point[1],
          z: point[2],
          visibility: point[3] || 0  // visibility가 없다면 기본값 0
        }));
        poseKeypointsArray = poseKeypointsArray.concat(formattedPoseKeypoints);
      }
      if (result.left_hand_keypoints) {
        const formattedLeftHandKeypoints = result.left_hand_keypoints.map((point: any) => ({
          x: point[0],
          y: point[1],
          z: point[2],
          visibility: point[3] || 0  // visibility가 없다면 기본값 0
        }));
        leftHandKeypointsArray = leftHandKeypointsArray.concat(formattedLeftHandKeypoints);
      }
      if (result.right_hand_keypoints) {
        const formattedRightHandKeypoints = result.right_hand_keypoints.map((point: any) => ({
          x: point[0],
          y: point[1],
          z: point[2],
          visibility: point[3] || 0  // visibility가 없다면 기본값 0
        }));
        rightHandKeypointsArray = rightHandKeypointsArray.concat(formattedRightHandKeypoints);
      }
    });
  
    // 각 키포인트 배열을 하나의 객체로 합쳐서 JSON으로 변환
    const formattedData = {
      pose_keypoints: poseKeypointsArray,
      left_hand_keypoints: leftHandKeypointsArray,
      right_hand_keypoints: rightHandKeypointsArray
    };
  
    const jsonData = JSON.stringify(formattedData, null, 2); // JSON 형식으로 변환하고 들여쓰기 적용
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
    <div className={styles.container}>
      {/* 웹캠 비디오 출력 */}
      <Webcam
        audio={false}
        style={{ visibility: "hidden" }}
        width={1280}
        height={720}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        videoConstraints={{ width: 1280, height: 720, facingMode: "user" }}
      />
      {/* Mediapipe Holistic 결과를 출력할 캔버스 */}
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        width={1280}
        height={720}
      />
      {/* 녹화 시작/중지 버튼 및 데이터 저장 버튼 */}
      <div className={styles.buttonContainer}>
        <button className={styles.button} onClick={toggleRecording}>
          {isRecording ? "녹화 중지" : "녹화 시작"}
        </button>
        <button
          className={styles.button}
          onClick={saveDataToJson}
          disabled={!recordedData.length}
        >
          JSON으로 데이터 저장
        </button>
      </div>
    </div>
);

};

// 스타일 정의
const styles = {
  container: css`
    position: relative;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
  `,
  canvas: css`
    position: absolute;
    width: 1280px;
    height: 720px;
    background-color: #fff;
  `,
  buttonContainer: css`
    position: absolute;
    top: 20px;
    left: 20px;
  `,
  button: css`
    color: #fff;
    background-color: #0082cf;
    font-size: 1rem;
    border: none;
    border-radius: 5px;
    padding: 10px 10px;
    cursor: pointer;
    margin-right: 10px;
  `,
};

export default App;