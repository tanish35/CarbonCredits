import express from "express";
import requireAuth from "../milddleware/checkAuth";
import {
  buyNFT,
  createNFT,
  getNFT,
  getNFTs,
  NFTtrasactions,
  sellNFT,
  transferNFT,
} from "../controllers/nftController";

const NFTrouter = express.Router();

NFTrouter.put("/buy", requireAuth, buyNFT);
NFTrouter.put("/sell", requireAuth, sellNFT);
NFTrouter.put("/transactions", requireAuth, NFTtrasactions);
NFTrouter.get("/getNFT", requireAuth, getNFT);
NFTrouter.get("/getNFTs", requireAuth, getNFTs);
NFTrouter.post("/createNFT", requireAuth, createNFT);
NFTrouter.post("/transfer", transferNFT);
export default NFTrouter;
