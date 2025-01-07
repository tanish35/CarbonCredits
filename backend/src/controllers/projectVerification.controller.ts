import express from "express";
import expressAsyncHandler from "express-async-handler";
import multer from "multer";
import getEmissionReductionData from "./gemini.controller";
import uploadToPinata from "./pinataController";

//multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/certificate");
  },
  filename: (req, file, cb) => {
    cb(null, `${file.originalname}`);
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
  });

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
  res.status(200).json({
    emissionReduction: emissionReduction,
    certificateURI: certificateURI,
  });
});
