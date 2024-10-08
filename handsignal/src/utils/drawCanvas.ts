import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import {
  HAND_CONNECTIONS,
  POSE_CONNECTIONS,
  Results,
} from "@mediapipe/holistic";
export const drawCanvas = (ctx: CanvasRenderingContext2D, results: Results) => {
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;

  ctx.save();
  ctx.clearRect(0, 0, width, height);
  // canvas의 좌우 반전
  ctx.scale(-1, 1);
  ctx.translate(-width, 0);
  // capture image 그리기
  ctx.drawImage(results.image, 0, 0, width, height);

  ctx.restore();
};
