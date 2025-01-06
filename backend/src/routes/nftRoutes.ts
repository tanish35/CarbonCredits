import express from "express";
import requireAuth from "../milddleware/checkAuth";
import {
  getMarketPlaceNFTs,
  getNFT,
  getOwnedNFTs,
  NFTtrasactions,
  transferNFT,
  getNFTstatus,
  setNFTstatus,
  getAllNFTs,
} from "../controllers/nftController";

const NFTrouter = express.Router();
NFTrouter.put("/transactions", requireAuth, NFTtrasactions);
NFTrouter.get("/getOwnedNFTs", requireAuth, getOwnedNFTs);
NFTrouter.get("/getNFT", requireAuth, getNFT);
NFTrouter.get('/getAllNFTs',requireAuth,getAllNFTs);
NFTrouter.post("/transfer", transferNFT);
NFTrouter.get("/getMarketNFTs", getMarketPlaceNFTs);
NFTrouter.post("/getNFTStatus", getNFTstatus);
NFTrouter.post("/setNFTStatus", setNFTstatus);
export default NFTrouter;
