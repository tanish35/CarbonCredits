import Web3 from "web3";
import { abi } from "./abi/abi";
import prisma from "./lib/prisma";
import sendMail from "./mail/sendMail";

const rpcProviderURL = `wss://avax-testnet.g.alchemy.com/v2/${process.env.RPC_KEY}`;
const contractAddress = process.env.CONTRACT_ADDRESS;

let web3Instance;
let contract: any;

// Initialize Web3 and contract
const initializeWeb3 = () => {
  const provider = new Web3.providers.WebsocketProvider(
    "wss://api.avax-test.network/ext/bc/C/ws"
  );

  provider.on("connect", () => console.log("WebSocket connected"));
  provider.on("error", (error: any) => {
    console.error("WebSocket error:", error);
    reconnect();
  });
  provider.on("end", (error: any) => {
    console.error("WebSocket connection ended:", error);
    reconnect();
  });

  web3Instance = new Web3(provider);
  contract = new web3Instance.eth.Contract(abi, contractAddress);
};

// Reconnect with exponential backoff
let reconnectAttempts = 0;
const reconnect = () => {
  reconnectAttempts++;
  const backoffTime = Math.min(5000 * reconnectAttempts, 30000); // Max 30s backoff
  console.log(`Reconnecting in ${backoffTime / 1000}s...`);
  setTimeout(() => {
    initializeWeb3();
    subscribeToEvents();
  }, backoffTime);
};

// Helper to send emails if the email exists
const safeSendMail = async (
  htmlContent: string,
  walletAddress: string | null,
  subject: string
) => {
  if (!walletAddress) return; // Skip if no wallet address
  try {
    const userEmail = await prisma.wallet.findUnique({
      where: { address: walletAddress },
      select: { user: { select: { email: true } } },
    });
    // @ts-ignore: Accessing nested email safely
    if (userEmail?.user?.email) {
      await sendMail(htmlContent, userEmail.user.email, subject);
    }
  } catch (error) {
    console.error(
      `Error fetching or sending email for wallet ${walletAddress}:`,
      error
    );
  }
};

// Subscribe to events
const subscribeToEvents = () => {
  contract.events
    .CreditTransferred({ fromBlock: "latest" })
    .on("data", async (event: any) => {
      try {
        const { from, to, tokenId, amount } = event.returnValues;
        console.log({ from, to, tokenId: Number(tokenId), amount });
        const fromWallet = await prisma.wallet.findUnique({
          where: { address: String(from) },
        });
        const toWallet = await prisma.wallet.findUnique({
          where: { address: String(to) },
        });
        if (!fromWallet || !toWallet) {
          throw new Error("One or both wallets not found");
        }

        const nft = await prisma.nFT.findFirst({
          where: { tokenId: String(tokenId) },
        });

        if (!nft) {
          throw new Error("NFT not found");
        }

        await prisma.$transaction(async (prisma) => {
          await prisma.nFT.update({
            where: { tokenId: String(tokenId) },
            data: {
              walletAddress: String(to), 
              isAuction: false,
              isDirectSale: false,
            },
          });
        
          // Log the transaction
          await prisma.transaction.create({
            data: {
              buyerWallet: String(to),
              sellerWallet: String(from),
              nft: {
                connect: { tokenId: String(tokenId) },
              },
              price: String(amount),
            },
          });
        });        

        console.log("CreditTransferred:", { from, to, tokenId, amount });
      } catch (error) {
        console.error("Error handling CreditTransferred event:", error);
      }
    });

  contract.events
    .CreditMinted({ fromBlock: "latest" })
    .on("data", async (event: any) => {
      try {
        const {
          to,
          tokenId,
          price,
          typeofcredit,
          quantity,
          certificateURI,
          expiryDate,
        } = event.returnValues;
        const nft = await prisma.nFT.create({
          data: {
            tokenId: String(tokenId),
            price: String(price),
            certificateURI: String(certificateURI),
            expiryDate: new Date(Number(parseInt(expiryDate) * 1000)),
            walletAddress: String(to),
            typeofCredit: String(typeofcredit),
            quantity: String(quantity),
          },
        });
        console.log(event.returnValues);
        console.log("CreditMinted:", nft);
      } catch (error) {
        console.error("Error handling CreditMinted event:", error);
      }
    });

  contract.events
    .CreditRetired({ fromBlock: "latest" })
    .on("data", async (event: any) => {
      try {
        const { owner, tokenId } = event.returnValues;
        await prisma.$transaction(async (prisma) => {
          await prisma.nFT.delete({ where: { tokenId: String(tokenId) } });
          await prisma.creditRetirement.create({
            data: {
              nftId: String(tokenId),
              walletAddress: String(owner),
            },
          });
        });
        console.log("CreditRetired:", { owner, tokenId });
      } catch (error) {
        console.error("Error handling CreditRetired event:", error);
      }
    });
};

// Initialize and subscribe
initializeWeb3();
subscribeToEvents();
