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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMarketPlaceNFTs = exports.setNFTstatus = exports.getNFTstatus = exports.getAllNFTRetired = exports.transferNFT = exports.setNFTs = exports.getAllNFTs = exports.getNFT = exports.getOwnedNFTs = exports.NFTtrasactions = void 0;
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
const wallet = new ethers_1.ethers.Wallet(((_a = process.env.PRIVATE_KEY) === null || _a === void 0 ? void 0 : _a.replace(/^0x/, "")) || "", provider);
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
        where: { address: buyerId },
        data: {
            nfts: {
                connect: { id: nftId },
            },
        },
    });
    const seller = yield prisma_1.default.wallet.update({
        where: { address: sellerId },
        data: {
            nfts: {
                disconnect: { id: nftId },
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
        where: { id: nftId },
        data: { walletAddress: buyerId },
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
        where: { tokenId: nftId },
    });
    res.json(nft);
}));
exports.getAllNFTs = (0, express_async_handler_1.default)((_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const nfts = yield prisma_1.default.nFT.findMany();
    res.json(nfts);
}));
const setNFTs = (walletAddress) => __awaiter(void 0, void 0, void 0, function* () {
    if (!walletAddress) {
        throw new Error("Wallet address is required.");
    }
    try {
        const credits = yield contract.getCreditByOwner(walletAddress);
        for (const credit of credits) {
            const { id: tokenId, typeofcredit: typeofCredit, quantity, certificateURI, expiryDate, retired, } = credit;
            const price = yield contract.getRate(tokenId);
            if (!retired) {
                yield prisma_1.default.nFT.upsert({
                    where: { tokenId: tokenId.toString() },
                    update: {
                        walletAddress,
                        typeofCredit,
                        quantity: quantity.toString(),
                        certificateURI,
                        expiryDate: expiryDate ? new Date(Number(expiryDate) * 1000) : null,
                        price: price.toString(),
                    },
                    create: {
                        tokenId: tokenId.toString(),
                        typeofCredit,
                        quantity: quantity.toString(),
                        certificateURI,
                        expiryDate: expiryDate ? new Date(Number(expiryDate) * 1000) : null,
                        price: price.toString(),
                        wallet: { connect: { address: walletAddress } },
                    },
                });
            }
        }
        return "NFTs updated successfully.";
    }
    catch (error) {
        console.error("Error processing NFTs:", error);
        throw new Error("Failed to process NFTs.");
    }
});
exports.setNFTs = setNFTs;
exports.transferNFT = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { from, to, tokenId } = req.body;
    if (!from || !to || !tokenId) {
        res.status(400).json({ message: "Please provide all the required fields" });
        return;
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
exports.getAllNFTRetired = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const allNftRetired = yield prisma_1.default.wallet.findMany({
            include: {
                creditRetirement: true,
            },
        });
        const result = allNftRetired.map((wallet) => {
            const totalQuantity = wallet.creditRetirement.reduce((acc, curr) => acc + Number(curr.quantity), 0);
            return {
                walletAddress: wallet.address,
                tokensRetired: wallet.creditRetirement.length,
                quantity: totalQuantity,
            };
        });
        res.json(result);
    }
    catch (error) {
        console.error("Error fetching retired NFTs:", error);
        res.status(500).json({ message: "Failed to fetch retired NFTs" });
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
        where: { tokenId },
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
        where: { tokenId },
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
        where: { walletAddress: owner },
    });
    res.json(nfts);
}));
