import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Entry from "./Entry";
import Recognize from "./Recognize";
import Main from "./Main";
import VideoCall from "./VideoCall";
import VideoCallEntry from "./VideoCallEntry";
import Page1 from "./Page1";
import Page2 from "./Page2";
import Page3 from "./Page3";
import Page4 from "./Page4";

const App: React.FC = () => {
  return (
    <Router>
      <AnimatePresence>
        <Routes>
          <Route path="/" element={<Entry />} />
          <Route path="/home" element={<Main />} />
          <Route path="/recognize" element={<Recognize />} />;
          <Route path="/Videocall" element={<VideoCall />} />;
          <Route path="/videocalentry" element={<VideoCallEntry />} />;
          <Route path="/page1" element={<Page1 />} />
          <Route path="/page2" element={<Page2 />} />
          <Route path="/page3" element={<Page3 />} />
          <Route path="/page4" element={<Page4 />} />
        </Routes>
      </AnimatePresence>
    </Router>
  );
};

export default App;
