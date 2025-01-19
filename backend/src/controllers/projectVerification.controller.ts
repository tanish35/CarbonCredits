import expressAsyncHandler from "express-async-handler";
import multer from "multer";
import getEmissionReductionData from "./gemini.controller";
import uploadToPinata from "./pinataController";
import { setNFTs } from "./nftController";
import { ethers } from "ethers";
import { abi } from "../abi/abi";

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
