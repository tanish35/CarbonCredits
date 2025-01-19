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
exports.checkAchievement = exports.getEmissionReductionData = void 0;
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
    //console.log("Response text:", responseText);
    const parts = responseText.split("|");
    const data = {
        emission: parts[0],
        companyName: parts[1],
    };
    return data;
});
exports.getEmissionReductionData = getEmissionReductionData;
const checkAchievement = () => __awaiter(void 0, void 0, void 0, function* () {
    //read the cert , decide the category of achievement, check prev achievements, add this achievement
    const fileManager = new server_1.GoogleAIFileManager(GEMINI_API_KEY);
    console.log("Uploading file...");
    const filePath = path_1.default.join(mediaPath, "achievement.jpeg");
    const uploadResult = yield fileManager.uploadFile(path_1.default.join(mediaPath, "achievement.jpeg"), {
        mimeType: "image/jpeg",
        displayName: "achievement.jpeg",
    });
    const genAI = new generative_ai_1.GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = yield model.generateContent([
        `You are a JSON generator analyzing achievement certificates. 
    Read the certificate and respond with ONLY a JSON object.
    
    Rules:
    1. The response must be a valid JSON object
    2. No explanatory text before or after the JSON
    3. All values must be strings
    4. Points must be between 100-1000
    5. Type must be one of: Green_Pioneer, Water_Warrior, Energy_Expert, Air_Advocate
    
    Required format:
    {
      "achievement": "clear concise title",
      "description": "one sentence description",
      "type": "most relevant category from allowed types",
      "points": "numeric value as string"
    }`,
        {
            fileData: {
                fileUri: uploadResult.file.uri,
                mimeType: uploadResult.file.mimeType,
            },
        },
    ]);
    const responseText = result.response.text().trim();
    fs_1.default.unlinkSync(filePath);
    try {
        // Ensure we only parse the JSON portion if there's any extra text
        const jsonStart = responseText.indexOf('{');
        const jsonEnd = responseText.lastIndexOf('}') + 1;
        const jsonStr = responseText.slice(jsonStart, jsonEnd);
        const achievementData = JSON.parse(jsonStr);
        return achievementData;
    }
    catch (error) {
        console.error("Error parsing achievement data:", error);
        return null;
    }
});
exports.checkAchievement = checkAchievement;
