import { createCanvas, loadImage, registerFont } from "canvas";
import { ethers } from "ethers";
import axios from "axios";

const abi = [
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "getCredit",
    outputs: [
      {
        components: [
          {
            internalType: "string",
            name: "typeofcredit",
            type: "string",
          },
          {
            internalType: "uint256",
            name: "quantity",
            type: "uint256",
          },
          {
            internalType: "string",
            name: "certificateURI",
            type: "string",
          },
          {
            internalType: "uint256",
            name: "expiryDate",
            type: "uint256",
          },
          {
            internalType: "bool",
            name: "retired",
            type: "bool",
          },
        ],
        internalType: "struct CarbonCredit.Credit",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

const NFT_CONTRACT_ADDRESS = "0x1A33A6F1A7D001A5767Cd9303831Eb3B9b916AEA";

export default async function handler(req, res) {
  try {
    const tokenId = req.query.id;

    if (!tokenId) {
      return res.status(400).send("Missing token ID");
    }
    const provider = new ethers.JsonRpcProvider(process.env.VITE_RPC_URL);
    const contract = new ethers.Contract(NFT_CONTRACT_ADDRESS, abi, provider);

    const creditData = await contract.getCredit(BigInt(tokenId));

    const ipfsUrl = creditData.certificateURI.replace(
      "ipfs://",
      "https://ipfs.io/ipfs/"
    );
    const metadata = await axios.get(ipfsUrl);
    const imageUrl = metadata.data.image.replace(
      "ipfs://",
      "https://ipfs.io/ipfs/"
    );

    const canvas = createCanvas(1200, 630);
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#1a1b1e";
    ctx.fillRect(0, 0, 1200, 630);

    const image = await loadImage(imageUrl);
    ctx.drawImage(image, 48, 115, 400, 400);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 48px Arial";
    ctx.fillText(`Carbon Credit #${tokenId}`, 496, 160);

    ctx.fillStyle = "#a1a1aa";
    ctx.font = "24px Arial";
    ctx.fillText(`Type: ${creditData.typeofcredit}`, 496, 220);
    ctx.fillText(`Quantity: ${creditData.quantity.toString()}`, 496, 260);
    ctx.fillText(
      `Status: ${creditData.retired ? "Retired" : "Active"}`,
      496,
      300
    );

    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "s-maxage=3600");

    const buffer = canvas.toBuffer("image/png");
    res.send(buffer);
  } catch (error) {
    console.error("Error generating image:", error);
    res.status(500).send("Error generating image");
  }
}
