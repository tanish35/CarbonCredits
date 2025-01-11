"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const web3_1 = __importDefault(require("web3"));
const abi_marketplace_1 = require("./abi/abi_marketplace");
const prisma_1 = __importDefault(require("./lib/prisma"));
const sendMail_1 = __importDefault(require("./mail/sendMail"));
const contractAddress = process.env.MARKETPLACE_CONTRACT_ADDRESS;
let web3Instance;
let contract;
// Initialize Web3 and Contract
const initializeWeb3 = () => {
    const provider = new web3_1.default.providers.WebsocketProvider('wss://api.avax-test.network/ext/bc/C/ws');
    provider.on('connect', () => console.log('WebSocket connected'));
    //@ts-ignore
    provider.on('error', (error) => {
        console.error('WebSocket error:', error);
        reconnect();
    });
    //@ts-ignore
    provider.on('end', (error) => {
        console.error('WebSocket connection ended:', error);
        reconnect();
    });
    web3Instance = new web3_1.default(provider);
    contract = new web3Instance.eth.Contract(abi_marketplace_1.abi_marketplace, contractAddress);
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
const safeSendMail = (htmlContent, walletAddress, subject) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if (!walletAddress)
        return;
    try {
        const userEmail = yield prisma_1.default.wallet.findUnique({
            where: { address: walletAddress },
            select: { user: { select: { email: true } } },
        });
        if ((_a = userEmail === null || userEmail === void 0 ? void 0 : userEmail.user) === null || _a === void 0 ? void 0 : _a.email) {
            yield (0, sendMail_1.default)(htmlContent, userEmail.user.email, subject);
        }
    }
    catch (error) {
        console.error(`Error fetching or sending email for wallet ${walletAddress}:`, error);
    }
});
// Event Handlers
const handleAuctionCreated = (event) => __awaiter(void 0, void 0, void 0, function* () {
    // console.log("Auction Created!");
    const { tokenId, createrId, basePrice, endTime } = event.returnValues;
    const htmlContent = `
    <h1>New Auction Created</h1>
    <p>Token ID: ${tokenId}</p>
    <p>Starting Price: ${basePrice}</p>
    <p>Auction End Time: ${new Date(Number(endTime) * 1000)}</p>
  `;
    yield safeSendMail(htmlContent, createrId, 'New Auction Created');
});
const handleAuctionEnded = (event) => __awaiter(void 0, void 0, void 0, function* () {
    // console.log("Auction Ended!");
    const { tokenId, auctionStarter, winner, price } = event.returnValues;
    const htmlContent = `
    <h1>Auction Ended</h1>
    <p>Token ID: ${tokenId}</p>
    <p>Winning Bid: ${price}</p>
    <p>Winner Address: ${winner}</p>
  `;
    yield prisma_1.default.nFT.update({
        where: { tokenId: String(tokenId) },
        data: { isAuction: false },
    });
    yield safeSendMail(htmlContent, auctionStarter, 'Auction Ended');
    yield safeSendMail(htmlContent, winner, 'Auction Ended');
});
const handleAuctionCancelled = (event) => __awaiter(void 0, void 0, void 0, function* () {
    // console.log("Auction Cancelled!");
    const { tokenId, auctionStarter, lastBidder } = event.returnValues;
    const htmlContent = `
    <h1>Auction Cancelled</h1>
    <p>Token ID: ${tokenId}</p>
    <p>Auction Starter: ${auctionStarter}</p>
    <p>Last Bidder: ${lastBidder}</p>
  `;
    yield prisma_1.default.nFT.update({
        where: { tokenId: String(tokenId) },
        data: { isAuction: false },
    });
    yield safeSendMail(htmlContent, auctionStarter, 'Auction Cancelled');
    yield safeSendMail(htmlContent, lastBidder, 'Auction Cancelled');
});
const handleAuctionOutBid = (event) => __awaiter(void 0, void 0, void 0, function* () {
    // console.log("Auction OutBid!");
    const { tokenId, outBidder, amount } = event.returnValues;
    const htmlContent = `
    <h1>Auction OutBid</h1>
    <p>Token ID: ${tokenId}</p>
    <p>You have been outbid</p>
    <p>Current Auction Price: ${amount}</p>
  `;
    yield safeSendMail(htmlContent, outBidder, 'Auction OutBid');
});
const handleBidPlaced = (event) => __awaiter(void 0, void 0, void 0, function* () {
    // console.log("Bid Placed!");
    const { tokenId, bidder, price } = event.returnValues;
    const htmlContent = `
    <h1>Bid Placed</h1>
    <p>Token ID: ${tokenId}</p>
    <p>Your bid has been placed</p>
    <p>Current Auction Price: ${price}</p>
  `;
    yield safeSendMail(htmlContent, bidder, 'Bid Placed');
});
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
