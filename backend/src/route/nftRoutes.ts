import express from 'express';
import requireAuth from '../milddleware/checkAuth';
import { buyNFT, sellNFT } from '../controllers/nftController';

const NFTrouter = express.Router();

NFTrouter.put('/buy', requireAuth,buyNFT);
NFTrouter.put('/sell', requireAuth,sellNFT);
export default NFTrouter;