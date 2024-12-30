import { useState } from "react";
import {
  useAccount,
  useConnect,
  useDisconnect,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import {
  Box,
  Button,
  Input,
  VStack,
  Text,
  Spinner,
  HStack,
} from "@chakra-ui/react";

const abi = [
  {
    inputs: [
      { internalType: "address", name: "recipient", type: "address" },
      { internalType: "string", name: "tokenURI", type: "string" },
    ],
    name: "mintNFT",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
];

function MintPage() {
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { isConnected: accountConnected, address } = useAccount();
  const { data: hash, error, isPending, writeContract } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });

  const [recipient, setRecipient] = useState("");
  const [tokenURI, setTokenURI] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!recipient || !tokenURI) return;

    writeContract({
      address: "0x150Fa2411e99AC9D98E862496fc5E710b0aF63BB",
      abi,
      functionName: "mintNFT",
      args: [recipient, tokenURI],
    });
  }

  return (
    <Box
      maxW="lg"
      mx="auto"
      p={6}
      bg="gray.50"
      borderRadius="md"
      boxShadow="lg"
    >
      <VStack padding={6} align="stretch">
        <Text fontSize="2xl" fontWeight="bold" textAlign="center">
          Mint Carbon Credits NFT
        </Text>

        {!accountConnected ? (
          <VStack padding={4} align="center">
            <Text>Please connect your wallet to mint the NFT.</Text>
            <HStack padding={4}>
              {connectors.map((connector) => (
                <Button
                  key={connector.id}
                  onClick={() => connect({ connector })}
                  colorScheme="teal"
                >
                  Connect with {connector.name}
                </Button>
              ))}
            </HStack>
          </VStack>
        ) : (
          <Box>
            <Text>Wallet Connected: {address}</Text>
            <Button mt={4} colorScheme="red" onClick={() => disconnect()}>
              Disconnect Wallet
            </Button>
            <form onSubmit={submit}>
              <Box mt={6}>
                <label htmlFor="recipient">Recipient Address</label>
                <Input
                  id="recipient"
                  placeholder="Enter Recipient Address"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  required
                />
              </Box>
              <Box mt={4}>
                <label htmlFor="tokenURI">Token URI</label>
                <Input
                  id="tokenURI"
                  placeholder="Enter Token URI"
                  value={tokenURI}
                  onChange={(e) => setTokenURI(e.target.value)}
                  required
                />
              </Box>
              <Button
                type="submit"
                mt={4}
                colorScheme="teal"
                disabled={!recipient || !tokenURI}
              >
                {isPending ? "Confirming..." : "Mint"}
              </Button>
            </form>
          </Box>
        )}

        {hash && !isConfirming && (
          <Box mt={4} p={4} bg="gray.100" borderRadius="md">
            <Text>
              <strong>Transaction Hash:</strong> {hash}
            </Text>
          </Box>
        )}

        {isConfirming && (
          <Box mt={4} p={4} bg="yellow.100" borderRadius="md">
            <Spinner />
            <Text>Waiting for confirmation...</Text>
          </Box>
        )}

        {isConfirmed && (
          <Box mt={4} p={4} bg="green.100" borderRadius="md">
            <Text>Transaction confirmed!</Text>
          </Box>
        )}

        {error && (
          <Box mt={4} p={4} bg="red.100" borderRadius="md">
            <Text>Error: {error.message}</Text>
          </Box>
        )}
      </VStack>
    </Box>
  );
}

export default MintPage;
