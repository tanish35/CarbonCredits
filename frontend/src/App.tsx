import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import MintPage from "./pages/MintPage";
import MyNFTPage from "./pages/MyNFTPage";
import NFTDetailsPage from "./pages/NFTDetailsPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MintPage />} />
        <Route path="/my-nft" element={<MyNFTPage />} />
        <Route path="/nft/:id" element={<NFTDetailsPage />} />
      </Routes>
    </Router>
  );
}

export default App;
