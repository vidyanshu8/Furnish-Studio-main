import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import HomePage from "./pages/HomePage";
import FeaturesPage from "./pages/FeaturesPage";
import HowItWorksPage from "./pages/HowItWorksPage";
import GalleryPage from "./pages/GalleryPage";

import RoomDesignPage from "./pages/DesignPage";
import RoomTestDesignPage from "./pages/TestDesign";
import ThreeDView from "./pages/ThreeDView";
import TestThreeDView from "./pages/TestThreeDView";
import DesignStudio from "./pages/components/DesignStudio";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/design" element={<RoomDesignPage />} />
        <Route path="/design-studio" element={<DesignStudio />} />
        <Route path="/3d-view" element={<ThreeDView />} />
        <Route path="/testDesign" element={<RoomTestDesignPage />} />
        <Route path="/test3dView" element={<TestThreeDView />} />
      </Routes>
      <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 50 }}>
        <Link
          to="/design-studio"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '14px 20px',
            background: '#4f46e5',
            color: '#ffffff',
            borderRadius: '999px',
            boxShadow: '0 18px 40px rgba(79, 70, 229, 0.25)',
            fontWeight: 700,
            textDecoration: 'none',
            transition: 'transform 0.2s ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
        >
          Edit Wall
        </Link>
      </div>
    </Router>
  );
}

export default App;
