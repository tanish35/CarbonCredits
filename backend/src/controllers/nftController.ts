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
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
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
      }
    })
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
      }
    })
    const transaction = await prisma.transaction.create({
      data: {
        buyerWallet: buyerId,
        sellerWallet: sellerId,
        nftId,
        price
      },
    })

    const nft = await prisma.nFT.update({
      where: {
        id: nftId,
      },
      data: {
        walletAddress: buyerId,
      },
    })
    res.json({ message: "Transaction successful" });
});

export const getOwnedNFTs = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userNFTs = await prisma.user.findUnique({
    where: {
      id,
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
  
});

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

export const transferNFT = asyncHandler(async (req: Request, res: Response) => {
  const { from, to, tokenId } = req.body;
  if (!from || !to || !tokenId) {
    res.status(400).json({ message: "Please provide all the required fields" });
    return;
  }
  const balance = await provider.getBalance(from);
  console.log(provider);
  console.log("Balance:", balance.toString());
  const tx = await contract.safeTransferFrom(from, to, tokenId);
  await tx.wait();
  res.json({ message: "Token transferred successfully" });
});
