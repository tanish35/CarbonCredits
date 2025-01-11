import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import prisma from "../lib/prisma";
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
const wallet = new ethers.Wallet(
  process.env.PRIVATE_KEY?.replace(/^0x/, '') || ''
);
const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, wallet);

export const NFTtrasactions = asyncHandler(
  async (req: Request, res: Response) => {
    const { buyerId, sellerId, nftId, price } = req.body;
    if (!buyerId || !sellerId || !nftId) {
      res
        .status(400)
        .json({ message: "Please provide all the required fields" });
      return;
    }
    const buyer = await prisma.wallet.update({
      where: {
        address: buyerId,
      },
      data: {
        nfts: {
          connect: {
            id: nftId,
          },
        },
      },
    });
    const seller = await prisma.wallet.update({
      where: {
        address: sellerId,
      },
      data: {
        nfts: {
          disconnect: {
            id: nftId,
          },
        },
      },
    });
    const transaction = await prisma.transaction.create({
      data: {
        buyerWallet: buyerId,
        sellerWallet: sellerId,
        nftId,
        price,
      },
    });

    const nft = await prisma.nFT.update({
      where: {
        id: nftId,
      },
      data: {
        walletAddress: buyerId,
      },
    });
    res.json({ message: "Transaction successful" });
  }
);

export const getOwnedNFTs = asyncHandler(
  async (req: Request, res: Response) => {
    const userNFTs = await prisma.user.findUnique({
      where: {
        // @ts-ignore
        id: req.user.id,
      },
      include: {
        wallets: {
          include: {
            nfts: true,
          },
        },
      },
    });

    res.json(userNFTs);
  }
);

export const getNFT = asyncHandler(async (req: Request, res: Response) => {
  const { nftId } = req.body;
  if (!nftId) {
    res.status(400).json({ message: "Please provide an NFT id" });
    return;
  }
  const nft = await prisma.nFT.findUnique({
    where: {
      tokenId: nftId,
    },
  });
  res.json(nft);
});

export const getAllNFTs = asyncHandler(async (_req: Request, res: Response) => {
  const nfts = await prisma.nFT.findMany();
  res.json(nfts);
});

// export const NFTMint = asyncHandler(async (req: Request, res: Response) => {
//   const { ownerId } = req.body;
//   if (!ownerId) {
//     res.status(400).json({ message: "Please provide an owner id" });
//     return;
//   }

//   try {
//     // Define the parameters for the minting process
//     const creditType = "Renewable Energy";
//     const quantity = 100;
//     const certificateURI = "ipfs://bafkreia7beck5t6nhonoycmmdfhrefrgnu5c2rru42ad5qog3nlpu7nfs4"; // Replace with actual URI if needed
//     const expiryDate = Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60; // Expiry set to 1 year from now
//     const rate = 8000000; // Replace with actual rate if needed

//     // Perform minting
//     const tx = await contract.mint(
//       ownerId,
//       creditType,
//       BigInt(quantity),
//       certificateURI,
//       expiryDate,
//       rate
//     );

//     // Wait for the transaction to be mined
//     const receipt = await tx.wait();

    

//     // Return success response with transaction details
//     res.status(200).json({
//       success: true,
//       transactionHash: receipt.transactionHash,
//       blockNumber: receipt.blockNumber,
//       to: ownerId,
//       quantity,
//     });
//   } catch (error) {
//     console.error("Error minting NFT:", error);
//     res.status(500).json({ error: "Failed to mint NFT" });
//   }
// });
// export const createNFT = asyncHandler(async (req: Request, res: Response) => {
//   const {
//     tokenId,
//     tokenURI,
//     ownerId,
//     price,
//     createdAt,
//     creditType,
//     quantity,
//     expiryDate,
//   } = req.body;
//   if (
//     !tokenId ||
//     !tokenURI ||
//     !ownerId ||
//     !price ||
//     !createdAt ||
//     !creditType ||
//     !quantity ||
//     !expiryDate
//   ) {
//     res.status(400).json({ message: "Please provide all the required fields" });
//     return;
//   }
//   const nft = await prisma.nFT.create({
//     data: {
//       tokenId,
//       tokenURI,
//       ownerId,
//       price,
//       createdAt,
//       creditType,
//       quantity,
//       expiryDate,
//       owner: {
//         connect: {
//           id: ownerId,
//         },
//       },
//     },
//   });
//   res.json(nft);
// });

//@ts-ignore
export const transferNFT = asyncHandler(async (req: Request, res: Response) => {
  const { from, to, tokenId } = req.body;

  if (!from || !to || !tokenId) {
    return res
      .status(400)
      .json({ message: "Please provide all the required fields" });
  }

  try {
    const tx = await contract.safeTransferFrom(from, to, tokenId);
    const receipt = await tx.wait();
    res.json({
      message: "Token transferred successfully",
      transactionHash: tx.hash,
      receipt,
    });
  } catch (error: any) {
    console.error("Transfer Error:", error);
    const errorMessage =
      error.reason ||
      "Failed to transfer NFT. Please check the input data and try again.";
    res.status(500).json({ message: errorMessage });
  }
});

export const getNFTstatus = asyncHandler(
  async (req: Request, res: Response) => {
    let { tokenId } = req.body;
    if (tokenId == null) {
      res.status(400).json({ message: "Please provide an NFT id" });
      return;
    }
    tokenId = String(tokenId);
    const nft = await prisma.nFT.findUnique({
      select: {
        isDirectSale: true,
        isAuction: true,
      },
      where: {
        tokenId,
      },
    });
    if (!nft) {
      res.status(404).json({ message: "NFT not found" });
      return;
    }
    res.json({ isDirectSale: nft.isDirectSale, isAuction: nft.isAuction });
  }
);

export const setNFTstatus = asyncHandler(
  async (req: Request, res: Response) => {
    const { tokenId, type } = req.body;
    if (!tokenId || !type) {
      res
        .status(400)
        .json({ message: "Please provide all the required fields" });
      return;
    }
    const nft = await prisma.nFT.update({
      where: {
        tokenId,
      },
      data: {
        isDirectSale: type === "directSell",
        isAuction: type === "auction",
      },
    });
    res.json(nft);
  }
);

export const getMarketPlaceNFTs = asyncHandler(
  async (_req: Request, res: Response) => {
    const owner = process.env.OWNER_ADDRESS;
    if (!owner) {
      res.status(400).json({ message: "Please provide an owner address" });
      return;
    }
    const nfts = await prisma.nFT.findMany({
      where: {
        walletAddress: owner,
      },
    });
    res.json(nfts);
  }
);
