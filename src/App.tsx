import { Routes, Route } from "react-router-dom";
import DJScreen from "./pages/DJScreen";
import RequestScreen from "./pages/RequestScreen";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<DJScreen />} />
      <Route path="/dj" element={<DJScreen />} />
      <Route path="/request" element={<RequestScreen />} />
    </Routes>
  );
}
