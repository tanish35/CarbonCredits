import express from "express";
import requireAuth from "../milddleware/checkAuth";
import {
  getNFT,
  getOwnedNFTs,
  NFTtrasactions,
  transferNFT,
} from "../controllers/nftController";

const NFTrouter = express.Router();
NFTrouter.put("/transactions", requireAuth, NFTtrasactions);
NFTrouter.get("/getNFT", requireAuth, getOwnedNFTs);
NFTrouter.get("/getNFTs", requireAuth, getNFT);
NFTrouter.post("/transfer", transferNFT);
export default NFTrouter;
