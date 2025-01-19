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
exports.setApproval = exports.getEmissionData = exports.getResellApproval = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const prisma_1 = __importDefault(require("../lib/prisma"));
const fs_1 = __importDefault(require("fs"));
const server_1 = require("@google/generative-ai/server");
const generative_ai_1 = require("@google/generative-ai");
const secrets_1 = __importDefault(require("../secrets"));
const { GEMINI_API_KEY } = secrets_1.default;
const mediaPath = path_1.default.resolve(__dirname, "../../public/certificate");
const upload = (0, multer_1.default)({
    storage: multer_1.default.diskStorage({
        destination: (req, file, cb) => {
            cb(null, "./public/certificate");
        },
        filename: (req, file, cb) => {
            cb(null, "certificate2.jpg");
        },
    }),
});
exports.getResellApproval = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { token_id } = req.body;
    if (token_id == null) {
        res.status(400).json({ message: "Token ID is required" });
        return;
    }
    const approval = yield prisma_1.default.nFT.findUnique({
        where: { tokenId: String(token_id) },
        select: { isAllowedToSell: true },
    });
    res.status(200).json(approval);
}));
exports.getEmissionData = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    upload.single("certificate2")(req, res, (err) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        if (err) {
            console.error("Multer Error:", err);
            return res.status(500).json({ message: "Error uploading certificate2" });
        }
        const filePath = path_1.default.join(mediaPath, "certificate2.jpg");
        try {
            const fileManager = new server_1.GoogleAIFileManager(GEMINI_API_KEY);
            console.log("Uploading certificate2...");
            const uploadResult = yield fileManager.uploadFile(filePath, {
                mimeType: "image/jpeg",
                displayName: "certificate2.jpg",
            });
            const genAI = new generative_ai_1.GoogleGenerativeAI(GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            console.log("Processing certificate2...");
            const result = yield model.generateContent([
                "Provide me the carbon emission value only (no units and no commas just straight up the integer) and the company name, separated by a |, from the certificate.",
                {
                    fileData: {
                        fileUri: uploadResult.file.uri,
                        mimeType: uploadResult.file.mimeType,
                    },
                },
            ]);
            const responseText = result.response.text();
            fs_1.default.unlinkSync(filePath);
            const parts = responseText.split("|");
            const data = {
                emission: (_a = parts[0]) === null || _a === void 0 ? void 0 : _a.trim(),
                companyName: (_b = parts[1]) === null || _b === void 0 ? void 0 : _b.trim(),
            };
            res.status(200).json(data);
        }
        catch (error) {
            console.error("Error processing certificate2:", error);
            res.status(500).json({ message: "Failed to process certificate2" });
        }
    }));
}));
exports.setApproval = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { token_id, quantity } = req.body;
    if (token_id == null || !quantity) {
        res.status(400).json({ message: "Token ID and quantity are required" });
        return;
    }
    const nft = yield prisma_1.default.nFT.findUnique({
        where: { tokenId: String(token_id) },
    });
    if (!nft) {
        res.status(404).json({ message: "NFT not found" });
        return;
    }
    yield prisma_1.default.nFT.update({
        where: { tokenId: String(token_id) },
        data: {
            isAllowedToSell: true,
            quantity: String(Number(nft.quantity) - quantity),
        },
    });
    res.status(200).json({ message: "Approval set successfully" });
}));
