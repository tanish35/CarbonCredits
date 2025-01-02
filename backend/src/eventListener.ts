import web3 from 'web3';
import { abi } from './abi/abi';
import prisma from './lib/prisma';
const rpcProviderURL = `https://avax-testnet.g.alchemy.com/v2/${process.env.PRIVATE_KEY}`;
const web3Provider = new web3.providers.HttpProvider(rpcProviderURL);
const web3Instance = new web3(web3Provider);

const contractAddress = process.env.CONTRACT_ADDRESS;

const contract = new web3Instance.eth.Contract(abi, contractAddress);

contract.events.CreditTransferred({
    fromBlock: 'latest',
  })
    .on('data', async (event) => {
      try {
        const { from, to, tokenId, amount } = event.returnValues;
        const price = amount;
  
        // Use Prisma transaction to ensure atomicity
        const [buyer, seller, transaction, nft] = await prisma.$transaction([
          prisma.wallet.update({
            where: { address: String(to) },
            data: {
              nfts: {
                connect: { id: String(tokenId) },
              },
            },
          }),
          prisma.wallet.update({
            where: { address: String(from) },
            data: {
              nfts: {
                disconnect: { id: String(tokenId) },
              },
            },
          }),
          prisma.transaction.create({
            data: {
              buyerWallet: String(to),
              sellerWallet: String(from),
              nftId: String(tokenId),
              price: String(price),
            },
          }),
          prisma.nFT.update({
            where: { id: String(tokenId) },
            data: { walletAddress: String(to) },
          }),
        ]);
  
        console.log(buyer, seller, transaction, nft);
      } catch (error) {
        console.error('Error handling CreditTransferred event:', error);
      }
    })
    // @ts-ignore
    .on('error', (error) => {
      console.error('CreditTransferred listener error:', error);
    });
  
contract.events.CreditMinted({
    fromBlock: 'latest',
  })
    .on('data', async (event) => {
      try {
        const { to, tokenId, price, certificateURI, expiryDate } = event.returnValues;
  
        // Use Prisma transaction to ensure atomicity
        const nft = await prisma.$transaction([
          prisma.nFT.create({
            data: {
              tokenId: String(tokenId),
              price: String(price),
              certificateURI: String(certificateURI),
              expiryDate: new Date(Number(expiryDate)),
              walletAddress: String(to),
            },
          }),
        ]);
  
        console.log('NFT Minted:', nft);
      } catch (error) {
        console.error('Error handling CreditMinted event:', error);
      }
    })
    // @ts-ignore
    .on('error', (error) => {
      console.error('CreditMinted listener error:', error);
    });
  


contract.events.CreditRetired({
        fromBlock: 'latest',
      })
        .on('data', async (event) => {
          try {
            const { owner, tokenId } = event.returnValues;
      
            // Use Prisma transaction to ensure atomicity
            const [deletedNFT, creditRetire] = await prisma.$transaction([
              prisma.nFT.delete({
                where: { id: String(tokenId) },
              }),
              prisma.creditRetirement.create({
                data: {
                  nftId: String(tokenId),
                  walletAddress: String(owner),
                },
              }),
            ]);
      
            console.log('NFT Retired:', deletedNFT, creditRetire);
          } catch (error) {
            console.error('Error handling CreditRetired event:', error);
          }
        })
        // @ts-ignore
        .on('error', (error) => {
          console.error('CreditRetired listener error:', error);
        });
      
