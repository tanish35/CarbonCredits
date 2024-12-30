import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import MintPage from "./pages/MintPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MintPage />} />
      </Routes>
    </Router>
  );
}

export default App;
