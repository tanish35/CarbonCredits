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
const server_1 = require("@google/generative-ai/server");
const generative_ai_1 = require("@google/generative-ai");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const secrets_1 = __importDefault(require("../secrets"));
const { GEMINI_API_KEY } = secrets_1.default;
const mediaPath = path_1.default.resolve(__dirname, "../../public/certificate");
const getEmissionReductionData = () => __awaiter(void 0, void 0, void 0, function* () {
    const fileManager = new server_1.GoogleAIFileManager(GEMINI_API_KEY);
    console.log("Uploading file...");
    const filePath = path_1.default.join(mediaPath, "cert.jpeg");
    const uploadResult = yield fileManager.uploadFile(path_1.default.join(mediaPath, "cert.jpeg"), {
        mimeType: "image/jpeg",
        displayName: "cert.jpeg",
    });
    // console.log(
    //   `Uploaded file ${uploadResult.file.displayName} as: ${uploadResult.file.uri}`
    // );
    const genAI = new generative_ai_1.GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = yield model.generateContent([
        "Provide me the carbon reduction value only and not the units. Put a | after that and give me the company name which is at the top of the certificate.",
        {
            fileData: {
                fileUri: uploadResult.file.uri,
                mimeType: uploadResult.file.mimeType,
            },
        },
    ]);
    const responseText = result.response.text();
    fs_1.default.unlinkSync(filePath);
    // console.log("Response text:", responseText);
    const parts = responseText.split("|");
    const data = {
        emission: parts[0],
        companyName: parts[1],
    };
    return data;
});
exports.default = getEmissionReductionData;
