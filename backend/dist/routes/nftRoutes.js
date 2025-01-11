"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const checkAuth_1 = __importDefault(require("../middleware/checkAuth"));
const nftController_1 = require("../controllers/nftController");
const NFTrouter = express_1.default.Router();
NFTrouter.put("/transactions", checkAuth_1.default, nftController_1.NFTtrasactions);
NFTrouter.get("/getOwnedNFTs", checkAuth_1.default, nftController_1.getOwnedNFTs);
NFTrouter.get("/getNFT", checkAuth_1.default, nftController_1.getNFT);
NFTrouter.get("/getAllNFTs", checkAuth_1.default, nftController_1.getAllNFTs);
NFTrouter.post("/transfer", nftController_1.transferNFT);
NFTrouter.get("/getMarketNFTs", nftController_1.getMarketPlaceNFTs);
NFTrouter.post("/getNFTStatus", nftController_1.getNFTstatus);
NFTrouter.post("/setNFTStatus", nftController_1.setNFTstatus);
// NFTrouter.post("/mintNFT", NFTMint);
exports.default = NFTrouter;
