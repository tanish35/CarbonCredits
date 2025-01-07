import { GoogleAIFileManager } from "@google/generative-ai/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const key = "";
const myPath = "/Users/akashdas/Developer/projects/CarbonCredits";
const mediaPath = myPath + "/backend/public/certificate";

const getEmissionReductionData = async () => {
  const fileManager = new GoogleAIFileManager(key);
  console.log("Uploading file...");
  const uploadResult = await fileManager.uploadFile(`${mediaPath}/cert.jpeg`, {
    mimeType: "image/jpeg",
    displayName: "cert.jpeg",
  });

  // View the response.
  console.log(
    `Uploaded file ${uploadResult.file.displayName} as: ${uploadResult.file.uri}`
  );

  const genAI = new GoogleGenerativeAI(key);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const result = await model.generateContent([
    "only tell me about the emission reduction, return the value only no for units",
    {
      fileData: {
        fileUri: uploadResult.file.uri,
        mimeType: uploadResult.file.mimeType,
      },
    },
  ]);

  console.log(result.response.text());
  return result.response.text();
};

export default getEmissionReductionData;
