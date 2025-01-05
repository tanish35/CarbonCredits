import Web3 from 'web3';
import { abi } from './abi/abi';
import prisma from './lib/prisma';
import sendMail from './mail/sendMail';

const rpcProviderURL = `wss://avax-testnet.g.alchemy.com/v2/${process.env.RPC_KEY}`;
const contractAddress = process.env.CONTRACT_ADDRESS;

let web3Instance;
let contract: any;

// Initialize Web3 and contract
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

// Helper to send emails if the email exists
const safeSendMail = async (htmlContent: string, walletAddress: string | null, subject: string) => {
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
    console.error(`Error fetching or sending email for wallet ${walletAddress}:`, error);
  }
};

// Subscribe to events
const subscribeToEvents = () => {
  contract.events.CreditTransferred({ fromBlock: 'latest' })
    .on('data', async (event: any) => {
      try {
        const { from, to, tokenId, amount } = event.returnValues;
        await prisma.$transaction(async (prisma) => {
          await prisma.wallet.update({
            where: { address: String(to) },
            data: { nfts: { connect: { id: String(tokenId) } } },
          });
          await prisma.wallet.update({
            where: { address: String(from) },
            data: { nfts: { disconnect: { id: String(tokenId) } } },
          });
          await prisma.transaction.create({
            data: {
              buyerWallet: String(to),
              sellerWallet: String(from),
              nftId: String(tokenId),
              price: String(amount),
            },
          });
          await prisma.nFT.update({
            where: { id: String(tokenId) },
            data: { walletAddress: String(to) },
          });
        });
        console.log('CreditTransferred:', { from, to, tokenId, amount });
      } catch (error) {
        console.error('Error handling CreditTransferred event:', error);
      }
    });

  contract.events.CreditMinted({ fromBlock: 'latest' })
    .on('data', async (event: any) => {
      try {
        const { to, tokenId, price, typeofCredit, quantity, certificateURI, expiryDate } = event.returnValues;
        await prisma.nFT.create({
          data: {
            tokenId: String(tokenId),
            price: String(price),
            certificateURI: String(certificateURI),
            expiryDate: new Date(Number(expiryDate)),
            walletAddress: String(to),
            typeofCredit: String(typeofCredit),
            quantity: String(quantity),
          },
        });
        console.log('CreditMinted:', { to, tokenId });
      } catch (error) {
        console.error('Error handling CreditMinted event:', error);
      }
    });

  contract.events.CreditRetired({ fromBlock: 'latest' })
    .on('data', async (event: any) => {
      try {
        const { owner, tokenId } = event.returnValues;
        await prisma.$transaction(async (prisma) => {
          await prisma.nFT.delete({ where: { id: String(tokenId) } });
          await prisma.creditRetirement.create({
            data: {
              nftId: String(tokenId),
              walletAddress: String(owner),
            },
          });
        });
        console.log('CreditRetired:', { owner, tokenId });
      } catch (error) {
        console.error('Error handling CreditRetired event:', error);
      }
    });

  contract.events.AuctionCreated({ fromBlock: 'latest' })
    .on('data', async (event: any) => {
      const { tokenId, createrAddress, startingPrice, auctionEndTime } = event.returnValues;
      const htmlContent = `
        <h1>New Auction Created</h1>
        <p>Token ID: ${tokenId}</p>
        <p>Starting Price: ${startingPrice}</p>
        <p>Auction End Time: ${new Date(Number(auctionEndTime) * 1000)}</p>
      `;
      await safeSendMail(htmlContent, createrAddress, 'New Auction Created');
    });

  contract.events.AuctionEnded({ fromBlock: 'latest' })
    .on('data', async (event: any) => {
      const { tokenId, createrAddress, winnerAddress, winningBid } = event.returnValues;
      const htmlContent = `
        <h1>Auction Ended</h1>
        <p>Token ID: ${tokenId}</p>
        <p>Winning Bid: ${winningBid}</p>
        <p>Winner Address: ${winnerAddress}</p>
      `;
      await safeSendMail(htmlContent, createrAddress, 'Auction Ended');
      await safeSendMail(htmlContent, winnerAddress, 'Auction Ended');
    });

  contract.events.AuctionCancelled({ fromBlock: 'latest' })
    .on('data', async (event: any) => {
      const { tokenId, auctionStarter, lastBidder } = event.returnValues;
      const htmlContent = `
        <h1>Auction Cancelled</h1>
        <p>Token ID: ${tokenId}</p>
        <p>Auction Starter: ${auctionStarter}</p>
        <p>Last Bidder: ${lastBidder}</p>
      `;
      await safeSendMail(htmlContent, auctionStarter, 'Auction Cancelled');
      await safeSendMail(htmlContent, lastBidder, 'Auction Cancelled');
    });

  contract.events.AuctionOutBid({ fromBlock: 'latest' })
    .on('data', async (event: any) => {
      const { tokenId, outBidder, amount } = event.returnValues;
      const htmlContent = `
        <h1>Auction OutBid</h1>
        <p>Token ID: ${tokenId}</p>
        <p>You have been outbid</p>
        <p>Current Auction Price: ${amount}</p>
      `;
      await safeSendMail(htmlContent, outBidder, 'Auction OutBid');
    });

  contract.events.BidPlaced({ fromBlock: 'latest' })
    .on('data', async (event: any) => {
      const { tokenId, bidder, amount } = event.returnValues;
      const htmlContent = `
        <h1>Bid Placed</h1>
        <p>Token ID: ${tokenId}</p>
        <p>Your bid has been placed</p>
        <p>Current Auction Price: ${amount}</p>
      `;
      await safeSendMail(htmlContent, bidder, 'Bid Placed');
    });
};

// Initialize and subscribe
initializeWeb3();
subscribeToEvents();
