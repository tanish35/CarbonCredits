import { GoogleAIFileManager } from "@google/generative-ai/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import path from "path";
import secrets from "../secrets";

const { GEMINI_API_KEY } = secrets;

const mediaPath: string = path.resolve(__dirname, "../../public/certificate");

const getEmissionReductionData = async (): Promise<Object> => {
  const fileManager = new GoogleAIFileManager(GEMINI_API_KEY);
  console.log("Uploading file...");

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
  // console.log("Response text:", responseText);
  const parts = responseText.split("|");
  const data = {
    emission: parts[0],
    companyName: parts[1],
  };
  return data;
};

export default getEmissionReductionData;
