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