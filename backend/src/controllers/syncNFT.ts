import { ethers } from "ethers";
import prisma from "../lib/prisma";

const ERC721_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function totalSupply() view returns (uint256)",
  "function getCredit(uint256 tokenId) view returns (tuple(uint256 id, string typeofcredit, uint256 quantity, string certificateURI, uint256 expiryDate, bool retired))",
  "function getRate(uint256 tokenId) view returns (uint256)",
];

export async function syncNFTHolders() {
  try {
    const provider = new ethers.JsonRpcProvider(
      "https://api.avax-test.network/ext/bc/C/rpc"
    );
    const contract = new ethers.Contract(
      process.env.CONTRACT_ADDRESS || "",
      ERC721_ABI,
      provider
    );

    const totalSupply = await contract.totalSupply();
    console.log("Total supply:", totalSupply.toString());

    for (let tokenId = 0; tokenId < totalSupply; tokenId++) {
      try {
        const walletAddress = await contract.ownerOf(BigInt(tokenId));
        let wallet = await prisma.wallet.findUnique({
          where: {
            address: walletAddress,
          },
        });

        if (!wallet) {
          const dummyUser = await prisma.user.upsert({
            where: {
              email: "tanishmajumdar34@gmail.com",
            },
            create: {
              email: "tanishmajumdar34@gmail.com",
              password: "",
              name: "Tanish Majumdar",
            },
            update: {},
          });

          wallet = await prisma.wallet.create({
            data: {
              address: walletAddress,
              userId: dummyUser.id,
            },
          });
        }

        const creditDetails = await contract.getCredit(BigInt(tokenId));
        console.log(creditDetails);
        const { certificateURI, quantity } = creditDetails;

        const price = await contract.getRate(BigInt(tokenId));

        await prisma.nFT.upsert({
          where: {
            tokenId: tokenId.toString(),
          },
          create: {
            tokenId: tokenId.toString(),
            walletAddress: wallet.address,
            price: price.toString(),
            quantity: quantity.toString(),
            certificateURI: certificateURI,
            createdAt: new Date(),
          },
          update: {
            walletAddress: wallet.address,
            price: price.toString(),
            quantity: quantity.toString(),
            certificateURI: certificateURI,
          },
        });

        console.log(`Updated token ${tokenId} for wallet ${walletAddress}`);
      } catch (error) {
        console.error(`Error processing token ${tokenId}:`, error);
        continue;
      }
    }

    return { success: true, message: "NFT holders sync completed" };
  } catch (error) {
    console.error("Error syncing NFT holders:", error);
    throw new Error("Failed to sync NFT holders");
  }
}

export async function syncNFTHoldersHandler(req: any, res: any) {
  try {
    const result = await syncNFTHolders();
    res.json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}
