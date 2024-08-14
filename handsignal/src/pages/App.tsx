import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Login from "./Login";
import Recognize from "./Recognize";
import Signup from "./Signup";
import Main from "./Main";

const App: React.FC = () => {
  return (
    <Router>
      <AnimatePresence>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/home" element={<Main />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/recognize" element={<Recognize />} />;
        </Routes>
      </AnimatePresence>
    </Router>
  );
};

export default App;
