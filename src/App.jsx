import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Survey from "./pages/Survey";
import Results from "./pages/Results";
import "./App.css";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/survey" element={<Survey />} />
        <Route path="/results" element={<Results />} />
      </Routes>
    </BrowserRouter>
  );
}
