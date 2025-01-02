import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import MintPage from "./pages/MintPage";
import MyNFTPage from "./pages/MyNFT";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MintPage />} />
        <Route path="/my-nft" element={<MyNFTPage />} />
      </Routes>
    </Router>
  );
}

export default App;
