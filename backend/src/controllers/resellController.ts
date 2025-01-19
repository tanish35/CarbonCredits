import expressAsyncHandler from "express-async-handler";
import multer from "multer";
import path from "path";
import prisma from "../lib/prisma";
import fs from "fs";
import { GoogleAIFileManager } from "@google/generative-ai/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import secrets from "../secrets";

const { GEMINI_API_KEY } = secrets;

const mediaPath: string = path.resolve(__dirname, "../../public/certificate");

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "./public/certificate");
    },
    filename: (req, file, cb) => {
      cb(null, "certificate2.jpg");
    },
  }),
});

export const getResellApproval = expressAsyncHandler(async (req, res) => {
  const { token_id } = req.body;
  if (token_id == null) {
    res.status(400).json({ message: "Token ID is required" });
    return;
  }
  const approval = await prisma.nFT.findUnique({
    where: { tokenId: String(token_id) },
    select: { isAllowedToSell: true },
  });
  res.status(200).json(approval);
});

export const getEmissionData = expressAsyncHandler(async (req, res) => {
  upload.single("certificate2")(req, res, async (err) => {
    if (err) {
      console.error("Multer Error:", err);
      return res.status(500).json({ message: "Error uploading certificate2" });
    }

    const filePath = path.join(mediaPath, "certificate2.jpg");
    try {
      const fileManager = new GoogleAIFileManager(GEMINI_API_KEY);

      console.log("Uploading certificate2...");
      const uploadResult = await fileManager.uploadFile(filePath, {
        mimeType: "image/jpeg",
        displayName: "certificate2.jpg",
      });

      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      console.log("Processing certificate2...");
      const result = await model.generateContent([
        "Provide me the carbon emission value only (no units and no commas just straight up the integer) and the company name, separated by a |, from the certificate.",
        {
          fileData: {
            fileUri: uploadResult.file.uri,
            mimeType: uploadResult.file.mimeType,
          },
        },
      ]);

      const responseText = result.response.text();
      fs.unlinkSync(filePath);

      const parts = responseText.split("|");
      const data = {
        emission: parts[0]?.trim(),
        companyName: parts[1]?.trim(),
      };
      res.status(200).json(data);
    } catch (error) {
      console.error("Error processing certificate2:", error);
      res.status(500).json({ message: "Failed to process certificate2" });
    }
  });
});

export const setApproval = expressAsyncHandler(async (req, res) => {
  const { token_id, quantity } = req.body;
  if (token_id == null || !quantity) {
    res.status(400).json({ message: "Token ID and quantity are required" });
    return;
  }
  const nft = await prisma.nFT.findUnique({
    where: { tokenId: String(token_id) },
  });
  if (!nft) {
    res.status(404).json({ message: "NFT not found" });
    return;
  }
  await prisma.nFT.update({
    where: { tokenId: String(token_id) },
    data: {
      isAllowedToSell: true,
      quantity: String(Number(nft.quantity) - quantity),
    },
  });
  res.status(200).json({ message: "Approval set successfully" });
});
