import express from "express";
import expressAsyncHandler from "express-async-handler";
import multer from "multer";
import getEmissionReductionData from "./gemini.controller";

//multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/certificate");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

export const getEmissionReduction = expressAsyncHandler(async (req, res) => {
  upload.single("certificate")(req, res, (err) => {
    if (err) {
      console.log(err);
      res.status(500).json("Error uploading file");
    }
    console.log(req.file);
  });

  const emissionReduction = await getEmissionReductionData();
  res.status(200).json({
    emissionReduction: emissionReduction+" tons of CO2",
  });
});
