import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import prisma from "../lib/prisma";

export const buyNFT = asyncHandler(async (req: Request, res: Response) => {
    const {id} = req.params;
    const {nftId} = req.body;
    if (!nftId) {
        res.status(400).json({ message: "Please provide an NFT id" });
        return;
    }
    const user = await prisma.user.update({
        where: {
            id,
        },
        data: {
            nfts: {
                connect: {
                    id: nftId,
                },
            },
        },
    })
});

export const sellNFT = asyncHandler(async (req: Request, res: Response) => {
    const {id} = req.params;
    const {nftId} = req.body;
    if (!nftId) {
        res.status(400).json({ message: "Please provide an NFT id" });
        return;
    }
    const user = await prisma.user.update({
        where: {
            id,
        },
        data: {
            nfts: {
                disconnect: {
                    id: nftId,
                },
            },
        },
    })

});

export const NFTtrasactions = asyncHandler(async (req: Request, res: Response) => {
    const {id} = req.params;
    const {buyerId, sellerId, nftId} = req.body;
    if (!buyerId || !sellerId || !nftId) {
        res.status(400).json({ message: "Please provide all the required fields" });
        return;
    }
    const transaction = await prisma.transaction.create({
        // @ts-ignore
        data: {
            buyer: {
                connect: {
                    id: buyerId,
                },
            },
            nft: {
                connect: {
                    id: nftId,
                },
            },
        },
    })
    const user = await prisma.user.update({
        where: {
            id: sellerId,
        },
        data: {
            nfts: {
                disconnect: {
                    id: nftId,
                },
            },
        },
    })

    const user2 = await prisma.user.update({
        where: {
            id: buyerId,
        },
        data: {
            nfts: {
                connect: {
                    id: nftId,
                },
            },
        },
    });
    res.json(transaction);
});

export const getNFTs = asyncHandler(async (req: Request, res: Response) => {
    const {id} = req.params;
    const user = await prisma.user.findUnique({
        where: {
            id,
        },
        include: {
            nfts: true,
        },
    });
    res.json(user);
});

export const getNFT = asyncHandler(async (req: Request, res: Response) => {
    const {nftId} = req.body;
    if (!nftId) {
        res.status(400).json({ message: "Please provide an NFT id" });
        return;
    }
    const nft = await prisma.nFT.findUnique({
        where: {
            id: nftId,
        },
    });
    res.json(nft);
});

export const createNFT = asyncHandler(async (req: Request, res: Response) => {
    const {tokenId, tokenURI, ownerId, price, createdAt, creditType, quantity, expiryDate} = req.body;
    if (!tokenId || !tokenURI || !ownerId || !price || !createdAt || !creditType || !quantity || !expiryDate) {
        res.status(400).json({ message: "Please provide all the required fields" });
        return;
    }
    const nft = await prisma.nFT.create({
        data: {
            tokenId,
            tokenURI,
            ownerId,
            price,
            createdAt,
            creditType,
            quantity,
            expiryDate,
            owner: {
                connect: {
                    id: ownerId,
                }
            }
        },
    });
    res.json(nft);
});