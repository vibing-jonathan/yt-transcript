import { Route, Routes } from "react-router-dom";
import { LibraryPage } from "./pages/LibraryPage";
import { VideoDetailPage } from "./pages/VideoDetailPage";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<LibraryPage />} />
      <Route path="/videos/:id" element={<VideoDetailPage />} />
    </Routes>
  );
}
