import express from "express";
import expressAsyncHandler from "express-async-handler";
import multer from "multer";
import getEmissionReductionData from "./gemini.controller";
import uploadToPinata from "./pinataController";
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
    const {ownerId} = req.body;
    if (err) {
      console.error("Multer Error:", err);
      return res.status(500).json("Error uploading files");
    }
  
  

  let emissionReduction = await getEmissionReductionData();
  let certificateURI = await uploadToPinata(
    // @ts-ignore
    emissionReduction.companyName,
    // @ts-ignore
    emissionReduction.emission
  );
  certificateURI = `ipfs://${certificateURI}`;
  // @ts-ignore
  emissionReduction = emissionReduction.emission;
  // @ts-ignore
  if (!ownerId) {
    res.status(400).json({ message: "Please provide an owner id" });
    return;
  }

  try {
    // Define the parameters for the minting process
    const creditType = "Renewable Energy";
    const quantity  = 

      emissionReduction.toString().replace(/,/g, "");
    const expiryDate = Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60; // Expiry set to 1 year from now
    const rate = 8000000; // Replace with actual rate if needed

    // Perform minting
    const tx = await contract.mint(
      ownerId,
      creditType,
      // @ts-ignore
      BigInt(quantity),
      certificateURI,
      expiryDate,
      rate
    );

    // Wait for the transaction to be mined
    const receipt = await tx.wait();

    

    // Return success response with transaction details
    res.status(200).json({
      success: true,
      transactionHash: receipt.transactionHash,
      blockNumber: receipt.blockNumber,
      to: ownerId,
      quantity,
    });
  } catch (error) {
    console.error("Error minting NFT:", error);
    res.status(500).json({ error: "Failed to mint NFT" });
  }
}
)}
);
