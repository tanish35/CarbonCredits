import web3 from 'web3';
import { abi } from './abi/abi';
import { NFTtrasactions } from './controllers/nftController';
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
    
    const {from, to, tokenId} = event.returnValues;
    const transaction = await prisma.transaction.create({
        // @ts-ignore
        data: {
            buyer: {
                connect: {
                    id: String(from),
                },
            },
            nft: {
                connect: {
                    id: String(tokenId),
                },
            },
        },
    })
    const user = await prisma.user.update({
        where: {
            id: String(from),
        },
        data: {
            nfts: {
                disconnect: {
                    id: String(tokenId),
                },
            },
        },
    })

    const user2 = await prisma.user.update({
        where: {
            id: String(to),
        },
        data: {
            nfts: {
                connect: {
                    id: String(tokenId),
                },
            },
        },
    });
})
// @ts-ignore
.on('error', (error:any) => {
    console.error(error);
});

