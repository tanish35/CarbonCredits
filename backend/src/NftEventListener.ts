import Web3 from 'web3';
import { abi } from './abi/abi';
import prisma from './lib/prisma';
import sendMail from './mail/sendMail';

const contractAddress = process.env.CONTRACT_ADDRESS;

let web3Instance: Web3;
let contract: any;

// Initialize Web3 and Contract
const initializeWeb3 = () => {
  const provider = new Web3.providers.WebsocketProvider('wss://api.avax-test.network/ext/bc/C/ws');

  provider.on('connect', () => console.log('WebSocket connected'));
  provider.on('error', (error: any) => {
    console.error('WebSocket error:', error);
    reconnect();
  });
  provider.on('end', (error: any) => {
    console.error('WebSocket connection ended:', error);
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

// Helper to send emails
const safeSendMail = async (htmlContent: string, walletAddress: string | null, subject: string) => {
  if (!walletAddress) return;
  try {
    const userEmail = await prisma.wallet.findUnique({
      where: { address: walletAddress },
      select: { user: { select: { email: true } } },
    });
    if (userEmail?.user?.email) {
      await sendMail(htmlContent, userEmail.user.email, subject);
    }
  } catch (error) {
    console.error(`Error fetching or sending email for wallet ${walletAddress}:`, error);
  }
};

// Event Handlers
const handleCreditTransferred = async (event: any) => {
  console.log('Credit Transferred!');
  const { from, to, tokenId, amount } = event.returnValues;
  console.log({ from, to, tokenId: Number(tokenId), amount });
  try {
    const fromWallet = await prisma.wallet.findUnique({
      where: { address: String(from) },
    });
    const toWallet = await prisma.wallet.findUnique({
      where: { address: String(to) },
    });
    if (!fromWallet || !toWallet) {
      throw new Error('One or both wallets not found');
    }

    const nft = await prisma.nFT.findFirst({
      where: { tokenId: String(tokenId) },
    });

    if (!nft) {
      throw new Error('NFT not found');
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

    // console.log('CreditTransferred:', { from, to, tokenId, amount });
  } catch (error) {
    console.error('Error handling CreditTransferred event:', error);
  }
};

const handleCreditMinted = async (event: any) => {
  console.log('Credit Minted!');
  const {
    to,
    tokenId,
    price,
    typeofcredit,
    quantity,
    certificateURI,
    expiryDate,
  } = event.returnValues;
  try {
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
    // console.log(event.returnValues);
    // console.log('CreditMinted:', nft);
  } catch (error) {
    console.error('Error handling CreditMinted event:', error);
  }
};

const handleCreditRetired = async (event: any) => {
  console.log('Credit Retired!');
  const { owner, tokenId } = event.returnValues;
  try {
    await prisma.$transaction(async (prisma) => {
      await prisma.nFT.delete({ where: { tokenId: String(tokenId) } });
      await prisma.creditRetirement.create({
        data: {
          nftId: String(tokenId),
          walletAddress: String(owner),
        },
      });
    });
    // console.log('CreditRetired:', { owner, tokenId });
  } catch (error) {
    console.error('Error handling CreditRetired event:', error);
  }
};

// Subscribe to events
const subscribeToEvents = () => {
  contract.events.CreditTransferred({ fromBlock: 'latest' }).on('data', handleCreditTransferred);
  contract.events.CreditMinted({ fromBlock: 'latest' }).on('data', handleCreditMinted);
  contract.events.CreditRetired({ fromBlock: 'latest' }).on('data', handleCreditRetired);
};

// Initialize and subscribe
initializeWeb3();
subscribeToEvents();
