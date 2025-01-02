import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import MintPage from "./pages/MintPage";
import MyNFT from "./pages/MyNFT";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MintPage />} />
        <Route path="/my-nft" element={<MyNFT />} />
      </Routes>
    </Router>
  );
}

export default App;
