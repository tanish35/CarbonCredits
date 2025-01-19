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
exports.addAchievement = exports.getEmissionReduction = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const multer_1 = __importDefault(require("multer"));
const gemini_controller_1 = require("./gemini.controller");
const pinataController_1 = __importDefault(require("./pinataController"));
const nftController_1 = require("./nftController");
const ethers_1 = require("ethers");
const abi_1 = require("../abi/abi");
const prisma_1 = __importDefault(require("../lib/prisma"));
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
//multer config
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./public/certificate");
    },
    filename: (req, file, cb) => {
        if (file.fieldname === "certificate") {
            cb(null, "cert.jpeg");
        }
        else if (file.fieldname === "companyLogo") {
            cb(null, "companyLogo.jpeg");
        }
        else if (file.fieldname === "achievement") {
            cb(null, "achievement.jpeg");
        }
    },
});
const upload = (0, multer_1.default)({ storage: storage });
exports.getEmissionReduction = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    upload.fields([
        { name: "certificate", maxCount: 1 },
        { name: "companyLogo", maxCount: 1 },
    ])(req, res, (err) => __awaiter(void 0, void 0, void 0, function* () {
        if (err) {
            console.error("Multer Error:", err);
            return res.status(500).json("Error uploading files");
        }
        const { ownerId, name } = req.body;
        if (!ownerId || !name) {
            res
                .status(400)
                .json({ message: "Please provide an owner ID and credit type" });
            return;
        }
        const multipler = BigInt(1e13);
        try {
            let emissionReduction = yield (0, gemini_controller_1.getEmissionReductionData)();
            let certificateURI = yield (0, pinataController_1.default)(
            // @ts-ignore
            emissionReduction.companyName, 
            // @ts-ignore
            emissionReduction.emission);
            certificateURI = `ipfs://${certificateURI}`;
            // @ts-ignore
            emissionReduction = emissionReduction.emission
                .toString()
                .replace(/,/g, "");
            console.log("Emission Reduction:", emissionReduction);
            // Convert emissionReduction to BigInt for consistency
            // @ts-ignore
            const quantity = BigInt(emissionReduction);
            const creditType = String(name); // Ensuring creditType is correctly defined
            const expiryDate = Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60; // 1 year in seconds
            const rate = quantity * multipler; // Using BigInt for precision
            // Perform minting
            const tx = yield contract.mint(ownerId, creditType, quantity, certificateURI, expiryDate, rate);
            // Wait for the transaction to be mined
            const receipt = yield tx.wait();
            console.log("Transaction receipt:", receipt);
            (0, nftController_1.setNFTs)(ownerId);
            // Return success response with transaction details
            res.status(200).json({
                success: true,
                transactionHash: receipt.transactionHash,
                blockNumber: receipt.blockNumber,
                to: ownerId,
                quantity: quantity.toString(),
            });
        }
        catch (error) {
            console.error("Error minting NFT:", error);
            res.status(500).json({ error: "Failed to mint NFT" });
        }
    }));
}));
exports.addAchievement = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    upload.fields([{ name: "achievement", maxCount: 1 }])(req, res, (err) => __awaiter(void 0, void 0, void 0, function* () {
        if (err) {
            console.error("Multer Error:", err);
            return res.status(500).json("Error uploading files");
        }
        //@ts-ignore
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }
        try {
            const achievementData = yield (0, gemini_controller_1.checkAchievement)();
            // @ts-ignore
            if (!achievementData) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid certificate or achievement not verified",
                });
            }
            console.log(achievementData);
            //update db
            //@ts-ignore
            const user = req.user;
            yield prisma_1.default.achievement.create({
                data: {
                    userId: user.id,
                    description: achievementData.description,
                    points: parseInt(achievementData.points),
                    type: achievementData.type,
                },
            });
            return res.status(200).json(Object.assign({}, achievementData));
        }
        catch (error) {
            console.error("Error verifying achievement:", error);
            return res.status(500).json({
                success: false,
                message: "Error processing achievement verification",
            });
        }
    }));
}));
// model Achievement {
//   id        String   @id @default(cuid())
//   userId    String
//   user      User    @relation(fields: [userId], references: [id])
//   type      AchievementType @default(Green_Pioneer)
//   description String @default("Start your journey to become a Green Pioneer")
//   points    Int @default(0)
//   createdAt DateTime @default(now())
// }
