import Web3 from 'web3';
import { abi_marketplace } from './abi/abi_marketplace';
import prisma from './lib/prisma';
import sendMail from './mail/sendMail';

const contractAddress = process.env.MARKETPLACE_CONTRACT_ADDRESS?.trim() || '';

let web3Instance: Web3;
let contract: any;

// Initialize Web3 and Contract
const initializeWeb3 = () => {
  const provider = new Web3.providers.WebsocketProvider('wss://api.avax-test.network/ext/bc/C/ws');

  provider.on('connect', () => console.log('WebSocket connected'));
  //@ts-ignore
  provider.on('error', (error: any) => {
    console.error('WebSocket error:', error);
    reconnect();
  });
  //@ts-ignore
  provider.on('end', (error: any) => {
    console.error('WebSocket connection ended:', error);
    reconnect();
  });

  web3Instance = new Web3(provider);
  contract = new web3Instance.eth.Contract(abi_marketplace, contractAddress);
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
const handleAuctionCreated = async (event: any) => {
  // console.log("Auction Created!");
  const { tokenId, createrId, basePrice, endTime } = event.returnValues;
  const htmlContent = `
    <h1>New Auction Created</h1>
    <p>Token ID: ${tokenId}</p>
    <p>Starting Price: ${basePrice}</p>
    <p>Auction End Time: ${new Date(Number(endTime) * 1000)}</p>
  `;
  await safeSendMail(htmlContent, createrId, 'New Auction Created');
};

const handleAuctionEnded = async (event: any) => {
  // console.log("Auction Ended!");
  const { tokenId, auctionStarter, winner, price } = event.returnValues;
  const htmlContent = `
    <h1>Auction Ended</h1>
    <p>Token ID: ${tokenId}</p>
    <p>Winning Bid: ${price}</p>
    <p>Winner Address: ${winner}</p>
  `;
  await prisma.nFT.update({
    where: { tokenId: String(tokenId) },
    data: { isAuction: false },
  });
  await safeSendMail(htmlContent, auctionStarter, 'Auction Ended');
  await safeSendMail(htmlContent, winner, 'Auction Ended');
};

const handleAuctionCancelled = async (event: any) => {
  // console.log("Auction Cancelled!");
  const { tokenId, auctionStarter, lastBidder } = event.returnValues;
  const htmlContent = `
    <h1>Auction Cancelled</h1>
    <p>Token ID: ${tokenId}</p>
    <p>Auction Starter: ${auctionStarter}</p>
    <p>Last Bidder: ${lastBidder}</p>
  `;
  await prisma.nFT.update({
    where: { tokenId: String(tokenId) },
    data: { isAuction: false },
  });
  await safeSendMail(htmlContent, auctionStarter, 'Auction Cancelled');
  await safeSendMail(htmlContent, lastBidder, 'Auction Cancelled');
};

const handleAuctionOutBid = async (event: any) => {
  // console.log("Auction OutBid!");
  const { tokenId, outBidder, amount } = event.returnValues;
  const htmlContent = `
    <h1>Auction OutBid</h1>
    <p>Token ID: ${tokenId}</p>
    <p>You have been outbid</p>
    <p>Current Auction Price: ${amount}</p>
  `;
  await safeSendMail(htmlContent, outBidder, 'Auction OutBid');
};

const handleBidPlaced = async (event: any) => {
  // console.log("Bid Placed!");
  const { tokenId, bidder, price } = event.returnValues;
  const htmlContent = `
    <h1>Bid Placed</h1>
    <p>Token ID: ${tokenId}</p>
    <p>Your bid has been placed</p>
    <p>Current Auction Price: ${price}</p>
  `;
  await safeSendMail(htmlContent, bidder, 'Bid Placed');
};

// Subscribe to events
const subscribeToEvents = () => {
  contract.events.AuctionCreated({ fromBlock: 'latest' }).on('data', handleAuctionCreated);
  contract.events.AuctionEnded({ fromBlock: 'latest' }).on('data', handleAuctionEnded);
  contract.events.AuctionCancelled({ fromBlock: 'latest' }).on('data', handleAuctionCancelled);
  contract.events.AuctionOutBid({ fromBlock: 'latest' }).on('data', handleAuctionOutBid);
  contract.events.BidPlaced({ fromBlock: 'latest' }).on('data', handleBidPlaced);
};

// Initialize and subscribe
initializeWeb3();
subscribeToEvents();
