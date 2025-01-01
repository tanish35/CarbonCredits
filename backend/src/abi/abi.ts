export const abi = [
    {
        inputs: [
          { internalType: "address", name: "to", type: "address" },
          { internalType: "string", name: "typeofcredit", type: "string" },
          { internalType: "uint256", name: "quantity", type: "uint256" },
          { internalType: "string", name: "certificateURI", type: "string" },
          { internalType: "uint256", name: "expiryDate", type: "uint256" },
          { internalType: "uint256", name: "rate", type: "uint256" },
        ],
        name: "mint",
        outputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
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
        inputs: [
          { internalType: "uint256", name: "tokenId", type: "uint256" },
          { internalType: "uint256", name: "rate", type: "uint256" },
        ],
        name: "setRate",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
    ];
