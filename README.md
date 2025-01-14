# Carbon Credit NFT Application

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)  
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/tanish35/CarbonCredits/pulls)  
[![Live Deployment](https://img.shields.io/badge/live-deployed-green.svg)](https://ecox.wedevelopers.online)

This application is designed to manage and trade carbon credit NFTs. It ensures transparency, traceability, and compliance through blockchain technology. Below are the steps to set up and run the backend and frontend of the app.

---

## Key Features
- **Automated Minting:** Verified carbon credits are auto-minted as NFTs via smart contracts.
- **Verification with Gemini:** Green companies are authenticated using Gemini's identity and compliance APIs, enabling secure and trusted NFT minting.
- **Auction Mechanism:** Chainlink automation enables decentralized auctions for fair pricing.
- **Off-Chain Record Synchronization:** Real-time updates using WebSockets for seamless integration.
- **Smart Contracts Compliance:** Ensures verification, traceability, and fraud prevention.
- **Global Accessibility:** Decentralized platform for buyers and sellers worldwide.

---

## Setup and Run

### Backend
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Fill up the `.env` file according to the `.env.example` file.
3. Start the backend by running:
   ```bash
   npm run dev:all
   ```
   This command runs the following files simultaneously:
   - `index.ts`
   - `NFTEventListener.ts`
   - `MarketplaceEventListener.ts`

### Frontend
1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Fill up the `.env.local` file according to the `.env.example` file.
3. Start the frontend by running:
   ```bash
   npm run dev
   ```

---

## Live Deployment
The application is live and deployed at:  
[**ecox.wedevelopers.online**](https://ecox.wedevelopers.online)

---

## Contributions
We welcome contributions to improve this project!  
Feel free to fork the repository, make your changes, and submit a pull request.  

For any issues or feature suggestions, [open an issue here](https://github.com/tanish35/CarbonCredits/issues).

--- 

## Notes
- Ensure that your blockchain node URL, contract addresses, and other environment variables are correctly set in the `.env` and `.env.local` files.
- Use the provided `.env.example` file as a reference to configure the required environment variables.
