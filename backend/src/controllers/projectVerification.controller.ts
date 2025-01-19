import expressAsyncHandler from "express-async-handler";
import multer from "multer";
import {
  getEmissionReductionData,
  checkAchievement,
} from "./gemini.controller";
import uploadToPinata from "./pinataController";
import { setNFTs } from "./nftController";
import { ethers } from "ethers";
import { abi } from "../abi/abi";
import prisma from "../lib/prisma";

const PRIVATE_KEY = process.env.PRIVATE_KEY;
if (!PRIVATE_KEY) {
  throw new Error("Please provide a private key");
}
const RPC_URL = process.env.RPC_URL;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
if (!RPC_URL || !CONTRACT_ADDRESS) {
  throw new Error("Please provide a RPC URL and a contract address");
}
const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, wallet);

//multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/certificate");
  },
  filename: (req, file, cb) => {
    if (file.fieldname === "certificate") {
      cb(null, "cert.jpeg");
    } else if (file.fieldname === "companyLogo") {
      cb(null, "companyLogo.jpeg");
    } else if (file.fieldname === "achievement") {
      cb(null, "achievement.jpeg");
    }
  },
});

const upload = multer({ storage: storage });

export const getEmissionReduction = expressAsyncHandler(async (req, res) => {
  upload.fields([
    { name: "certificate", maxCount: 1 },
    { name: "companyLogo", maxCount: 1 },
  ])(req, res, async (err) => {
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
      let emissionReduction = await getEmissionReductionData();
      let certificateURI = await uploadToPinata(
        // @ts-ignore
        emissionReduction.companyName,
        // @ts-ignore

        emissionReduction.emission
      );
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
      const tx = await contract.mint(
        ownerId,
        creditType,
        quantity,
        certificateURI,
        expiryDate,
        rate
      );

      // Wait for the transaction to be mined
      const receipt = await tx.wait();
      console.log("Transaction receipt:", receipt);
      setNFTs(ownerId);

      // Return success response with transaction details
      res.status(200).json({
        success: true,
        transactionHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        to: ownerId,
        quantity: quantity.toString(),
      });
    } catch (error) {
      console.error("Error minting NFT:", error);
      res.status(500).json({ error: "Failed to mint NFT" });
    }
  });
});

export const addAchievement = expressAsyncHandler(async (req, res) => {
  upload.fields([{ name: "achievement", maxCount: 1 }])(
    req,
    res,
    async (err) => {
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
        const achievementData = await checkAchievement();

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

        await prisma.achievement.create({
          data: {
            userId: user.id,
            description: achievementData.description,
            points: parseInt(achievementData.points),
            type: achievementData.type,
          },
        });

        return res.status(200).json({
          ...achievementData,
        });
      } catch (error) {
        console.error("Error verifying achievement:", error);
        return res.status(500).json({
          success: false,
          message: "Error processing achievement verification",
        });
      }
    }
  );
});

// model Achievement {
//   id        String   @id @default(cuid())
//   userId    String
//   user      User    @relation(fields: [userId], references: [id])
//   type      AchievementType @default(Green_Pioneer)
//   description String @default("Start your journey to become a Green Pioneer")
//   points    Int @default(0)
//   createdAt DateTime @default(now())
// }
