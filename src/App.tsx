import { Routes, Route, Navigate } from "react-router-dom";
import DJScreen from "./pages/DJScreen";
import RequestScreen from "./pages/RequestScreen";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dj" replace />} />
      <Route path="/dj" element={<DJScreen />} />
      <Route path="/request" element={<RequestScreen />} />
    </Routes>
  );
}
