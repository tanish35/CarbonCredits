import Web3 from 'web3';
import { abi } from './abi/abi';
import prisma from './lib/prisma';

const rpcProviderURL = `wss://avax-testnet.g.alchemy.com/v2/${process.env.RPC_KEY}`;
const contractAddress = process.env.CONTRACT_ADDRESS;

let web3Instance;
let contract:any;

const initializeWeb3 = () => {
  const provider = new Web3.providers.WebsocketProvider('wss://api.avax-test.network/ext/bc/C/ws');

  provider.on('connect', () => {
    console.log('WebSocket connected');
  });

  provider.on('error', (error:any) => {
    console.error('WebSocket error:', error);
    reconnect();
  });

  provider.on('end', (error:any) => {
    console.error('WebSocket connection ended:', error);
    reconnect();
  });

  web3Instance = new Web3(provider);
  contract = new web3Instance.eth.Contract(abi, contractAddress);
};

const reconnect = () => {
  console.log('Attempting to reconnect...');
  setTimeout(() => {
    initializeWeb3();
    subscribeToEvents();
  }, 5000); // Reconnect after 5 seconds
};

const subscribeToEvents = () => {
  contract.events.CreditTransferred({ fromBlock: 'latest' })
    .on('data', async (event:any) => {
      try {
        const { from, to, tokenId, amount } = event.returnValues;
        const price = amount;

        await prisma.$transaction(async (prisma) => {
          const buyer = await prisma.wallet.update({
            where: { address: String(to) },
            data: {
              nfts: {
                connect: { id: String(tokenId) },
              },
            },
          });

          const seller = await prisma.wallet.update({
            where: { address: String(from) },
            data: {
              nfts: {
                disconnect: { id: String(tokenId) },
              },
            },
          });

          const transaction = await prisma.transaction.create({
            data: {
              buyerWallet: String(to),
              sellerWallet: String(from),
              nftId: String(tokenId),
              price: String(price),
            },
          });

          const nft = await prisma.nFT.update({
            where: { id: String(tokenId) },
            data: { walletAddress: String(to) },
          });

          console.log('CreditTransferred:', { buyer, seller, transaction, nft });
        });
      } catch (error) {
        console.error('Error handling CreditTransferred event:', error);
      }
    })
    

  contract.events.CreditMinted({ fromBlock: 'latest' })
    .on('data', async (event:any) => {
      try {
        const { to, tokenId, price, certificateURI, expiryDate } = event.returnValues;

        await prisma.$transaction(async (prisma) => {
          const nft = await prisma.nFT.create({
            data: {
              tokenId: String(tokenId),
              price: String(price),
              certificateURI: String(certificateURI),
              expiryDate: new Date(Number(expiryDate)),
              walletAddress: String(to),
            },
          });

          console.log('CreditMinted:', nft);
        });
      } catch (error) {
        console.error('Error handling CreditMinted event:', error);
      }
    })
    
  contract.events.CreditRetired({ fromBlock: 'latest' })
    .on('data', async (event:any) => {
      try {
        const { owner, tokenId } = event.returnValues;

        await prisma.$transaction(async (prisma) => {
          const deletedNFT = await prisma.nFT.delete({
            where: { id: String(tokenId) },
          });

          const creditRetire = await prisma.creditRetirement.create({
            data: {
              nftId: String(tokenId),
              walletAddress: String(owner),
            },
          });

          console.log('CreditRetired:', { deletedNFT, creditRetire });
        });
      } catch (error) {
        console.error('Error handling CreditRetired event:', error);
      }
    })
    
};

// Initialize and subscribe
initializeWeb3();
subscribeToEvents();
