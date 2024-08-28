import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Login from "./Login";
import Recognize from "./Recognize";
import Main from "./Main";
import MyPage from "./Mypage";
import Page1 from "./Page1";

const App: React.FC = () => {
  return (
    <Router>
      <AnimatePresence>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/home" element={<Main />} />
          <Route path="/recognize" element={<Recognize />} />;
          <Route path="/mypage" element={<MyPage />} />;
          <Route path="/page1" element={<Page1 />} />
        </Routes>
      </AnimatePresence>
    </Router>
  );
};

export default App;
