import { GoogleAIFileManager } from "@google/generative-ai/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import path from "path";
import fs from "fs";
import secrets from "../secrets";

const { GEMINI_API_KEY } = secrets;

const mediaPath: string = path.resolve(__dirname, "../../public/certificate");

const getEmissionReductionData = async (): Promise<Object> => {
  const fileManager = new GoogleAIFileManager(GEMINI_API_KEY);
  console.log("Uploading file...");
  const filePath = path.join(mediaPath, "cert.jpeg");

  const uploadResult = await fileManager.uploadFile(
    path.join(mediaPath, "cert.jpeg"),
    {
      mimeType: "image/jpeg",
      displayName: "cert.jpeg",
    }
  );

  // console.log(
  //   `Uploaded file ${uploadResult.file.displayName} as: ${uploadResult.file.uri}`
  // );

  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const result = await model.generateContent([
    "Provide me the carbon reduction value only and not the units. Put a | after that and give me the company name which is at the top of the certificate.",
    {
      fileData: {
        fileUri: uploadResult.file.uri,
        mimeType: uploadResult.file.mimeType,
      },
    },
  ]);

  const responseText = result.response.text();
  fs.unlinkSync(filePath);
  //console.log("Response text:", responseText);
  const parts = responseText.split("|");
  const data = {
    emission: parts[0],
    companyName: parts[1],
  };
  return data;
};

const checkAchievement = async () => {
  //read the cert , decide the category of achievement, check prev achievements, add this achievement
  const fileManager = new GoogleAIFileManager(GEMINI_API_KEY);
  console.log("Uploading file...");
  const filePath = path.join(mediaPath, "achievement.jpeg");

  const uploadResult = await fileManager.uploadFile(
    path.join(mediaPath, "achievement.jpeg"),
    {
      mimeType: "image/jpeg",
      displayName: "achievement.jpeg",
    }
  );

  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const result = await model.generateContent([
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
  fs.unlinkSync(filePath);
  try {
    // Ensure we only parse the JSON portion if there's any extra text
    const jsonStart = responseText.indexOf('{');
    const jsonEnd = responseText.lastIndexOf('}') + 1;
    const jsonStr = responseText.slice(jsonStart, jsonEnd);
    
    const achievementData = JSON.parse(jsonStr);
    return achievementData;
  } catch (error) {
    console.error("Error parsing achievement data:", error);
    return null;
  }
};

export { getEmissionReductionData, checkAchievement };
