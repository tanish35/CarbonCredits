"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMarketPlaceNFTs = exports.setNFTstatus = exports.getNFTstatus = exports.transferNFT = exports.getAllNFTs = exports.getNFT = exports.getOwnedNFTs = exports.NFTtrasactions = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const prisma_1 = __importDefault(require("../lib/prisma"));
const ethers_1 = require("ethers");
const abi_1 = require("../abi/abi");
const PRIVATE_KEY = process.env.PRIVATE_KEY;
if (!PRIVATE_KEY) {
    throw new Error("Please provide a private key");
}
const RPC_URL = process.env.RPC_URL;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
if (!RPC_URL || !CONTRACT_ADDRESS) {
    throw new Error("Please provide a RPC URL and a contract address");
}
const provider = new ethers_1.ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers_1.ethers.Wallet(PRIVATE_KEY, provider);
const contract = new ethers_1.ethers.Contract(CONTRACT_ADDRESS, abi_1.abi, wallet);
exports.NFTtrasactions = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { buyerId, sellerId, nftId, price } = req.body;
    if (!buyerId || !sellerId || !nftId) {
        res
            .status(400)
            .json({ message: "Please provide all the required fields" });
        return;
    }
    const buyer = yield prisma_1.default.wallet.update({
        where: {
            address: buyerId,
        },
        data: {
            nfts: {
                connect: {
                    id: nftId,
                },
            },
        },
    });
    const seller = yield prisma_1.default.wallet.update({
        where: {
            address: sellerId,
        },
        data: {
            nfts: {
                disconnect: {
                    id: nftId,
                },
            },
        },
    });
    const transaction = yield prisma_1.default.transaction.create({
        data: {
            buyerWallet: buyerId,
            sellerWallet: sellerId,
            nftId,
            price,
        },
    });
    const nft = yield prisma_1.default.nFT.update({
        where: {
            id: nftId,
        },
        data: {
            walletAddress: buyerId,
        },
    });
    res.json({ message: "Transaction successful" });
}));
exports.getOwnedNFTs = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userNFTs = yield prisma_1.default.user.findUnique({
        where: {
            // @ts-ignore
            id: req.user.id,
        },
        include: {
            wallets: {
                include: {
                    nfts: true,
                },
            },
        },
    });
    res.json(userNFTs);
}));
exports.getNFT = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { nftId } = req.body;
    if (!nftId) {
        res.status(400).json({ message: "Please provide an NFT id" });
        return;
    }
    const nft = yield prisma_1.default.nFT.findUnique({
        where: {
            tokenId: nftId,
        },
    });
    res.json(nft);
}));
exports.getAllNFTs = (0, express_async_handler_1.default)((_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const nfts = yield prisma_1.default.nFT.findMany();
    res.json(nfts);
}));
// export const NFTMint = asyncHandler(async (req: Request, res: Response) => {
//   const { ownerId } = req.body;
//   if (!ownerId) {
//     res.status(400).json({ message: "Please provide an owner id" });
//     return;
//   }
//   try {
//     // Define the parameters for the minting process
//     const creditType = "Renewable Energy";
//     const quantity = 100;
//     const certificateURI = "ipfs://bafkreia7beck5t6nhonoycmmdfhrefrgnu5c2rru42ad5qog3nlpu7nfs4"; // Replace with actual URI if needed
//     const expiryDate = Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60; // Expiry set to 1 year from now
//     const rate = 8000000; // Replace with actual rate if needed
//     // Perform minting
//     const tx = await contract.mint(
//       ownerId,
//       creditType,
//       BigInt(quantity),
//       certificateURI,
//       expiryDate,
//       rate
//     );
//     // Wait for the transaction to be mined
//     const receipt = await tx.wait();
//     // Return success response with transaction details
//     res.status(200).json({
//       success: true,
//       transactionHash: receipt.transactionHash,
//       blockNumber: receipt.blockNumber,
//       to: ownerId,
//       quantity,
//     });
//   } catch (error) {
//     console.error("Error minting NFT:", error);
//     res.status(500).json({ error: "Failed to mint NFT" });
//   }
// });
// export const createNFT = asyncHandler(async (req: Request, res: Response) => {
//   const {
//     tokenId,
//     tokenURI,
//     ownerId,
//     price,
//     createdAt,
//     creditType,
//     quantity,
//     expiryDate,
//   } = req.body;
//   if (
//     !tokenId ||
//     !tokenURI ||
//     !ownerId ||
//     !price ||
//     !createdAt ||
//     !creditType ||
//     !quantity ||
//     !expiryDate
//   ) {
//     res.status(400).json({ message: "Please provide all the required fields" });
//     return;
//   }
//   const nft = await prisma.nFT.create({
//     data: {
//       tokenId,
//       tokenURI,
//       ownerId,
//       price,
//       createdAt,
//       creditType,
//       quantity,
//       expiryDate,
//       owner: {
//         connect: {
//           id: ownerId,
//         },
//       },
//     },
//   });
//   res.json(nft);
// });
//@ts-ignore
exports.transferNFT = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { from, to, tokenId } = req.body;
    if (!from || !to || !tokenId) {
        return res
            .status(400)
            .json({ message: "Please provide all the required fields" });
    }
    try {
        const tx = yield contract.safeTransferFrom(from, to, tokenId);
        const receipt = yield tx.wait();
        res.json({
            message: "Token transferred successfully",
            transactionHash: tx.hash,
            receipt,
        });
    }
    catch (error) {
        console.error("Transfer Error:", error);
        const errorMessage = error.reason ||
            "Failed to transfer NFT. Please check the input data and try again.";
        res.status(500).json({ message: errorMessage });
    }
}));
exports.getNFTstatus = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { tokenId } = req.body;
    if (tokenId == null) {
        res.status(400).json({ message: "Please provide an NFT id" });
        return;
    }
    tokenId = String(tokenId);
    const nft = yield prisma_1.default.nFT.findUnique({
        select: {
            isDirectSale: true,
            isAuction: true,
        },
        where: {
            tokenId,
        },
    });
    if (!nft) {
        res.status(404).json({ message: "NFT not found" });
        return;
    }
    res.json({ isDirectSale: nft.isDirectSale, isAuction: nft.isAuction });
}));
exports.setNFTstatus = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { tokenId, type } = req.body;
    if (!tokenId || !type) {
        res
            .status(400)
            .json({ message: "Please provide all the required fields" });
        return;
    }
    const nft = yield prisma_1.default.nFT.update({
        where: {
            tokenId,
        },
        data: {
            isDirectSale: type === "directSell",
            isAuction: type === "auction",
        },
    });
    res.json(nft);
}));
exports.getMarketPlaceNFTs = (0, express_async_handler_1.default)((_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const owner = process.env.OWNER_ADDRESS;
    if (!owner) {
        res.status(400).json({ message: "Please provide an owner address" });
        return;
    }
    const nfts = yield prisma_1.default.nFT.findMany({
        where: {
            walletAddress: owner,
        },
    });
    res.json(nfts);
}));
