import web3 from 'web3';
import { abi } from './abi/abi';
import prisma from './lib/prisma';
const rpcProviderURL = `https://avax-testnet.g.alchemy.com/v2/${process.env.RPC_KEY}`;
const web3Provider = new web3.providers.HttpProvider(rpcProviderURL);
const web3Instance = new web3(web3Provider);

const contractAddress = process.env.CONTRACT_ADDRESS;

const contract = new web3Instance.eth.Contract(abi, contractAddress);

contract.events.CreditTransferred({
    filter: { /* Optional: Filter conditions, e.g., address or value */ },
    fromBlock: 'latest' 
})
.on('data', async(event) => {
    console.log(event); 
    
    const {from, to, tokenId, amount} = event.returnValues;
    const price = amount;
    const buyer = await prisma.wallet.update({
        where: {
          address: String(to),
        },
        data: {
          nfts: {
            connect: {
              id: String(tokenId),
            },
          },
        }
      })
      const seller = await prisma.wallet.update({
        where: {
          address: String(from),
        },
        data: {
          nfts: {
            disconnect: {
              id: String(tokenId),
            },
          },
        }
      })
      const transaction = await prisma.transaction.create({
        data: {
          buyerWallet: String(to),
          sellerWallet: String(from),
          nftId: String(tokenId),
          price: String(price),
        },
      })
  
      const nft = await prisma.nFT.update({
        where: {
          id: String(tokenId),
        },
        data: {
          walletAddress: String(to),
        },
      })
    console.log(buyer, seller, transaction, nft);
})
// @ts-ignore
.on('error', (error:any) => {
    console.error(error);
});

contract.events.CreditMinted ({
    filter: { /* Optional: Filter conditions, e.g., address or value */ },
    fromBlock: 'latest' 
})
.on('data', async(event) => {
    const {to, tokenId, price, certificateURI, expiryDate} = event.returnValues;
    const nft = await prisma.nFT.create({
        data: {
            tokenId: String(tokenId),
            price: String(price),
            certificateURI: String(certificateURI),
            expiryDate: String(expiryDate),
            walletAddress: String(to),
        }
    })
})
// @ts-ignore
.on('error', (error:any) => {
    console.error(error);
})


contract.events.CreditRetired({
    filter: { /* Optional: Filter conditions, e.g., address or value */ },
    fromBlock: 'latest' 
})
.on('data', async(event) => {
    const {owner, tokenId} = event.returnValues;
    const nft = await prisma.nFT.delete({
        where: {
            id: String(tokenId),
        }
    })
    const creditRetire = await prisma.creditRetirement.create({
        data: {
            nftId: String(tokenId),
            walletAddress: String(owner),
        }
    })
})
// @ts-ignore
.on('error', (error:any) => {
    console.error(error);
})
