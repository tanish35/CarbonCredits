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
const abi_1 = require("./abi/abi");
const prisma_1 = __importDefault(require("./lib/prisma"));
const sendMail_1 = __importDefault(require("./mail/sendMail"));
const contractAddress = process.env.CONTRACT_ADDRESS;
let web3Instance;
let contract;
// Initialize Web3 and Contract
const initializeWeb3 = () => {
    const provider = new web3_1.default.providers.WebsocketProvider("wss://api.avax-test.network/ext/bc/C/ws");
    provider.on("connect", () => console.log("WebSocket connected"));
    provider.on("error", (error) => {
        console.error("WebSocket error:", error);
        reconnect();
    });
    provider.on("end", (error) => {
        console.error("WebSocket connection ended:", error);
        reconnect();
    });
    web3Instance = new web3_1.default(provider);
    contract = new web3Instance.eth.Contract(abi_1.abi, contractAddress);
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
const handleCreditTransferred = (event) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Credit Transferred!");
    const { from, to, tokenId, amount } = event.returnValues;
    console.log({ from, to, tokenId: Number(tokenId), amount });
    try {
        const fromWallet = yield prisma_1.default.wallet.findUnique({
            where: { address: String(from) },
        });
        const toWallet = yield prisma_1.default.wallet.findUnique({
            where: { address: String(to) },
        });
        if (!fromWallet || !toWallet) {
            throw new Error("One or both wallets not found");
        }
        const nft = yield prisma_1.default.nFT.findFirst({
            where: { tokenId: String(tokenId) },
        });
        if (!nft) {
            throw new Error("NFT not found");
        }
        yield prisma_1.default.$transaction((prisma) => __awaiter(void 0, void 0, void 0, function* () {
            yield prisma.nFT.update({
                where: { tokenId: String(tokenId) },
                data: {
                    walletAddress: String(to),
                    isAuction: false,
                    isDirectSale: false,
                    isAllowedToSell: false,
                },
            });
            // Log the transaction
            yield prisma.transaction.create({
                data: {
                    buyerWallet: String(to),
                    sellerWallet: String(from),
                    nft: {
                        connect: { tokenId: String(tokenId) },
                    },
                    price: String(amount),
                },
            });
        }));
        // console.log('CreditTransferred:', { from, to, tokenId, amount });
    }
    catch (error) {
        console.error("Error handling CreditTransferred event:", error);
    }
});
const handleCreditMinted = (event) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Credit Minted!");
    const { to, tokenId, price, typeofcredit, quantity, certificateURI, expiryDate, } = event.returnValues;
    try {
        const nft = yield prisma_1.default.nFT.create({
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
    }
    catch (error) {
        console.error("Error handling CreditMinted event:", error);
    }
});
const handleCreditRetired = (event) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Credit Retired!");
    const { owner, tokenId } = event.returnValues;
    try {
        yield prisma_1.default.$transaction((prisma) => __awaiter(void 0, void 0, void 0, function* () {
            // Fetch the NFT by tokenId
            const nFt = yield prisma.nFT.findFirst({
                where: {
                    tokenId: String(tokenId), // Ensure tokenId is in string format for the query
                },
            });
            if (!nFt) {
                console.error("NFT not found for tokenId:", tokenId);
                return; // Exit if NFT is not found
            }
            // Delete the NFT record
            yield prisma.nFT.delete({
                where: {
                    tokenId: String(tokenId),
                },
            });
            // Create a record for the credit retirement
            yield prisma.creditRetirement.create({
                data: {
                    nftId: String(tokenId),
                    walletAddress: String(owner),
                    quantity: nFt.quantity ? String(nFt.quantity) : "0", // Ensure quantity is not undefined
                },
            });
            console.log(`Credit retirement recorded for NFT with tokenId: ${tokenId}`);
        }));
    }
    catch (error) {
        console.error("Error handling CreditRetired event:", error);
    }
});
// Subscribe to events
const subscribeToEvents = () => {
    contract.events
        .CreditTransferred({ fromBlock: "latest" })
        .on("data", handleCreditTransferred);
    contract.events
        .CreditMinted({ fromBlock: "latest" })
        .on("data", handleCreditMinted);
    contract.events
        .CreditRetired({ fromBlock: "latest" })
        .on("data", handleCreditRetired);
};
// Initialize and subscribe
initializeWeb3();
subscribeToEvents();
