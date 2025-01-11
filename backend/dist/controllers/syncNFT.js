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
exports.syncNFTHolders = syncNFTHolders;
exports.syncNFTHoldersHandler = syncNFTHoldersHandler;
const ethers_1 = require("ethers");
const prisma_1 = __importDefault(require("../lib/prisma"));
const ERC721_ABI = [
    "function balanceOf(address owner) view returns (uint256)",
    "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)",
    "function ownerOf(uint256 tokenId) view returns (address)",
    "function totalSupply() view returns (uint256)",
    "function getCredit(uint256 tokenId) view returns (tuple(uint256 id, string typeofcredit, uint256 quantity, string certificateURI, uint256 expiryDate, bool retired))",
    "function getRate(uint256 tokenId) view returns (uint256)",
];
function syncNFTHolders() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const provider = new ethers_1.ethers.JsonRpcProvider("https://api.avax-test.network/ext/bc/C/rpc");
            const contract = new ethers_1.ethers.Contract(process.env.CONTRACT_ADDRESS || "", ERC721_ABI, provider);
            const totalSupply = yield contract.totalSupply();
            console.log("Total supply:", totalSupply.toString());
            for (let tokenId = 0; tokenId < totalSupply; tokenId++) {
                try {
                    const walletAddress = yield contract.ownerOf(BigInt(tokenId));
                    let wallet = yield prisma_1.default.wallet.findUnique({
                        where: {
                            address: walletAddress,
                        },
                    });
                    if (!wallet) {
                        const dummyUser = yield prisma_1.default.user.upsert({
                            where: {
                                email: "bytebender@gmail.com",
                            },
                            create: {
                                email: "bytebender@gmail.com",
                                password: "",
                                name: "Legendary Grandmaster",
                            },
                            update: {},
                        });
                        wallet = yield prisma_1.default.wallet.create({
                            data: {
                                address: walletAddress,
                                userId: dummyUser.id,
                            },
                        });
                    }
                    const creditDetails = yield contract.getCredit(BigInt(tokenId));
                    console.log(creditDetails);
                    const { certificateURI, quantity } = creditDetails;
                    const price = yield contract.getRate(BigInt(tokenId));
                    yield prisma_1.default.nFT.upsert({
                        where: {
                            tokenId: tokenId.toString(),
                        },
                        create: {
                            tokenId: tokenId.toString(),
                            walletAddress: wallet.address,
                            price: price.toString(),
                            quantity: quantity.toString(),
                            certificateURI: certificateURI,
                            createdAt: new Date(),
                        },
                        update: {
                            walletAddress: wallet.address,
                            price: price.toString(),
                            quantity: quantity.toString(),
                            certificateURI: certificateURI,
                        },
                    });
                    console.log(`Updated token ${tokenId} for wallet ${walletAddress}`);
                }
                catch (error) {
                    console.error(`Error processing token ${tokenId}:`, error);
                    continue;
                }
            }
            return { success: true, message: "NFT holders sync completed" };
        }
        catch (error) {
            console.error("Error syncing NFT holders:", error);
            throw new Error("Failed to sync NFT holders");
        }
    });
}
function syncNFTHoldersHandler(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = yield syncNFTHolders();
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    });
}
