import { useState, useEffect } from "react";
import {
  useAccount,
  useConnect,
  useDisconnect,
  useWaitForTransactionReceipt,
  useWriteContract,
  useReadContract,
  useBalance,
} from "wagmi";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
// import { format, parse } from "date-fns";

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
      { internalType: "address", name: "to", type: "address" },
      { internalType: "string", name: "typeofcredit", type: "string" },
      { internalType: "uint256", name: "quantity", type: "uint256" },
      { internalType: "string", name: "certificateURI", type: "string" },
      { internalType: "uint256", name: "expiryDate", type: "uint256" },
    ],
    name: "mint",
    outputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "getRate",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "from", type: "address" },
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint256", name: "tokenId", type: "uint256" },
    ],
    name: "transferCredit",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
    name: "retire",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "minter", type: "address" }],
    name: "addMinter",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "rate", type: "uint256" }],
    name: "setRate",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

function MintPage() {
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { isConnected: accountConnected, address } = useAccount();
  const { data: hash, error, writeContract } = useWriteContract();
  const [paymentAmount, setPaymentAmount] = useState("");

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });
  const { data: balance, isError, isLoading } = useBalance({ address });

  // const [recipient, setRecipient] = useState("");
  const [tokenId, setTokenId] = useState("");
  const [newMinter, setNewMinter] = useState("");
  const [rate, setRate] = useState("");

  const [to, setTo] = useState("");
  const [typeofcredit, setTypeOfCredit] = useState("");
  const [quantity, setQuantity] = useState("");
  const [certificateURI, setCertificateURI] = useState("");
  const [expiryDate, setExpiryDate] = useState<Date | null>(null);

  const contractAddress = "0xabB026C81ba331999b2343c417aC15dB9216F3bD";

  const {
    data: nftRate,
    isLoading: isRateLoading,
    isError: isRateError,
  } = useReadContract({
    address: contractAddress,
    abi,
    functionName: "getRate",
  });

  useEffect(() => {
    // console.log(nftRate);
    if (nftRate) {
      setPaymentAmount(nftRate.toString());
    } else {
      setPaymentAmount("10000000");
    }
  }, [nftRate]);

  const mintNFT = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!to || !typeofcredit || !quantity || !certificateURI || !expiryDate) {
      console.log("to", to);
      console.log("typeofcredit", typeofcredit);
      console.log("quantity", quantity);
      console.log("certificateURI", certificateURI);
      console.log("expiryDate", expiryDate);
      return;
    }

    const expiryTimestamp = Math.floor(expiryDate.getTime() / 1000);
    console.log(expiryDate);
    console.log(expiryTimestamp);

    writeContract({
      address: contractAddress,
      abi,
      functionName: "mint",
      args: [
        to,
        typeofcredit,
        BigInt(quantity),
        certificateURI,
        BigInt(expiryTimestamp),
      ],
    });
  };

  async function submitTransfer(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!to || !tokenId || !paymentAmount) {
      return;
    }

    writeContract({
      address: contractAddress,
      abi,
      functionName: "transferCredit",
      args: [address, to, tokenId],
      value: BigInt(paymentAmount),
    });
  }

  async function retireNFT(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!tokenId) return;
    writeContract({
      address: contractAddress,
      abi,
      functionName: "retire",
      args: [tokenId],
    });
  }

  async function addNewMinter(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!newMinter) return;
    writeContract({
      address: contractAddress,
      abi,
      functionName: "addMinter",
      args: [newMinter],
    });
  }

  async function updateRate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!rate) return;
    writeContract({
      address: contractAddress,
      abi,
      functionName: "setRate",
      args: [rate],
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
          Carbon Credit Management
        </Text>

        {!accountConnected ? (
          <VStack padding={4} align="center">
            <Text>Please connect your wallet to proceed.</Text>
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
            <Box mt={6}>
              <Text fontSize="lg" fontWeight="medium">
                Balance:
              </Text>
              {isLoading ? (
                <Text>Loading...</Text>
              ) : isError ? (
                <Text color="red.500">Error fetching balance</Text>
              ) : (
                <Text fontSize="lg" fontWeight="bold">
                  {balance?.formatted} {balance?.symbol}
                </Text>
              )}
            </Box>
            <Button mt={4} colorScheme="red" onClick={() => disconnect()}>
              Disconnect Wallet
            </Button>

            <form onSubmit={mintNFT}>
              <Box mt={6}>
                <label htmlFor="to">Recipient Address</label>
                <Input
                  id="to"
                  placeholder="Enter Recipient Address"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  required
                />
              </Box>
              <Box mt={4}>
                <label htmlFor="typeofcredit">Type of Credit</label>
                <Input
                  id="typeofcredit"
                  placeholder="Enter Type of Credit"
                  value={typeofcredit}
                  onChange={(e) => setTypeOfCredit(e.target.value)}
                  required
                />
              </Box>
              <Box mt={4}>
                <label htmlFor="quantity">Quantity</label>
                <Input
                  id="quantity"
                  placeholder="Enter Quantity"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                />
              </Box>
              <Box mt={4}>
                <label htmlFor="certificateURI">Certificate URI</label>
                <Input
                  id="certificateURI"
                  placeholder="Enter Certificate URI"
                  value={certificateURI}
                  onChange={(e) => setCertificateURI(e.target.value)}
                  required
                />
              </Box>
              <Box mt={4}>
                <Text>Expiry Date</Text>
                <DatePicker
                  id="expiryDate"
                  selected={expiryDate ? new Date(expiryDate) : null}
                  onChange={(date: Date | null) => setExpiryDate(date)}
                  dateFormat="dd/MM/yyyy"
                  minDate={new Date()}
                  placeholderText="DD/MM/YYYY"
                  required
                />
              </Box>

              <Button type="submit" mt={4} colorScheme="teal">
                Mint
                {/* {isPending ? "Confirming..." : "Mint"} */}
              </Button>
            </form>

            <form onSubmit={submitTransfer}>
              <Box mt={6}>
                <label htmlFor="to">Recipient Address</label>
                <Input
                  id="to"
                  placeholder="Enter Recipient Address"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  required
                />
              </Box>

              <Box mt={4}>
                <label htmlFor="tokenId">Token ID to Transfer</label>
                <Input
                  id="tokenId"
                  placeholder="Enter Token ID"
                  value={tokenId}
                  onChange={(e) => setTokenId(e.target.value)}
                  required
                />
              </Box>
              <Box mt={4}>
                <label htmlFor="paymentAmount">Payment Amount (ETH)</label>
                <Input
                  id="paymentAmount"
                  placeholder="Enter Payment Amount"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  required
                  readOnly={isRateLoading || isRateError}
                />
              </Box>

              <Button type="submit" mt={4} colorScheme="blue">
                Transfer Credit
                {/* {isPending ? "Confirming..." : "Transfer Credit"} */}
              </Button>
            </form>

            <form onSubmit={retireNFT}>
              <Box mt={6}>
                <Text>Retire Token ID</Text>
                <Input
                  placeholder="Token ID to Retire"
                  value={tokenId}
                  onChange={(e) => setTokenId(e.target.value)}
                  required
                />
                <Button type="submit" mt={4} colorScheme="orange">
                  Retire NFT
                </Button>
              </Box>
            </form>

            <form onSubmit={addNewMinter}>
              <Box mt={6}>
                <Text>New Minter Address</Text>
                <Input
                  placeholder="New Minter Address"
                  value={newMinter}
                  onChange={(e) => setNewMinter(e.target.value)}
                  required
                />
                <Button type="submit" mt={4} colorScheme="blue">
                  Add Minter
                </Button>
              </Box>
            </form>

            <form onSubmit={updateRate}>
              <Box mt={6}>
                <Text>New Rate</Text>
                <Input
                  placeholder="Set Rate"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  required
                />
                <Button type="submit" mt={4} colorScheme="purple">
                  Set Rate
                </Button>
              </Box>
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
