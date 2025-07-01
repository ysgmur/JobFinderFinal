import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import App from "./App.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import "./index.css";
import JobDetail from "./pages/JobDetail.jsx";
import Notifications from "./pages/Notifications.jsx";
import CreateAlert from "./pages/CreateAlert.jsx";
import AIAgentChat from "./components/AIAgentChat.jsx";
import PostJob from "./pages/PostJob.jsx"; // ekle



ReactDOM.createRoot(document.getElementById("app")).render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/job/:id" element={<JobDetail />} />
          <Route path="/notifications" element={<Notifications />} />
           <Route path="/create-alert" element={<CreateAlert />} />
          <Route path="/ai-agent" element={<AIAgentChat />} />
          <Route path="/post-job" element={<PostJob />} />
      </Routes>
    </Router>
  </React.StrictMode>
);
