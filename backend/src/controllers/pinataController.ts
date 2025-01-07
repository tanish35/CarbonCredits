import { PinataSDK } from "pinata-web3";
import fs from "fs";
import path from "path";

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT!,
  pinataGateway: "blue-glamorous-spider-989.mypinata.cloud",
});

async function uploadToPinata(companyName: string, emissionAmount: string) {
  try {
    const logoPath = path.resolve(
      __dirname,
      "../../public/certificate/companyLogo.jpg"
    );
    const logoFile = new File([fs.readFileSync(logoPath)], "companyLogo.jpg", {
      type: "image/jpg",
    });
    const logoUpload = await pinata.upload.file(logoFile);
    fs.unlinkSync(logoPath);

    console.log("Logo CID:", logoUpload.IpfsHash);
    const metadata = {
      name: `Carbon Credit #2`,
      description: `This NFT represents ${emissionAmount} of CO2 offset.`,
      image: `ipfs://${logoUpload.IpfsHash}`,
      attributes: [
        { trait_type: "Type", value: "Carbon Credit" },
        { trait_type: "Amount", value: emissionAmount },
        { trait_type: "Company Name", value: companyName },
      ],
    };
    const metadataFile = new File([JSON.stringify(metadata)], "metadata.json", {
      type: "application/json",
    });
    const metadataUpload = await pinata.upload.file(metadataFile);

    console.log("Metadata CID:", metadataUpload.IpfsHash);

    return metadataUpload.IpfsHash;
  } catch (error) {
    console.error("Error uploading to Pinata:", error);
    throw error;
  }
}

export default uploadToPinata;
