import { css } from "@emotion/css";

export const container = css`
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const canvas = css`
  position: absolute;
  width: 1280px;
  height: 720px;
  background-color: #fff;
`;

export const buttonContainer = css`
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const button = css`
  color: #00FF80; /* 기본 글씨 색상 */
  background-color: #000000; /* 기본 배경 색상 */
  font-size: 1rem;
  border: none;
  border-radius: 10px;
  padding: 10px 10px;
  margin: 5px;
  cursor: pointer;

  &:hover {
    color: #000000; /* 호버 글씨 색상 */
    background-color: #00FF80; /* 호버 배경 색상 */
  }
`;
