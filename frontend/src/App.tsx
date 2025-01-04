import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import MintPage from "./pages/MintPage";
import MyNFTPage from "./pages/MyNFTPage";
import NFTDetailsPage from "./pages/NFTDetailsPage";
import { RegisterPage } from "./pages/Register";
import { LoginPage } from "./pages/Login";
import { ThemeProvider } from "./components/theme-provider";
import NotFound from "./pages/NotFound";
import MarketplacePage from "./pages/Marketplace";
import BuyPage from "./pages/BuyNFTPage";
import NFTAuctionPage from "./pages/NFTAuctionPage";

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <Router>
        <Routes>
          <Route path="*" element={<NotFound />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<MintPage />} />
          <Route path="/my-nft" element={<MyNFTPage />} />
          <Route path="/nft/:id" element={<NFTDetailsPage />} />
          <Route path="/marketplace" element={<MarketplacePage />} />
          <Route path="/buy" element={<BuyPage />} />
          <Route path="/auction" element={<NFTAuctionPage />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
