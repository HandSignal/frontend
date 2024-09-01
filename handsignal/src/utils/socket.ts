// src/socket.ts
import { io } from "socket.io-client";

// const socket = io("http://localhost:4000"); // 서버 URL에 맞게 변경
const socket = io("http://43.203.16.219:5000/"); // 서버 URL에 맞게 변경

export default socket;
