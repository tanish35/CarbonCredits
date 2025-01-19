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
  process.env.PRIVATE_KEY?.replace(/^0x/, "") || "",
  provider
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
      where: { address: buyerId },
      data: {
        nfts: {
          connect: { id: nftId },
        },
      },
    });

    const seller = await prisma.wallet.update({
      where: { address: sellerId },
      data: {
        nfts: {
          disconnect: { id: nftId },
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
      where: { id: nftId },
      data: { walletAddress: buyerId },
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
    where: { tokenId: nftId },
  });
  res.json(nft);
});

export const getAllNFTs = asyncHandler(async (_req: Request, res: Response) => {
  const nfts = await prisma.nFT.findMany();
  res.json(nfts);
});

export const setNFTs = async (walletAddress: string): Promise<string> => {
  if (!walletAddress) {
    throw new Error("Wallet address is required.");
  }

  try {
    const credits = await contract.getCreditByOwner(walletAddress);

    for (const credit of credits) {
      const {
        id: tokenId,
        typeofcredit: typeofCredit,
        quantity,
        certificateURI,
        expiryDate,
        retired,
      } = credit;
      const price = await contract.getRate(tokenId);
      if (!retired) {
        await prisma.nFT.upsert({
          where: { tokenId: tokenId.toString() },
          update: {
            walletAddress,
            typeofCredit,
            quantity: quantity.toString(),
            certificateURI,
            expiryDate: expiryDate ? new Date(Number(expiryDate) * 1000) : null,
            price: price.toString(),
          },
          create: {
            tokenId: tokenId.toString(),
            typeofCredit,
            quantity: quantity.toString(),
            certificateURI,
            expiryDate: expiryDate ? new Date(Number(expiryDate) * 1000) : null,
            price: price.toString(),
            wallet: { connect: { address: walletAddress } },
          },
        });
      }
    }

    return "NFTs updated successfully.";
  } catch (error) {
    console.error("Error processing NFTs:", error);
    throw new Error("Failed to process NFTs.");
  }
};

export const transferNFT = asyncHandler(async (req: Request, res: Response) => {
  const { from, to, tokenId } = req.body;

  if (!from || !to || !tokenId) {
    res.status(400).json({ message: "Please provide all the required fields" });
    return;
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

export const getAllNFTRetired = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const allNftRetired = await prisma.wallet.findMany({
        include: {
          creditRetirement: true,
        },
      });

      const result = allNftRetired.map((wallet) => {
        const totalQuantity = wallet.creditRetirement.reduce(
          (acc, curr) => acc + Number(curr.quantity),
          0
        );
        return {
          walletAddress: wallet.address,
          tokensRetired: wallet.creditRetirement.length,
          quantity: totalQuantity,
        };
      });

      res.json(result);
    } catch (error) {
      console.error("Error fetching retired NFTs:", error);
      res.status(500).json({ message: "Failed to fetch retired NFTs" });
    }
  }
);

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
      where: { tokenId },
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
      where: { tokenId },
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
      where: { walletAddress: owner },
    });
    res.json(nfts);
  }
);
