import express from "express";
import requireAuth from "../milddleware/checkAuth";
import {
  getMarketPlaceNFTs,
  getNFT,
  getOwnedNFTs,
  NFTtrasactions,
  transferNFT,
} from "../controllers/nftController";

const NFTrouter = express.Router();
NFTrouter.put("/transactions", requireAuth, NFTtrasactions);
NFTrouter.get("/getOwnedNFTs", requireAuth, getOwnedNFTs);
NFTrouter.get("/getNFT", requireAuth, getNFT);
NFTrouter.post("/transfer", transferNFT);
NFTrouter.get('/getMarketNFTs', getMarketPlaceNFTs);
export default NFTrouter;
